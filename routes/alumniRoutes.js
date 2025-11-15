import express from 'express';
import { getAllAlumni, getAlumnusById, createAlumnus, updateAlumnus, deleteAlumnus } from '../controllers/alumniController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getAllAlumni);
router.get('/:id', getAlumnusById);

// Protected
router.post('/', authMiddleware, createAlumnus);
router.put('/:id', authMiddleware, updateAlumnus);
router.delete('/:id', authMiddleware, deleteAlumnus);

export default router;
