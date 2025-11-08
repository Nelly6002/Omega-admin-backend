// controllers/userController.js
import { supabase, adminSupabase } from "../database/supabase.js";

export const getMe = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Get me error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN ONLY - Get all users (uses adminSupabase to bypass RLS)
export const getUsers = async (req, res) => {
  try {
    // Verify user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

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

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    // Verify user is admin or updating their own profile
    if (id !== req.user.id) {
      const { data: currentUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update({ name, role })
      .eq('id', id)
      .select('id, name, email, role, created_at')
      .single();

    if (error) throw error;

    res.json({ success: true, message: "User updated", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user is admin
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { error } = await adminSupabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};