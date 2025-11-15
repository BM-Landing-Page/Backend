import express from 'express';
import { getAlumniUniversities, addAlumniUniversity, deleteAlumniUniversity } from '../controllers/alumniUniversitiesController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Get all alumni-university links
router.get('/', getAlumniUniversities);

// Protected: Add or delete links
router.post('/', authenticateToken, addAlumniUniversity);
router.delete('/:id', authenticateToken, deleteAlumniUniversity);

export default router;
