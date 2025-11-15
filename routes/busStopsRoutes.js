import express from 'express';
import {
  getAllStops,
  getStopsByRoute,
  getStopById,
  createStop,
  updateStop,
  deleteStop
} from '../controllers/busStopsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllStops);
router.get('/route/:routeId', getStopsByRoute);
router.get('/:id', getStopById);

// Protected routes
router.post('/', authenticateToken, createStop);
router.put('/:id', authenticateToken, updateStop);
router.delete('/:id', authenticateToken, deleteStop);

export default router;
