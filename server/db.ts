import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Create the connection - Supabase PostgreSQL URL
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Kydneq-pabsan-tibgu1@db.dewmzjpvxkdbofbmrygc.supabase.co:5432/postgres";

// For query purposes
const queryClient = postgres(connectionString, {
  ssl: connectionString.includes('supabase.co') || connectionString.includes('neon.tech') || process.env.NODE_ENV === "production" 
    ? { rejectUnauthorized: false } 
    : false,
});

// For session store
export const pool = queryClient;

export const db = drizzle(queryClient, { schema });