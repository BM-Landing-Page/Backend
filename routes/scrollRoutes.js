import express from 'express';
import {
  getAll,
  createScroll,
  updateScroll,
  deleteScroll
} from '../controllers/scrollController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();



// Public route
router.get('/', getAll);

// Protected routes
router.post('/', authenticateToken, createScroll);
router.put('/:id', authenticateToken, updateScroll);
router.delete('/:id', authenticateToken, deleteScroll);

export default router;
