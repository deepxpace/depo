import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Products routes
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(parseInt(req.params.id));
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    const result = await storage.deleteProduct(parseInt(req.params.id));
    if (!result) {
      return res.status(404).send("Product not found");
    }
    res.sendStatus(200);
  });

  app.post("/api/products", async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  // Authentication middleware
  function requireAuth(req: any, res: any, next: any) {
    if (!req.isAuthenticated() || !req.user) {
      console.log('Authentication failed - user not logged in');
      return res.status(401).json({ message: "Must be logged in" });
    }
    next();
  }

  // Orders routes
  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      console.log("Order request payload:", req.body);
      const { items, total, address, paymentMethod } = req.body;
      
      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        console.error("Invalid items in order:", items);
        return res.status(400).json({ message: "Order must contain valid items" });
      }
      
      if (!total) {
        return res.status(400).json({ message: "Order total is required" });
      }
      
      if (!address) {
        return res.status(400).json({ message: "Shipping address is required" });
      }
      
      const order = await storage.createOrder(
        req.user.id, 
        items, 
        total, 
        JSON.stringify(address), // Ensure address is stringified 
        paymentMethod
      );
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Failed to create order", error: String(error) });
    }
  });

  app.post("/api/orders/:id/pay", requireAuth, async (req, res) => {
    // Payment processing will be implemented with actual payment gateway
    res.json({ status: "payment_initiated", orderId: req.params.id });
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      // If user is admin or vendor, return all orders
      if (req.user.role === "admin" || req.user.role === "vendor") {
        console.log(`Admin/vendor ${req.user.username} (ID: ${req.user.id}) requesting all orders`);
        const orders = await storage.getAllOrders();
        console.log(`Retrieved ${orders.length} orders for admin/vendor`);
        return res.json(orders);
      } else {
        // For regular customers, return only their orders
        console.log(`Customer ${req.user.username} (ID: ${req.user.id}) requesting their orders`);
        const orders = await storage.getOrders(req.user.id);
        console.log(`Retrieved ${orders.length} orders for customer`);
        return res.json(orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Wishlist routes
  app.post("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const { productId } = req.body;
      // Ensure productId is converted to an integer
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      const productIdInt = parseInt(productId, 10);
      if (isNaN(productIdInt)) {
        return res.status(400).json({ message: "Invalid product ID format" });
      }
      const item = await storage.addToWishlist(req.user.id, productIdInt);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/wishlist/:productId", requireAuth, async (req, res) => {
    const result = await storage.removeFromWishlist(req.user.id, parseInt(req.params.productId));
    if (!result) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }
    res.sendStatus(200);
  });

  app.get("/api/wishlist", requireAuth, async (req, res) => {
    const wishlist = await storage.getWishlist(req.user.id);
    res.json(wishlist);
  });

  app.get("/api/wishlist/check/:productId", requireAuth, async (req, res) => {
    const isInWishlist = await storage.isInWishlist(req.user.id, parseInt(req.params.productId));
    res.json({ isInWishlist });
  });

  const httpServer = createServer(app);
  return httpServer;
}