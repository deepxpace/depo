import { User, InsertUser, Product, Order, CartItem } from "@shared/schema";
import { users, products, orders } from "@shared/schema";
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
    const [order] = await db
      .insert(orders)
      .values({
        userId,
        total,
        status: "pending",
        items: JSON.stringify(items),
        paymentMethod: paymentMethod || "cash_on_delivery",
        address: address || {},
      })
      .returning();
    return order;
  }

  async getOrders(userId: number): Promise<Order[]> {
    try {
      return await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error("Error getting orders:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();