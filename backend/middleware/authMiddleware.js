// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { supabase } from "../database/supabase.js";
dotenv.config();

// Simple JWT verification middleware for Supabase
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    console.log('Verifying token...');

    // Verify JWT token (the one you generate in login)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Get user from database to verify they still exist and get latest role
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      console.error('User not found in database:', error);
      return res.status(401).json({ 
        success: false, 
        message: "User not found or token invalid" 
      });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    console.log('User authenticated:', req.user.email, 'Role:', req.user.role);
    next();
    
  } catch (err) {
    console.error('Auth middleware error:', err.message);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "Authentication failed" 
    });
  }
};

// Admin role check middleware
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ 
      success: false, 
      message: "Admin access required" 
    });
  }
  
  console.log('Admin access granted for:', req.user.email);
  next();
};

// Optional: Middleware to require authentication but not specific role
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }
  next();
};