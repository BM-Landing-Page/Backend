import express from 'express';
import {
  sendFeedbackEmail,
  createFeedback,
  getAllFeedback,
  updateFeedback,
  deleteFeedback
} from '../controllers/feedbackController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/send-email', sendFeedbackEmail); // Send feedback via email only
router.get('/', getAllFeedback); // Get all feedback from database

// Protected routes
router.post('/', authenticateToken, createFeedback); // Create feedback in database
router.put('/:id', authenticateToken, updateFeedback); // Update feedback
router.delete('/:id', authenticateToken, deleteFeedback); // Delete feedback

export default router;