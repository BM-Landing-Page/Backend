import express from 'express';
import multer from 'multer';
import {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog
} from '../controllers/blogController.js';
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
router.get('/', getAllBlogs);

// Protected routes
router.post('/', authenticateToken, upload.single('thumbnail'), createBlog);
router.put('/:id', authenticateToken, upload.single('thumbnail'), updateBlog);
router.delete('/:id', authenticateToken, deleteBlog);

export default router;
