import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import * as batchController from '../controllers/batchController.js';

const router = express.Router();

// Public
router.get('/', batchController.getAllBatches);

// Protected
router.post('/', authenticateToken, batchController.createBatch);
router.put('/:id', authenticateToken, batchController.updateBatch);
router.delete('/:id', authenticateToken, batchController.deleteBatch);

export default router;
