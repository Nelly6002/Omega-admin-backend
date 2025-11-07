import { pool } from "../database/db.js";

export const createBusiness = async (req, res) => {
  try {
    const { name, description, owner_name, owner_email } = req.body;
    // If user is authenticated, attach their id; otherwise allow anonymous submissions
    const userId = req.user?.id || null;
    const result = await pool.query(
      "INSERT INTO businesses (user_id, name, description) VALUES ($1, $2, $3) RETURNING *",
      [userId, name, description]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create business error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public listing returns only approved businesses for public dashboard
export const getBusinesses = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM businesses WHERE status = 'approved' ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get businesses error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
