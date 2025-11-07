import bcrypt from "bcrypt";
import { pool } from "../database/db.js";
import dotenv from "dotenv";
dotenv.config();

const seedAdmin = async () => {
  try {
    console.log('Connecting to database...');
    
    // Test database connection
    const testConn = await pool.query('SELECT NOW()');
    console.log('Database connected at:', testConn.rows[0].now);

    // Verify users table exists
    console.log('Checking users table...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('Users table does not exist! Please run schema.sql first.');
      process.exit(1);
    }

    // Hash password
    console.log('Creating admin user...');
    const password = "admin123"; // Default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if admin exists
    const checkResult = await pool.query(
      "SELECT id, email FROM users WHERE email = $1",
      ["admin@example.com"]
    );

    if (checkResult.rows.length === 0) {
      // Create admin user
      const result = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role",
        ["Admin User", "admin@example.com", hashedPassword, "admin"]
      );
      console.log("Admin user created successfully:", result.rows[0]);
      console.log("You can now login with:");
      console.log("Email: admin@example.com");
      console.log("Password: admin123");
    } else {
      console.log("Admin user already exists:", checkResult.rows[0]);
    }

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:");
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();