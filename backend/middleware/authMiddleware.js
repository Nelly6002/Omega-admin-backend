import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../database/db.js";
dotenv.config();

// Verifies either local JWT (JWT_SECRET) or Supabase Auth token.
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  // If SUPABASE_URL is provided, try verifying via Supabase /auth/v1/user
  if (process.env.SUPABASE_URL) {
    try {
      const userResp = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (userResp.ok) {
        const supaUser = await userResp.json();
        // Try to look up local user by email to get role/id
        if (supaUser?.email) {
          const dbRes = await pool.query("SELECT id, role FROM users WHERE email=$1", [supaUser.email]);
          const local = dbRes.rows[0] || null;
          
          if (!local) {
            return res.status(403).json({ 
              success: false, 
              message: "User not found in local database. Please contact administrator." 
            });
          }
          
          req.user = {
            id: local.id,
            email: supaUser.email,
            supabase_id: supaUser.id,
            role: local.role
          };
          return next();
        } else {
          return res.status(401).json({ success: false, message: "Invalid user data from Supabase" });
        }
      } else {
        // Supabase verification failed
        const errorData = await userResp.json().catch(() => ({}));
        console.error('Supabase token verification failed:', userResp.status, errorData);
        return res.status(401).json({ 
          success: false, 
          message: errorData.message || "Invalid or expired token" 
        });
      }
    } catch (err) {
      console.error('Supabase token verification error:', err.message || err);
      return res.status(500).json({ 
        success: false, 
        message: "Token verification service unavailable" 
      });
    }
  }

  // Fallback to local JWT verification if SUPABASE_URL is not set
  if (process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      console.error('Local JWT verification failed:', err.message || err);
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  }

  // No auth method configured
  return res.status(500).json({ 
    success: false, 
    message: "Authentication not configured" 
  });
};
