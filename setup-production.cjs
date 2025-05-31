require('dotenv').config();
const knex = require('knex');
const bcrypt = require('bcrypt');

async function setupProduction() {
  const db = knex({
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: { min: 2, max: 10 }
  });

  try {
    console.log('🚀 Setting up production database...');

    // Drop existing tables to start fresh (be careful in production!)
    console.log('🧹 Cleaning up existing tables...');
    await db.raw('DROP TABLE IF EXISTS wishlist_items CASCADE');
    await db.raw('DROP TABLE IF EXISTS cart_items CASCADE');
    await db.raw('DROP TABLE IF EXISTS order_items CASCADE');
    await db.raw('DROP TABLE IF EXISTS orders CASCADE');
    await db.raw('DROP TABLE IF EXISTS products CASCADE');
    await db.raw('DROP TABLE IF EXISTS categories CASCADE');
    await db.raw('DROP TABLE IF EXISTS users CASCADE');

    // Create tables with proper structure
    console.log('📊 Creating fresh tables...');
    
    // Users table
    await db.schema.createTable('users', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.enum('role', ['customer', 'admin']).defaultTo('customer');
      table.string('phone');
      table.text('address');
      table.timestamps(true, true);
    });

    // Categories table
    await db.schema.createTable('categories', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('description');
      table.string('image_url');
      table.timestamps(true, true);
    });

    // Products table
    await db.schema.createTable('products', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('description').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.integer('stock').defaultTo(0);
      table.string('image_url').notNullable();
      table.json('images');
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
      table.boolean('featured').defaultTo(false);
      table.timestamps(true, true);
    });

    // Orders table
    await db.schema.createTable('orders', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.decimal('total_amount', 10, 2).notNullable();
      table.enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']).defaultTo('pending');
      table.text('shipping_address').notNullable();
      table.string('payment_method');
      table.string('payment_status').defaultTo('pending');
      table.timestamps(true, true);
    });

    // Order items table
    await db.schema.createTable('order_items', function(table) {
      table.increments('id').primary();
      table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.integer('quantity').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.timestamps(true, true);
    });

    // Cart items table
    await db.schema.createTable('cart_items', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.integer('quantity').notNullable();
      table.timestamps(true, true);
      table.unique(['user_id', 'product_id']);
    });

    // Wishlist items table
    await db.schema.createTable('wishlist_items', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.timestamps(true, true);
      table.unique(['user_id', 'product_id']);
    });

    console.log('✅ Tables created successfully');

    // Insert categories
    console.log('🏷️ Inserting categories...');
    const categoryIds = await db('categories').insert([
      { name: 'Electronics', description: 'Latest electronic gadgets and devices', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500' },
      { name: 'Fashion', description: 'Trendy clothing and accessories', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500' },
      { name: 'Home & Garden', description: 'Everything for your home and garden', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500' },
      { name: 'Sports', description: 'Sports equipment and fitness gear', image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500' }
    ]).returning('id');

    // Insert admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db('users').insert([
      {
        name: 'Admin User',
        email: 'admin@neptechmart.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+977-1234567890',
        address: 'Kathmandu, Nepal'
      }
    ]);

    // Insert products
    console.log('📦 Inserting products...');
    await db('products').insert([
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced features and camera',
        price: 999.99,
        stock: 50,
        image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
        category_id: categoryIds[0].id || categoryIds[0],
        featured: true
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Premium Android smartphone with excellent display',
        price: 899.99,
        stock: 30,
        image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        category_id: categoryIds[0].id || categoryIds[0],
        featured: true
      },
      {
        name: 'MacBook Pro M3',
        description: 'Powerful laptop for professionals and creatives',
        price: 1999.99,
        stock: 25,
        image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
        category_id: categoryIds[0].id || categoryIds[0],
        featured: true
      },
      {
        name: 'Designer Jacket',
        description: 'Stylish and comfortable designer jacket',
        price: 199.99,
        stock: 40,
        image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500',
        category_id: categoryIds[1].id || categoryIds[1],
        featured: false
      },
      {
        name: 'Running Shoes',
        description: 'High-performance running shoes for athletes',
        price: 149.99,
        stock: 60,
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        category_id: categoryIds[3].id || categoryIds[3],
        featured: false
      },
      {
        name: 'Coffee Maker',
        description: 'Premium coffee maker for home brewing',
        price: 299.99,
        stock: 20,
        image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
        category_id: categoryIds[2].id || categoryIds[2],
        featured: true
      },
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 249.99,
        stock: 35,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        category_id: categoryIds[0].id || categoryIds[0],
        featured: true
      },
      {
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat for fitness and meditation',
        price: 49.99,
        stock: 100,
        image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
        category_id: categoryIds[3].id || categoryIds[3],
        featured: false
      }
    ]);

    console.log('✅ Production database setup complete!');
    console.log('📧 Admin login: admin@neptechmart.com / admin123');
    console.log('🌐 Your database is now ready for Vercel deployment!');
    
    await db.destroy();
  } catch (error) {
    console.error('❌ Error setting up production database:', error);
    await db.destroy();
    process.exit(1);
  }
}

setupProduction();