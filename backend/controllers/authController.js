import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../database/db.js";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  try {
    console.log('Register attempt - Full request body:', req.body);
    console.log('Database pool:', pool ? 'Exists' : 'Missing');
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      console.log('Missing fields - Name:', name, 'Email:', email, 'Password:', password ? 'Provided' : 'Missing');
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    // Check if user already exists FIRST
    console.log('Checking if user already exists...');
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }

    console.log('Hashing password...');
    const hashed = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
    console.log('Inserting new user into database...');
    
    const result = await pool.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at`,
      [name, email, hashed]
    );
    
    console.log('User registered successfully:', result.rows[0]);
    res.status(201).json({ 
      success: true, 
      message: "User registered successfully", 
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Registration error details:');
    console.error('Error name:', err.name);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    if (err.code === '23505') {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Internal server error during registration" 
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    console.log('Querying database for user:', email);
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      console.log('User not found:', email);
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const user = result.rows[0];
    console.log('User found, verifying password');
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid password" 
      });
    }

    console.log('Password verified, generating token');
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: "1d" }
    );

    console.log('Login successful for user:', email);
    res.json({
      success: true,
      token,
      data: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'An error occurred during login'
    });
  }
};


