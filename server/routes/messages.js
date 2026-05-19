const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount,
  markAsRead
} = require('../controllers/messageController');
const { protect, approvedOnly } = require('../middleware/auth');

router.post('/', protect, approvedOnly, sendMessage);
router.get('/conversations', protect, approvedOnly, getConversations);
router.get('/unread-count', protect, approvedOnly, getUnreadCount);
router.put('/:id/read', protect, approvedOnly, markAsRead);
router.get('/', protect, approvedOnly, getConversation);

module.exports = router;
