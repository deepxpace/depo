import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import postgres from "postgres";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import fs from 'fs';
import path from 'path';

// For Vercel Postgres or any PostgreSQL database
const connectionString = process.env.DATABASE_URL || "postgresql://postgres.dewmzjpvxkdbofbmrygc:Kydneq-pabsan-tibgu1@aws-0-eu-central-1.pooler.supabase.com:5432/postgres";

// Variables to track which database is being used
let db: any;
let pool: any;
let isUsingPostgres = false;
let pgClient: any = null;

// Check if SQLite database exists (for local development)
const sqliteDbPath = path.join(process.cwd(), 'neptech.db');
const sqliteExists = fs.existsSync(sqliteDbPath);

// Try to connect to PostgreSQL first, fall back to SQLite if needed
async function initDb() {
  try {
    console.log("🔄 Attempting to connect to PostgreSQL database...");
    const queryClient = postgres(connectionString, {
      ssl: { rejectUnauthorized: false },
      connect_timeout: 15,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      max: 10,
    });
    
    // Test the connection with a simple query
    await queryClient`SELECT 1`;
    
    // If successful, use PostgreSQL
    db = drizzle(queryClient, { schema });
    isUsingPostgres = true;
    pgClient = queryClient;
    pool = queryClient;
    console.log("✅ Connected to PostgreSQL database");
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    console.log("🔄 Falling back to SQLite database");
    
    // If PostgreSQL connection fails, use SQLite
    const sqlite = new Database(sqliteDbPath);
    db = drizzleSqlite(sqlite, { schema });
    isUsingPostgres = false;
    pool = sqlite;
    console.log("✅ Connected to SQLite database");
    return true;
  }
}

// Function to test database connection
export async function testConnection() {
  // Initialize the database if it hasn't been initialized yet
  if (!db) {
    await initDb();
  }
  
  try {
    console.log("🔄 Testing connection to database...");
    if (isUsingPostgres && pgClient) {
      const result = await pgClient`SELECT NOW() as current_time`;
      console.log("✅ PostgreSQL connection successful:", result[0].current_time);
    } else {
      console.log("✅ SQLite connection successful");
    }
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    throw error;
  }
}

// Initialize database on module import, but don't use top-level await
initDb().catch(error => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});

// Export database and related utilities
export { db, pool, isUsingPostgres as isPostgres };