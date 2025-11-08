// controllers/businessController.js
import { supabase } from "../database/supabase.js";

export const createBusiness = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // If user is authenticated, attach their id; otherwise allow anonymous submissions
    const userId = req.user?.id || null;
    
    const { data, error } = await supabase
      .from('businesses')
      .insert([
        {
          user_id: userId,
          name: name,
          description: description,
          status: 'pending' // Default status
        }
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Create business error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('Create business error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public listing returns only approved businesses for public dashboard
export const getBusinesses = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('status', 'approved') // Only show APPROVED businesses to public
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get businesses error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    console.log("Public businesses (approved): ", data);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Get businesses error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get businesses for authenticated user (their own businesses - ALL statuses)
export const getMyBusinesses = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log("User businesses (all statuses): ", data);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Get my businesses error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all businesses for admin (all statuses)
export const getAllBusinesses = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Verify user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log("All businesses for admin: ", data);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Get all businesses error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve business (admin only)
export const approveBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Verify user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { data, error } = await supabase
      .from('businesses')
      .update({ 
        status: 'approved',
        rejection_reason: null // Clear any previous rejection reason
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    console.log("Business approved:", data);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Approve business error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reject business (admin only)
export const rejectBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Verify user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { data, error } = await supabase
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

    console.log("Business rejected:", data);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Reject business error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};