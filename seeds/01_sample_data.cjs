const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Clear existing data
  await knex('wishlist_items').del();
  await knex('cart_items').del();
  await knex('order_items').del();
  await knex('orders').del();
  await knex('products').del();
  await knex('categories').del();
  await knex('users').del();

  // Insert categories
  const categoryIds = await knex('categories').insert([
    {
      name: 'Electronics',
      description: 'Latest electronic gadgets and devices',
      image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500'
    },
    {
      name: 'Fashion',
      description: 'Trendy clothing and accessories',
      image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500'
    },
    {
      name: 'Home & Garden',
      description: 'Everything for your home and garden',
      image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'
    },
    {
      name: 'Sports',
      description: 'Sports equipment and fitness gear',
      image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
    }
  ]).returning('id');

  // Insert admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const userIds = await knex('users').insert([
    {
      name: 'Admin User',
      email: 'admin@neptechmart.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
      address: '123 Admin Street, Admin City'
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'customer',
      phone: '+1234567891',
      address: '456 Customer Street, Customer City'
    }
  ]).returning('id');

  // Insert products
  await knex('products').insert([
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

  console.log('✅ Database seeded successfully');
};