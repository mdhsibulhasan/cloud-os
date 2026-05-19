const express = require('express');
const router = express.Router();
const {
  updateChapter,
  deleteChapter
} = require('../controllers/subjectController');
const { protect, adminOnly } = require('../middleware/auth');

router.put('/:id', protect, adminOnly, updateChapter);
router.delete('/:id', protect, adminOnly, deleteChapter);

module.exports = router;
