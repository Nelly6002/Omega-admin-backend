-- Row Level Security policies for Omega app
-- Run after creating tables (schema.sql)

-- Enable RLS on users table (be careful: if you rely on server-side inserts, you may need an admin policy)
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to see their own user row; admins can see everyone
CREATE POLICY IF NOT EXISTS "users_select_owner_or_admin" ON users
  FOR SELECT
  USING (
    auth.uid() = NULLIF(users.id::text, '') OR
    EXISTS (SELECT 1 FROM users u WHERE u.email = auth.jwt().email AND u.role = 'admin')
  );

-- Note: Depending on your auth integration you may need to store supabase id on users table.

-- Businesses table RLS
ALTER TABLE IF EXISTS businesses ENABLE ROW LEVEL SECURITY;

-- Insert: authenticated user must set user_id to their own id
CREATE POLICY IF NOT EXISTS "insert_own_business" ON businesses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Select: owners or admin can read
CREATE POLICY IF NOT EXISTS "select_own_business_or_admin" ON businesses
  FOR SELECT
  USING (
    auth.uid() = user_id::text OR
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid()::int AND u.role = 'admin')
  );

-- Update/Delete: owners or admin
CREATE POLICY IF NOT EXISTS "modify_own_business_or_admin" ON businesses
  FOR UPDATE
  USING (
    auth.uid() = user_id::text OR
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid()::int AND u.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = user_id::text OR
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid()::int AND u.role = 'admin')
  );

-- Admin full access (alternative policy): if you'd rather have a single admin override
-- CREATE POLICY "admin_full_access" ON businesses FOR ALL
--   USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid()::int AND u.role = 'admin'))
--   WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid()::int AND u.role = 'admin'));

-- Notes:
-- - auth.uid() is a text value representing the Supabase Auth user id. If your users table uses integer ids,
--   you should store the supabase auth id (uuid/text) on the users table (e.g. supabase_id) to correlate.
-- - The examples above assume some mapping; adjust conditions to your schema (email matching, supabase_id, etc.).
