import express from 'express';
import {
  createCareerApplication,
  getAllCareerApplications,
  getCareerApplicationById,
  updateCareerApplication,
  deleteCareerApplication,
} from '../controllers/careerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/multerMiddleware.js';

const router = express.Router();

// ✅ Public route for submitting career applications with file upload
// multer handles multipart/form-data automatically
router.post('/', upload.single('resume'), createCareerApplication);

// ✅ Protected routes for managing career applications
router.get('/', authenticateToken, getAllCareerApplications);
router.get('/:id', authenticateToken, getCareerApplicationById);
router.put('/:id', authenticateToken, upload.single('resume'), updateCareerApplication);
router.delete('/:id', authenticateToken, deleteCareerApplication);

export default router;
