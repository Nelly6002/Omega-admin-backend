// routes/userRoutes.js
import express from 'express';
import { getMe, getUsers, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { verifyToken, isAdmin, requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no auth required)
// None for users

// Protected routes (auth required)
router.get('/me', verifyToken, getMe);
router.get('/:id', verifyToken, getUser);
router.put('/:id', verifyToken, updateUser);

// Admin only routes
router.get('/', verifyToken, isAdmin, getUsers);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

export default router;