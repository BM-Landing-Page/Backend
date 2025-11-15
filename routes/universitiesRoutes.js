import express from 'express';
import { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity, getUniversityOfferCounts } from '../controllers/universitiesController.js';
import upload from '../middleware/multerMiddleware.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getAllUniversities);
router.get('/offer-counts', getUniversityOfferCounts);
router.get('/:id', getUniversityById);

// Protected
router.post('/', authenticateToken, upload.single('logo'), createUniversity);
router.put('/:id', authenticateToken, upload.single('logo'), updateUniversity);
router.delete('/:id', authenticateToken, deleteUniversity);

export default router;
