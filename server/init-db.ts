import { db, initializeDatabase as initDbConnection } from "./db";
import { users, products } from "@shared/schema";
import { hashPassword } from "./auth";

async function initializeDatabase() {
  try {
    // Wait for the database connection to be established
    await initDbConnection();

    console.log("Initializing database with sample data...");

    // Create vendor account
    const vendorPassword = await hashPassword("vendor123");
    await db
      .insert(users)
      .values({
        username: "vendor",
        password: vendorPassword,
        role: "vendor",
      })
      .onConflictDoNothing();

    // Create sample products
    const sampleProducts = [
      {
        name: "Fire-Boltt Phoenix Smart Watch",
        description:
          "1.3″ Bluetooth Calling Smartwatch, AI Voice Assistant, 120+ Sports Modes, SpO2, Heart Rate Monitoring",
        price: 899900, // NPR 8,999
        category: "Smartwatch",
        imageUrl:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        stock: 25,
      },
      {
        name: "Samsung Galaxy Buds Pro",
        description:
          "True Wireless Earbuds with Active Noise Cancellation, 360 Audio, Water Resistant",
        price: 1499900, // NPR 14,999
        category: "Audio",
        imageUrl:
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
        stock: 15,
      },
      {
        name: "iPhone 15 Pro Max",
        description:
          "256GB, Titanium Build, A17 Pro Chip, Advanced Camera System",
        price: 18999900, // NPR 189,999
        category: "Smartphone",
        imageUrl:
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
        stock: 8,
      },
      {
        name: "MacBook Air M3",
        description:
          "13-inch, M3 chip, 8GB RAM, 256GB SSD, Space Gray",
        price: 14999900, // NPR 149,999
        category: "Laptop",
        imageUrl:
          "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500",
        stock: 5,
      },
    ];

    for (const product of sampleProducts) {
      await db.insert(products).values(product).onConflictDoNothing();
    }

    console.log("Database initialized successfully!");
    console.log("Vendor account: username='vendor', password='vendor123'");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Export for use in other files
export { initializeDatabase };

// Run initialization
initializeDatabase().then(() => process.exit(0));