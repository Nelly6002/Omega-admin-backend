import { pool } from "../database/db.js";

export const getUsers = async (req, res) => {
  const result = await pool.query("SELECT id, name, email, role FROM users");
  res.json({ success: true, data: result.rows });
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT id, name, email, role FROM users WHERE id=$1", [id]);
  res.json({ success: true, data: result.rows[0] });
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;
  const result = await pool.query(
    "UPDATE users SET name=$1, role=$2 WHERE id=$3 RETURNING *",
    [name, role, id]
  );
  res.json({ success: true, message: "User updated", data: result.rows[0] });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM users WHERE id=$1", [id]);
  res.json({ success: true, message: "User deleted" });
};
