import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;
// Using the connection string from the .env file, as suggested by the lead.
// We also add a fallback for local development if DATABASE_URL is not set.
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  // The SSL configuration is crucial for production databases.
  // We make it conditional so it only runs in production.
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// --- ADD THIS: Error Handling ---
// The pool will emit an error if a backend error or network partition happens.
// This is critical for a robust application. It prevents silent failures.
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// --- IMPROVE THIS: The Export ---
// The lead exported the pool directly. This works, but it forces every model
// file to know how to use the pool (e.g., `pool.query(...)`).
// A cleaner pattern is to export a simple query function.
// This abstracts away the pool implementation.
export const dbQuery = (text, params) => pool.query(text, params);
