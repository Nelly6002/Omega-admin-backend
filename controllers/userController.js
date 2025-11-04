// controllers/userController.js
import * as User from "../models/userModel.js";

export const getUserProfile = async (req, res) => {
  const user = await User.findUserById(req.user.id);
  return res.json({ status: "success", data: user });
};

export const updateUserProfile = async (req, res) => {
  const user = await User.updateUser(req.user.id, req.body);
  return res.json({ status: "success", data: user });
};

export const deleteUserAccount = async (req, res) => {
  await User.deleteUser(req.user.id);
  return res.json({ status: "success", message: "account deleted" });
};
