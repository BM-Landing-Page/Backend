const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public
router.get('/', batchController.getAllBatches);

// Protected
router.post('/', authenticateToken, batchController.createBatch);
router.put('/:id', authenticateToken, batchController.updateBatch);
router.delete('/:id', authenticateToken, batchController.deleteBatch);

module.exports = router;
