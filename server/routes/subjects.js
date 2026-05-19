const express = require('express');
const router = express.Router();
const {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getChapters,
  createChapter,
  updateChapter,
  deleteChapter
} = require('../controllers/subjectController');
const { protect, adminOnly } = require('../middleware/auth');

// Subject routes
router.get('/', protect, getAllSubjects);
router.post('/', protect, adminOnly, createSubject);
router.put('/:id', protect, adminOnly, updateSubject);
router.delete('/:id', protect, adminOnly, deleteSubject);

// Chapter routes
router.get('/:subjectId/chapters', protect, getChapters);
router.post('/:subjectId/chapters', protect, adminOnly, createChapter);

module.exports = router;
