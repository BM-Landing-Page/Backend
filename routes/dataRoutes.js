import express from 'express';
import multer from 'multer';
import {
  getAllData,
  createData,
  updateData,
  deleteData,
} from '../controllers/dataController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public route
router.get('/', getAllData);

// Protected routes
router.post('/', authenticateToken, upload.single('image'), createData);
router.put('/:id', authenticateToken, updateData);
router.delete('/:id', authenticateToken, deleteData);

export default router;
