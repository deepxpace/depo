import express, { Request, Response } from "express";
import cors from "cors";
import { registerRoutes } from "../server/routes";
import { setupAuth } from "../server/auth";
import { testConnection, runMigrations } from "../server/db";

// Force fresh deployment - TypeScript fixes applied
// Create Express application
const app = express();

// Configure CORS for production
const isProduction = process.env.NODE_ENV === 'production';
app.use(cors({
  origin: isProduction 
    ? ['https://depo-1x8z60su3-deepxpaces-projects.vercel.app', /\.vercel\.app$/]
    : true, // Allow all origins in development
  credentials: true, // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add logging middleware (simplified for serverless)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
  });
  
  next();
});

// Initialize application once
let initialized = false;
let initializePromise: Promise<void> | null = null;

async function initialize() {
  if (initialized) return;
  if (initializePromise) return initializePromise;
  
  initializePromise = (async () => {
    try {
      console.log(`🚀 Initializing NepTechMart API for ${process.env.NODE_ENV || 'development'}...`);
      
      // Run database migrations
      await runMigrations();
      
      // Test database connection
      await testConnection();
      
      // Set up authentication
      await setupAuth(app);
      
      // Register all routes
      await registerRoutes(app);
      
      // Add health check endpoint (before error handler)
      app.get('/api/health', (req, res) => {
        res.json({ 
          status: 'ok', 
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString()
        });
      });
      
      // Add error handler
      app.use((err: any, _req: Request, res: Response, _next: any) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error(`❌ Error: ${message}`);
        res.status(status).json({ message });
      });
      
      initialized = true;
      console.log('✅ API server initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize API server:', error);
      throw error;
    }
  })();
  
  return initializePromise;
}

// Handler function for Vercel
export default async (req: Request, res: Response) => {
  try {
    // Initialize app on first request
    await initialize();
    
    // Handle the request using Express
    return app(req, res);
  } catch (error) {
    console.error('❌ Request handling error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Something went wrong') : 'Something went wrong'
    });
  }
};