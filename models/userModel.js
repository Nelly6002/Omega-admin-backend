// models/userModel.js
import { dbQuery } from "../config/db.js";

export const findUserById = async (id) => {
  const result = await dbQuery("SELECT id,name,email,role FROM users WHERE id=$1", [id]);
  return result.rows[0];
};

export const updateUser = async (id, data) => {
  const { name } = data;
  const result = await dbQuery("UPDATE users SET name=$1 WHERE id=$2 RETURNING id,name,email,role", [name, id]);
  return result.rows[0];
};

export const deleteUser = async (id) => {
  await dbQuery("DELETE FROM users WHERE id=$1", [id]);
  return true;
};
