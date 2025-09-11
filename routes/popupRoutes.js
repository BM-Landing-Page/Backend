import express from 'express';
import multer from 'multer';
import {
  getPopup,
  createPopup,
  updatePopup,
  deletePopup
} from '../controllers/popupController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.split('.').pop().toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed!'));
  },
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  }
  next(err);
};

// Debug middleware to log incoming requests
const logRequest = (req, res, next) => {
  console.log('Popup - Incoming files:', req.file);
  console.log('Popup - Incoming body:', req.body);
  next();
};

// Public route - only GET is public
router.get('/', getPopup);

// Protected popup routes
router.post('/', authenticateToken, logRequest, upload.single('file'), handleMulterError, createPopup);
router.put('/', authenticateToken, logRequest, upload.single('file'), handleMulterError, updatePopup);
router.delete('/', authenticateToken, deletePopup);

export default router;