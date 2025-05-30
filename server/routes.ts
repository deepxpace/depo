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

  // Orders routes
  app.post("/api/orders", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Must be logged in to create orders");
    }

    const { items, total, address, paymentMethod } = req.body;
    const order = await storage.createOrder(req.user.id, items, total, address, paymentMethod);
    res.status(201).json(order);
  });

  app.post("/api/orders/:id/pay", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Must be logged in to make payment");
    }
    // Payment processing will be implemented with actual payment gateway
    res.json({ status: "payment_initiated", orderId: req.params.id });
  });

  app.get("/api/orders", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Must be logged in to view orders");
    }

    const orders = await storage.getOrders(req.user.id);
    res.json(orders);
  });

  const httpServer = createServer(app);
  return httpServer;
}
