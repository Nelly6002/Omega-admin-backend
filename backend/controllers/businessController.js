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
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get businesses error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Get businesses error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get businesses for authenticated user (their own businesses)
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

    res.json({ success: true, data });
  } catch (err) {
    console.error('Get my businesses error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};