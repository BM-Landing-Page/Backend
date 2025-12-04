import express from 'express';
import {
  createCareerApplication,  // matches controller
  getAllCareerApplications,
  getCareerApplicationById,
  updateCareerApplication,
  deleteCareerApplication
} from '../controllers/careerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/multerMiddleware.js';

const router = express.Router();

// Public route
router.post('/', upload.single('resume'), createCareerApplication);

// Protected routes
router.get('/', authenticateToken, getAllCareerApplications);
router.get('/:id', authenticateToken, getCareerApplicationById);
router.put('/:id', authenticateToken, upload.single('resume'), updateCareerApplication);
router.delete('/:id', authenticateToken, deleteCareerApplication);

export default router;
