import express from 'express';
import {
  getAll,
  createAchievement,
  updateAchievement,
  deleteAchievement
} from '../controllers/achievementController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/', getAll);

// Protected routes
router.post('/', authenticateToken, createAchievement);
router.put('/:id', authenticateToken, updateAchievement);
router.delete('/:id', authenticateToken, deleteAchievement);

export default router;
