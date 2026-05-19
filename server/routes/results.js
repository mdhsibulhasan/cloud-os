const express = require('express');
const router = express.Router();
const { getResults, deleteResult } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getResults);
router.delete('/:id', protect, adminOnly, deleteResult);

module.exports = router;
