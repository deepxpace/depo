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
let isUsingPostgres = false;

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
    console.log("✅ Connected to PostgreSQL database");
    return { db, pool: queryClient, isUsingPostgres };
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    console.log("🔄 Falling back to SQLite database");
    
    // If PostgreSQL connection fails, use SQLite
    const sqlite = new Database(sqliteDbPath);
    db = drizzleSqlite(sqlite, { schema });
    isUsingPostgres = false;
    console.log("✅ Connected to SQLite database");
    return { db, pool: sqlite, isUsingPostgres };
  }
}

// Initialize database connection
const dbInstance = await initDb();
db = dbInstance.db;
export const pool = dbInstance.pool;
export const isPostgres = dbInstance.isUsingPostgres;
export { db };