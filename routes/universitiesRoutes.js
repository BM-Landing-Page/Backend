import express from 'express';
import { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity, getUniversityOfferCounts } from '../controllers/universitiesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getAllUniversities);
router.get('/offer-counts', getUniversityOfferCounts);
router.get('/:id', getUniversityById);

// Protected
router.post('/', authMiddleware, createUniversity);
router.put('/:id', authMiddleware, updateUniversity);
router.delete('/:id', authMiddleware, deleteUniversity);

export default router;
