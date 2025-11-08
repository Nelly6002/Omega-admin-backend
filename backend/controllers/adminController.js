// controllers/adminController.js
import { supabase } from "../database/supabase.js";
import { createClient } from '@supabase/supabase-js';

// Helper function to get admin Supabase client (bypasses RLS for admin operations)
const getAdminClient = () => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

// User Management with RLS
export const listAllUsers = async (req, res) => {
  try {
    // For admin operations, use service role key to bypass RLS
    const adminSupabase = getAdminClient();
    
    const { data, error } = await adminSupabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminSupabase = getAdminClient();
    
    const { data, error } = await adminSupabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({ success: false, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const adminSupabase = getAdminClient();
    
    // Create auth user
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: role || 'user' }
    });

    if (authError) throw authError;

    // Create user profile
    const { data, error } = await adminSupabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          name,
          email,
          role: role || 'user'
        }
      ])
      .select('id, name, email, role')
      .single();

    if (error) throw error;
    
    res.status(201).json({ success: true, data });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ success: false, message: "Email already exists" });
    } else {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const adminSupabase = getAdminClient();
    
    const { data, error } = await adminSupabase
      .from('users')
      .update({ name, email, role })
      .eq('id', id)
      .select('id, name, email, role')
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({ success: true, data });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ success: false, message: "Email already exists" });
    } else {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminSupabase = getAdminClient();
    
    // Delete user profile
    const { data, error } = await adminSupabase
      .from('users')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;
    
    // Also delete auth user
    await adminSupabase.auth.admin.deleteUser(id);
    
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Business Management with RLS
export const listAllBusinesses = async (req, res) => {
  try {
    const adminSupabase = getAdminClient();
    
    const { data, error } = await adminSupabase
      .from('businesses')
      .select(`
        *,
        users:user_id (name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const formattedData = data.map(business => ({
      ...business,
      owner_name: business.users?.name
    }));
    
    res.json({ success: true, data: formattedData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const adminSupabase = getAdminClient();
    
    const { data, error } = await adminSupabase
      .from('businesses')
      .update({ status: 'approved' })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }
    
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const rejectBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminSupabase = getAdminClient();
    
    const { data, error } = await adminSupabase
      .from('businesses')
      .update({ 
        status: 'rejected', 
        rejection_reason: reason 
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }
    
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};