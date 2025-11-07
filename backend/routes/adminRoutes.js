import express from "express";
import { isAdmin } from "../middleware/roleMiddleware.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  listAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  listAllBusinesses,
  approveBusiness,
  rejectBusiness
} from "../controllers/adminController.js";

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(verifyToken, isAdmin);

// User management routes
router.get("/users", listAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Business management routes
router.get("/businesses", listAllBusinesses);
router.patch("/businesses/:id/approve", approveBusiness);
router.patch("/businesses/:id/reject", rejectBusiness);

export default router;
