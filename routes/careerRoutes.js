import express from 'express';
import {
  createCareer,
  getAllCareers,
  updateCareer,
  deleteCareer
} from '../controllers/careerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.post('/', createCareer);

// Protected routes
router.get('/', authenticateToken, getAllCareers);
router.put('/:id', authenticateToken, updateCareer);
router.delete('/:id', authenticateToken, deleteCareer);

export default router;
