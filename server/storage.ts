import { User, InsertUser, Product, Order, CartItem } from "@shared/schema";
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
  
  // Order operations
  createOrder(userId: number, items: CartItem[], total: number): Promise<Order>;
  getOrders(userId: number): Promise<Order[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Seed products
    const products: Product[] = [
      {
        id: 1,
        name: "iPhone 15 Pro",
        description: "Latest iPhone with dynamic island and USB-C",
        price: 99900,
        category: "phones",
        imageUrl: "https://placehold.co/400x400",
        stock: 10
      },
      {
        id: 2,
        name: "MacBook Pro 16",
        description: "Powerful laptop with M2 chip",
        price: 249900,
        category: "laptops",
        imageUrl: "https://placehold.co/400x400",
        stock: 5
      },
      {
        id: 3,
        name: "AirPods Pro",
        description: "Premium wireless earbuds with noise cancellation",
        price: 24900,
        category: "accessories",
        imageUrl: "https://placehold.co/400x400",
        stock: 20
      }
    ];

    products.forEach(p => this.products.set(p.id, p));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createOrder(userId: number, items: CartItem[], total: number): Promise<Order> {
    const id = this.currentId++;
    const order: Order = {
      id,
      userId,
      items: items,
      total,
      status: "pending",
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }
}

export const storage = new MemStorage();
