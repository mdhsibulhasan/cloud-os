const express = require('express');
const router = express.Router();
const {
  createBroadcast,
  getBroadcasts,
  markBroadcastAsRead,
  updateBroadcast,
  deleteBroadcast
} = require('../controllers/broadcastController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadBroadcast } = require('../middleware/upload');

router.post('/', protect, adminOnly, uploadBroadcast.single('attachment'), createBroadcast);
router.get('/', protect, getBroadcasts);
router.put('/:id/read', protect, markBroadcastAsRead);
router.put('/:id', protect, adminOnly, updateBroadcast);
router.delete('/:id', protect, adminOnly, deleteBroadcast);

module.exports = router;
