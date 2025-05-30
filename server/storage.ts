import { User, InsertUser, Product, Order, CartItem } from "@shared/schema";
import { users, products, orders, wishlist } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: Omit<Product, "id">): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;

  // Order operations
  createOrder(userId: number, items: CartItem[], total: number, address?: any, paymentMethod?: string): Promise<Order>;
  getOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>; // New method to get all orders

  // Wishlist operations
  getWishlist(userId: number): Promise<any[]>;
  isInWishlist(userId: number, productId: number): Promise<boolean>;
  addToWishlist(userId: number, productId: number): Promise<any>;
  removeFromWishlist(userId: number, productId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProducts(): Promise<Product[]> {
    try {
      return await db.select().from(products);
    } catch (error) {
      console.error("Error getting products:", error);
      return [];
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product || undefined;
    } catch (error) {
      console.error("Error getting product:", error);
      return undefined;
    }
  }

  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const result = await db.delete(products).where(eq(products.id, id));
      return true; // Assume success if no error thrown
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  }

  async createOrder(userId: number, items: CartItem[], total: number, address?: any, paymentMethod?: string): Promise<Order> {
    try {
      console.log("Creating order with data:", {
        userId,
        itemsLength: items?.length,
        total,
        paymentMethod
      });
      
      // Make sure items is never null or undefined
      if (!items || !Array.isArray(items)) {
        console.error("Invalid items for order:", items);
        throw new Error("Order items must be a valid array");
      }
      
      // Ensure address is a string
      const addressStr = typeof address === 'string' ? address : JSON.stringify(address || {});
      
      // Import the database type indicator
      const { isPostgres } = await import('./db');
      
      // Handle JSON data differently based on database type
      const itemsData = isPostgres ? items : JSON.stringify(items);
      
      console.log(`Using ${isPostgres ? 'PostgreSQL' : 'SQLite'} database. Preparing order data...`);
      
      const [order] = await db
        .insert(orders)
        .values({
          userId,
          total,
          status: "pending",
          items: itemsData,
          paymentMethod: paymentMethod || "cash_on_delivery",
          address: addressStr,
        })
        .returning();
      
      console.log("Order created successfully:", order);
      return order;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async getOrders(userId: number): Promise<Order[]> {
    try {
      const { isPostgres } = await import('./db');
      const ordersList = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));
      
      // If using SQLite, we need to parse the JSON strings
      if (!isPostgres) {
        return ordersList.map(order => ({
          ...order,
          items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
        }));
      }
      
      return ordersList;
    } catch (error) {
      console.error("Error getting orders:", error);
      return [];
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const { isPostgres } = await import('./db');
      const ordersList = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt));
      
      // If using SQLite, we need to parse the JSON strings
      if (!isPostgres) {
        return ordersList.map(order => ({
          ...order,
          items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
        }));
      }
      
      return ordersList;
    } catch (error) {
      console.error("Error getting all orders:", error);
      return [];
    }
  }

  // Wishlist operations
  async getWishlist(userId: number): Promise<any[]> {
    try {
      // Join wishlist with products to get product details
      const result = await db
        .select({
          id: wishlist.id,
          userId: wishlist.userId,
          productId: wishlist.productId,
          product: products
        })
        .from(wishlist)
        .leftJoin(products, eq(wishlist.productId, products.id))
        .where(eq(wishlist.userId, userId));
      
      return result;
    } catch (error) {
      console.error("Error getting wishlist:", error);
      return [];
    }
  }
  
  async isInWishlist(userId: number, productId: number): Promise<boolean> {
    try {
      const result = await db
        .select()
        .from(wishlist)
        .where(eq(wishlist.userId, userId))
        .where(eq(wishlist.productId, productId));
      
      return result.length > 0;
    } catch (error) {
      console.error("Error checking wishlist:", error);
      return false;
    }
  }
  
  async addToWishlist(userId: number, productId: number): Promise<any> {
    try {
      // Check if item is already in wishlist
      const existing = await db
        .select()
        .from(wishlist)
        .where(eq(wishlist.userId, userId))
        .where(eq(wishlist.productId, productId));
      
      if (existing.length > 0) {
        return existing[0]; // Item already in wishlist
      }
      
      // Add item to wishlist
      const [item] = await db
        .insert(wishlist)
        .values({ userId, productId })
        .returning();
        
      return item;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw error;
    }
  }
  
  async removeFromWishlist(userId: number, productId: number): Promise<boolean> {
    try {
      await db
        .delete(wishlist)
        .where(eq(wishlist.userId, userId))
        .where(eq(wishlist.productId, productId));
        
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();