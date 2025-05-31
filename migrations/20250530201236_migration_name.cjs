exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.enum('role', ['customer', 'admin']).defaultTo('customer');
      table.string('phone');
      table.text('address');
      table.timestamps(true, true);
    })
    .createTable('categories', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('description');
      table.string('image_url');
      table.timestamps(true, true);
    })
    .createTable('products', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('description').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.integer('stock').defaultTo(0);
      table.string('image_url').notNullable();
      table.json('images'); // Additional product images
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
      table.boolean('featured').defaultTo(false);
      table.timestamps(true, true);
    })
    .createTable('orders', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.decimal('total_amount', 10, 2).notNullable();
      table.enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']).defaultTo('pending');
      table.text('shipping_address').notNullable();
      table.string('payment_method');
      table.string('payment_status').defaultTo('pending');
      table.timestamps(true, true);
    })
    .createTable('order_items', function(table) {
      table.increments('id').primary();
      table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.integer('quantity').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.timestamps(true, true);
    })
    .createTable('cart_items', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.integer('quantity').notNullable();
      table.timestamps(true, true);
      table.unique(['user_id', 'product_id']);
    })
    .createTable('wishlist_items', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.timestamps(true, true);
      table.unique(['user_id', 'product_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('wishlist_items')
    .dropTableIfExists('cart_items')
    .dropTableIfExists('order_items')
    .dropTableIfExists('orders')
    .dropTableIfExists('products')
    .dropTableIfExists('categories')
    .dropTableIfExists('users');
};
