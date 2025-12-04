import express from 'express';
import {
  createCareer,
  getAllCareers,
  getCareerById,
  updateCareer,
  deleteCareer
} from '../controllers/careerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/multerMiddleware.js';

const router = express.Router();

// Public route
router.post('/', upload.single('resume'), createCareer);

// Protected routes
router.get('/', authenticateToken, getAllCareers);
router.get('/:id', authenticateToken, getCareerById);
router.put('/:id', authenticateToken, upload.single('resume'), updateCareer);
router.delete('/:id', authenticateToken, deleteCareer);

export default router;
