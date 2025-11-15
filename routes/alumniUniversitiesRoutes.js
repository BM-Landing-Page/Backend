import express from 'express';
import { getAlumniUniversities, addAlumniUniversity, deleteAlumniUniversity } from '../controllers/alumniUniversitiesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Get all alumni-university links
router.get('/', getAlumniUniversities);

// Protected: Add or delete links
router.post('/', authMiddleware, addAlumniUniversity);
router.delete('/:id', authMiddleware, deleteAlumniUniversity);

export default router;
