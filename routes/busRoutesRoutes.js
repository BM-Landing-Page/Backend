import express from 'express';
import {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
} from '../controllers/busRoutesController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllRoutes);
router.get('/:id', getRouteById);

// Protected routes
router.post('/', authenticateToken, createRoute);
router.put('/:id', authenticateToken, updateRoute);
router.delete('/:id', authenticateToken, deleteRoute);

export default router;
