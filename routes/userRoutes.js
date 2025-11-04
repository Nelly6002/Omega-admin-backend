// routes/userRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getUserProfile, updateUserProfile, deleteUserAccount } from "../controllers/userController.js";

const router = express.Router();

router.get("/user", authMiddleware, getUserProfile);
router.put("/user", authMiddleware, updateUserProfile);
router.delete("/user", authMiddleware, deleteUserAccount);


export default router;
