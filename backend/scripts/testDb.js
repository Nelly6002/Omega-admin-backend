import { pool } from "../database/db.js";

const testConnection = async () => {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const connResult = await pool.query('SELECT NOW()');
    console.log('Database connected successfully:', connResult.rows[0].now);

    // Check if users table exists and has correct structure
    console.log('\nChecking users table...');
    const usersResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    
    if (usersResult.rows.length === 0) {
      console.error('Users table not found! Please run schema.sql first.');
      process.exit(1);
    }

    console.log('Users table columns:', usersResult.rows);

    // Count users
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log('\nTotal users:', userCount.rows[0].count);

    // List all users (without passwords)
    const users = await pool.query(
      'SELECT id, name, email, role, created_at FROM users'
    );
    console.log('\nExisting users:', users.rows);

    process.exit(0);
  } catch (err) {
    console.error('Database test failed:', err);
    process.exit(1);
  }
};

testConnection();