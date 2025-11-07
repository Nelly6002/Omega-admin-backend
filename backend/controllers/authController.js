import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../database/db.js";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  try {
    console.log('Register attempt:', req.body);
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    console.log('Hashing password...');
    const hashed = await bcrypt.hash(password, 10);
    
    console.log('Inserting new user into database...');
    const result = await pool.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
      [name, email, hashed]
    );
    
    console.log('User registered successfully:', result.rows[0].email);
    res.json({ 
      success: true, 
      message: "User registered successfully", 
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === '23505') { // Unique violation error code
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: err.message || "Error during registration" 
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


