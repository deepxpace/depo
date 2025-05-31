import knex from 'knex';
// @ts-ignore - knexfile.cjs doesn't have TypeScript definitions
import knexConfig from '../knexfile.cjs';

// Get the current environment
const environment = process.env.NODE_ENV || 'development';

// Initialize Knex with the appropriate configuration
const db = knex(knexConfig[environment]);

// Function to test database connection
export async function testConnection() {
  try {
    console.log(`🔄 Testing connection to ${environment} database...`);
    
    if (environment === 'development') {
      // For SQLite, just try a simple query
      await db.raw('SELECT 1');
      console.log("✅ SQLite connection successful");
    } else {
      // For PostgreSQL, get current time
      const result = await db.raw('SELECT NOW() as current_time');
      console.log("✅ PostgreSQL connection successful:", result.rows[0].current_time);
    }
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// Function to run migrations automatically
export async function runMigrations() {
  try {
    console.log(`🔄 Running migrations for ${environment}...`);
    await db.migrate.latest();
    console.log("✅ Migrations completed successfully");
    
    // Only seed in development
    if (environment === 'development') {
      const seedCount = await db('products').count('* as count').first();
      if (seedCount && typeof seedCount.count === 'number' && seedCount.count === 0) {
        console.log("🌱 Running seeds for development...");
        await db.seed.run();
        console.log("✅ Seeds completed successfully");
      }
    }
  } catch (error) {
    console.error("❌ Migration failed:", error instanceof Error ? error.message : 'Unknown error');
    // Don't throw error for migrations to allow app to start
  }
}

// Export database instance
export { db };