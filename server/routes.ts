import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Authentication middleware
  function requireAuth(req: any, res: any, next: any) {
    if (!req.isAuthenticated() || !req.user) {
      console.log('Authentication failed - user not logged in');
      return res.status(401).json({ message: "Must be logged in" });
    }
    next();
  }

  // Categories routes
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await db('categories').select('*').orderBy('name');
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, featured, search, limit = 50, offset = 0 } = req.query;
      let query = db('products')
        .select(
          'products.*',
          'categories.name as category_name'
        )
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .where('products.stock', '>', 0);

      // Apply filters
      if (category) {
        query = query.where('products.category_id', category);
      }
      
      if (featured === 'true') {
        query = query.where('products.featured', true);
      }
      
      if (search) {
        query = query.where(function() {
          this.where('products.name', 'like', `%${search}%`)
              .orWhere('products.description', 'like', `%${search}%`);
        });
      }

      const products = await query
        .orderBy('products.created_at', 'desc')
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await db('products')
        .select(
          'products.*',
          'categories.name as category_name'
        )
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .where('products.id', req.params.id)
        .first();

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { name, description, price, stock, image_url, category_id, featured } = req.body;
      
      const [product] = await db('products')
        .insert({
          name,
          description,
          price,
          stock,
          image_url,
          category_id,
          featured: featured || false
        })
        .returning('*');

      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const deleted = await db('products').where('id', req.params.id).del();
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.sendStatus(200);
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get("/api/cart", requireAuth, async (req, res) => {
    try {
      const cartItems = await db('cart_items')
        .select(
          'cart_items.*',
          'products.name',
          'products.price',
          'products.image_url',
          'products.stock'
        )
        .join('products', 'cart_items.product_id', 'products.id')
        .where('cart_items.user_id', req.user.id);

      res.json(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", requireAuth, async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      
      // Check if product exists and has enough stock
      const product = await db('products').where('id', productId).first();
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      // Check if item already exists in cart
      const existingItem = await db('cart_items')
        .where({ user_id: req.user.id, product_id: productId })
        .first();

      let cartItem;
      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        if (product.stock < newQuantity) {
          return res.status(400).json({ message: "Insufficient stock" });
        }
        
        [cartItem] = await db('cart_items')
          .where({ user_id: req.user.id, product_id: productId })
          .update({ quantity: newQuantity })
          .returning('*');
      } else {
        // Create new cart item
        [cartItem] = await db('cart_items')
          .insert({
            user_id: req.user.id,
            product_id: productId,
            quantity
          })
          .returning('*');
      }

      res.status(201).json(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:productId", requireAuth, async (req, res) => {
    try {
      const { quantity } = req.body;
      const { productId } = req.params;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        await db('cart_items')
          .where({ user_id: req.user.id, product_id: productId })
          .del();
        return res.sendStatus(200);
      }

      // Check stock
      const product = await db('products').where('id', productId).first();
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      const [cartItem] = await db('cart_items')
        .where({ user_id: req.user.id, product_id: productId })
        .update({ quantity })
        .returning('*');

      res.json(cartItem);
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ message: "Failed to update cart" });
    }
  });

  app.delete("/api/cart/:productId", requireAuth, async (req, res) => {
    try {
      const deleted = await db('cart_items')
        .where({ user_id: req.user.id, product_id: req.params.productId })
        .del();
      
      if (!deleted) {
        return res.status(404).json({ message: "Item not found in cart" });
      }
      res.sendStatus(200);
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Orders routes
  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const { items, total, address, paymentMethod } = req.body;
      
      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must contain valid items" });
      }
      
      if (!total || !address) {
        return res.status(400).json({ message: "Order total and address are required" });
      }

      // Start transaction
      const result = await db.transaction(async (trx) => {
        // Create order
        const [order] = await trx('orders')
          .insert({
            user_id: req.user.id,
            total_amount: total,
            shipping_address: typeof address === 'string' ? address : JSON.stringify(address),
            payment_method: paymentMethod || 'pending'
          })
          .returning('*');

        // Create order items and update stock
        for (const item of items) {
          // Check stock
          const product = await trx('products').where('id', item.productId).first();
          if (!product || product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.productId}`);
          }

          // Create order item
          await trx('order_items').insert({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price
          });

          // Update product stock
          await trx('products')
            .where('id', item.productId)
            .decrement('stock', item.quantity);
        }

        // Clear user's cart
        await trx('cart_items').where('user_id', req.user.id).del();

        return order;
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Failed to create order", error: String(error) });
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      let query = db('orders')
        .select(
          'orders.*',
          'users.name as user_name',
          'users.email as user_email'
        )
        .join('users', 'orders.user_id', 'users.id');

      // If user is admin, return all orders, otherwise only their orders
      if (req.user.role !== "admin") {
        query = query.where('orders.user_id', req.user.id);
      }

      const orders = await query.orderBy('orders.created_at', 'desc');

      // Get order items for each order
      for (const order of orders) {
        const orderItems = await db('order_items')
          .select(
            'order_items.*',
            'products.name',
            'products.image_url'
          )
          .join('products', 'order_items.product_id', 'products.id')
          .where('order_items.order_id', order.id);
        
        order.items = orderItems;
      }

      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Wishlist routes
  app.post("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      // Check if already in wishlist
      const existing = await db('wishlist_items')
        .where({ user_id: req.user.id, product_id: productId })
        .first();

      if (existing) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }

      const [item] = await db('wishlist_items')
        .insert({
          user_id: req.user.id,
          product_id: productId
        })
        .returning('*');

      res.status(201).json(item);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.get("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const wishlist = await db('wishlist_items')
        .select(
          'wishlist_items.*',
          'products.name',
          'products.price',
          'products.image_url',
          'products.stock'
        )
        .join('products', 'wishlist_items.product_id', 'products.id')
        .where('wishlist_items.user_id', req.user.id);

      res.json(wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.delete("/api/wishlist/:productId", requireAuth, async (req, res) => {
    try {
      const deleted = await db('wishlist_items')
        .where({ user_id: req.user.id, product_id: req.params.productId })
        .del();
      
      if (!deleted) {
        return res.status(404).json({ message: "Item not found in wishlist" });
      }
      res.sendStatus(200);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  app.get("/api/wishlist/check/:productId", requireAuth, async (req, res) => {
    try {
      const item = await db('wishlist_items')
        .where({ user_id: req.user.id, product_id: req.params.productId })
        .first();
      
      res.json({ isInWishlist: !!item });
    } catch (error) {
      console.error('Error checking wishlist:', error);
      res.status(500).json({ message: "Failed to check wishlist" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}