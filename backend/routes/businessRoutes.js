// routes/businessRoutes.js
import express from 'express';
import { 
  createBusiness, 
  getBusinesses, 
  getMyBusinesses,
  getAllBusinesses,
  approveBusiness,
  rejectBusiness 
} from '../controllers/businessController.js';
import { verifyToken, requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getBusinesses); // Public can see APPROVED businesses only

// Protected routes
router.post('/', verifyToken, createBusiness); // Auth required to create business
router.get('/my-businesses', verifyToken, getMyBusinesses); // User's own businesses (ALL statuses)

// Admin routes
router.get('/admin/all', verifyToken, getAllBusinesses); // Admin sees ALL businesses
router.patch('/admin/:id/approve', verifyToken, approveBusiness); // Admin approves business
router.patch('/admin/:id/reject', verifyToken, rejectBusiness); // Admin rejects business

export default router;