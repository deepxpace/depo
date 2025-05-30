import express from "express";
import { setupAuth } from "../server/auth";
import { registerRoutes } from "../server/routes";
import cors from "cors";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up authentication
setupAuth(app);

// Register all routes
await registerRoutes(app);

export default app;