import express from 'express';
import { 
  getPositions, 
  createPosition, 
  updatePosition, 
  deletePosition 
} from '../controllers/positionsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
// import upload from '../middleware/multerMiddleware.js'; // positions don't need file upload

const router = express.Router();

// Public
router.get('/', getPositions); // fetch all positions

// Protected (admin/HR)
router.post('/', authenticateToken, createPosition);
router.put('/:id', authenticateToken, updatePosition);
router.delete('/:id', authenticateToken, deletePosition);

export default router;
