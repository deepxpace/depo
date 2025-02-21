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

  // Orders routes
  app.post("/api/orders", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Must be logged in to create orders");
    }

    const { items, total } = req.body;
    const order = await storage.createOrder(req.user.id, items, total);
    res.status(201).json(order);
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
