require('dotenv').config();
const knex = require('knex');

async function testConnection() {
  const db = knex({
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  });

  try {
    console.log('Testing Supabase connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    const result = await db.raw('SELECT NOW() as current_time');
    console.log('✅ Connection successful!', result.rows[0]);
    
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    await db.destroy();
    process.exit(1);
  }
}

testConnection();