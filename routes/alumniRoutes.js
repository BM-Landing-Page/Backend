import express from 'express';
import { getAllAlumni, getAlumnusById, createAlumnus, updateAlumnus, deleteAlumnus } from '../controllers/alumniController.js';
import upload from '../middleware/multerMiddleware.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getAllAlumni);
router.get('/:id', getAlumnusById);

	// Protected
	router.post('/', authenticateToken, upload.single('photo'), createAlumnus);
	router.put('/:id', authenticateToken, upload.single('photo'), updateAlumnus);
	router.delete('/:id', authenticateToken, deleteAlumnus);

export default router;
