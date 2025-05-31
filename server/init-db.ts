import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";
import { products, users } from "../shared/schema";
import { hashPassword } from "./auth";

const sampleProducts = [
  {
    name: "iPhone 15 Pro",
    description: "The latest iPhone with advanced features",
    price: 119900,
    category: "Mobile Phones",
    imageUrl: "/products/iphone15.jpg",
    stock: 15,
  },
  {
    name: "Samsung Galaxy S23",
    description: "Premium Android smartphone with excellent camera",
    price: 89900,
    category: "Mobile Phones",
    imageUrl: "/products/galaxy-s23.jpg",
    stock: 12,
  },
  {
    name: "MacBook Air M2",
    description: "Ultra-light laptop with powerful M2 chip",
    price: 99900,
    category: "Laptops",
    imageUrl: "/products/macbook-air.jpg",
    stock: 8,
  },
];

const adminUser = {
  username: "admin",
  password: "$2b$10$s0i9TvNtjlw20VF88sQR4OrTtYnYFm.KQ6QrxqEZ8O.m3fe5WomB2", // "admin123"
  role: "admin",
};

async function migrate() {
  console.log("Starting database migration...");

  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres.dewmzjpvxkdbofbmrygc:Kydneq-pabsan-tibgu1@aws-0-eu-central-1.pooler.supabase.com:5432/postgres";

  const client = postgres(connectionString, {
    ssl: { rejectUnauthorized: false },
    max: 1,
  });

  const db = drizzle(client, { schema });

  try {
    console.log("Creating tables if they don't exist...");

    const existingProducts = await db.select().from(products);
    if (existingProducts.length === 0) {
      console.log("Seeding products...");
      await db.insert(products).values(sampleProducts);
      console.log(`Inserted ${sampleProducts.length} products`);
    }

    const existingAdmin = await db
      .select()
      .from(users)
      .where(schema.eq(users.username, adminUser.username));
    if (existingAdmin.length === 0) {
      console.log("Creating admin user...");
      const hashedPassword = await hashPassword("admin123");
      await db.insert(users).values({ ...adminUser, password: hashedPassword });
      console.log("Admin user created");
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

// Export for use in other files
export { migrate };

// Run migration
migrate();