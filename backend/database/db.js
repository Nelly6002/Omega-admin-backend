import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

// Verify required environment variables
const requiredEnvVars = ['PG_USER', 'PG_PASSWORD', 'PG_HOST', 'PG_PORT', 'PG_DATABASE'];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

const pool = new Pool({
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the connection immediately
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    } else {
        console.log('Database connected successfully');
    }
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

// Also export the raw pool for places that rely on pool.query or transactions.
export { pool };
