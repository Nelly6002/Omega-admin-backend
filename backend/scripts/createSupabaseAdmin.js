import dotenv from "dotenv";
import { pool } from "../database/db.js";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env before running this script."
  );
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";

async function createSupabaseUser() {
  const url = `${SUPABASE_URL}/auth/v1/admin/users`;
  const body = {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: ADMIN_NAME, role: "admin" },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Failed to create user: ${data.message || res.statusText}`);
  }

  return data;
}

async function syncLocalUser(supabaseId) {
  // Try to update existing local user by email
  const update = await pool.query(
    "UPDATE users SET supabase_id = $1 WHERE email = $2 RETURNING id, email, role",
    [supabaseId, ADMIN_EMAIL]
  );

  if (update.rows.length > 0) {
    console.log(
      "Updated existing local user with supabase_id:",
      update.rows[0]
    );
    return update.rows[0];
  }

  // Otherwise create a new local user
  const insert = await pool.query(
    "INSERT INTO users (name, email, password, role, supabase_id) VALUES ($1,$2,$3,$4,$5) RETURNING id, email, role",
    [ADMIN_NAME, ADMIN_EMAIL, "<<supabase-managed>>", "admin", supabaseId]
  );
  console.log("Created new local admin user:", insert.rows[0]);
  return insert.rows[0];
}

async function run() {
  try {
    console.log("Creating Supabase auth user...");
    const data = await createSupabaseUser();
    console.log("Supabase response:", data);
    if (data?.id) {
      console.log("Supabase user created with id:", data.id);
      await syncLocalUser(data.id);
      console.log(
        "Admin user is ready. You can now login via the frontend using the admin credentials."
      );
    } else {
      console.error("Failed to create Supabase user:", data);
    }
  } catch (err) {
    console.error("Error creating/syncing admin:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
