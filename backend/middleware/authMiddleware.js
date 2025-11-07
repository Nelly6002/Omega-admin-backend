import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../database/db.js";
dotenv.config();

// Verifies either local JWT (JWT_SECRET) or Supabase Auth token.
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  // If SUPABASE_URL is provided, try verifying via Supabase /auth/v1/user
  if (process.env.SUPABASE_URL) {
    try {
      const userResp = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
console.log(userResp);

      if (userResp.ok) {
        const supaUser = await userResp.json();
        // Try to look up local user by email to get role/id
        if (supaUser?.email) {
          const dbRes = await pool.query("SELECT id, role FROM users WHERE email=$1", [supaUser.email]);
          const local = dbRes.rows[0] || null;
          req.user = {
            id: local?.id || null,
            email: supaUser.email,
            supabase_id: supaUser.id,
            role: local?.role || 'user'
          };
          return next();
        }
      }
      // If supabase verification failed, fall through to local JWT check
    } catch (err) {
      console.error('Supabase token verification error:', err.message || err);
      // continue to try local JWT
    }
  }

  // Fallback to local JWT verification
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error('Local JWT verification failed:', err.message || err);
//     res.status(401).json({ message: "Invalid token" });
//   }
};
