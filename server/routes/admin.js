const express = require('express');
const router = express.Router();
const {
  getStats,
  getSettings,
  updateSettings,
  uploadResult,
  getResults,
  deleteResult,
  getRecentActivity
} = require('../controllers/adminController');
const { protect, adminOnly, adminOrModerator } = require('../middleware/auth');
const { uploadFile } = require('../middleware/upload');

router.get('/stats', protect, adminOrModerator, getStats);
router.get('/settings', protect, adminOnly, getSettings);
router.put('/settings', protect, adminOnly, updateSettings);
router.post('/results', protect, adminOnly, uploadFile.single('file'), uploadResult);
router.get('/activity', protect, adminOrModerator, getRecentActivity);

module.exports = router;
