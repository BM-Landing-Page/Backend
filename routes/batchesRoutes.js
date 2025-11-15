const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const authMiddleware = require('../middleware/authMiddleware');

// Public
router.get('/', batchController.getAllBatches);

// Protected
router.post('/', authMiddleware, batchController.createBatch);
router.put('/:id', authMiddleware, batchController.updateBatch);
router.delete('/:id', authMiddleware, batchController.deleteBatch);

module.exports = router;
