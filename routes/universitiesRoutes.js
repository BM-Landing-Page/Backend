import express from 'express';
import { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity, getUniversityOfferCounts } from '../controllers/universitiesController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getAllUniversities);
router.get('/offer-counts', getUniversityOfferCounts);
router.get('/:id', getUniversityById);

// Protected
router.post('/', authenticateToken, createUniversity);
router.put('/:id', authenticateToken, updateUniversity);
router.delete('/:id', authenticateToken, deleteUniversity);

export default router;
