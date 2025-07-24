import express from 'express';
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/calendarController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/', getAllEvents);

// Protected routes
router.post('/', authenticateToken, createEvent);
router.put('/:id', authenticateToken, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);

export default router;
