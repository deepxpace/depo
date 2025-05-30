import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "../server/routes";
import { setupAuth } from "../server/auth";
import { testConnection } from "../server/db";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test database connection and setup routes
export default async function handler(req: Request, res: Response) {
  try {
    await testConnection();
    await setupAuth(app);
    const server = await registerRoutes(app);
    return app(req, res);
  } catch (error) {
    console.error("Failed to initialize server:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}