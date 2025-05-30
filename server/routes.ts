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
    console.log('Auth check:', {
      isAuthenticated: req.isAuthenticated(),
      hasUser: !!req.user,
      sessionID: req.sessionID,
      userId: req.user?.id
    });
    
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Must be logged in" });
    }
    next();
  }

  // Orders routes
  app.post("/api/orders", requireAuth, async (req, res) => {
    const { items, total, address, paymentMethod } = req.body;
    const order = await storage.createOrder(req.user.id, items, total, address, paymentMethod);
    res.status(201).json(order);
  });

  app.post("/api/orders/:id/pay", requireAuth, async (req, res) => {
    // Payment processing will be implemented with actual payment gateway
    res.json({ status: "payment_initiated", orderId: req.params.id });
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    const orders = await storage.getOrders(req.user.id);
    res.json(orders);
  });

  const httpServer = createServer(app);
  return httpServer;
}