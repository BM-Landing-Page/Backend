import express from 'express';
import {
  createApplication,
  getAllApplications,
  updateApplication,
  deleteApplication
} from '../controllers/applicationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.post('/', createApplication);

// Protected routes
router.get('/', authenticateToken, getAllApplications);
router.put('/:id', authenticateToken, updateApplication);
router.delete('/:id', authenticateToken, deleteApplication);

export default router;
