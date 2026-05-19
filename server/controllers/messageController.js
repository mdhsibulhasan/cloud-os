const Joi = require('joi');
const db = require('../config/db');
const logger = require('../utils/logger');

// Validation schema
const messageSchema = Joi.object({
  to: Joi.string().required(),
  text: Joi.string().min(1).max(5000).required(),
  attachment: Joi.string().optional()
});

// @desc    Send message
// @route   POST /api/messages
// @access  Private (approved users)
exports.sendMessage = async (req, res) => {
  try {
    const { error, value } = messageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { to, text, attachment } = value;

    // Verify recipient exists and is approved
    const recipient = await db.users.findOne({ _id: to });
    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
    }

    if (recipient.status !== 'approved' && recipient.role !== 'admin') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot send message to unapproved user' 
      });
    }

    const message = await db.messages.insert({
      from: req.user.id,
      to,
      text,
      attachment: attachment || null,
      read: false,
      createdAt: new Date()
    });

    // Create notification
    await db.notifications.insert({
      userId: to,
      message: `New message from ${req.user.username}`,
      type: 'message',
      read: false,
      messageId: message._id,
      createdAt: new Date()
    });

    // Emit real-time event INSTANTLY via Socket.IO
    if (global.io) {
      const msgPayload = {
        id: message._id,
        from: req.user.id,
        fromUsername: req.user.username,
        fromPicture: req.user.profilePicture,
        to: message.to,
        text: message.text,
        read: false,
        createdAt: message.createdAt,
        isMine: false
      };
      // Emit to recipient's room
      global.io.to(to).emit('new_message', msgPayload);
      // Also emit back to sender for confirmation
      global.io.to(req.user.id).emit('message_sent', msgPayload);
    }

    logger.info(`Message sent from ${req.user.id} to ${to}`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: message._id,
        from: req.user.id,
        to: message.to,
        text: message.text,
        createdAt: message.createdAt
      }
    });

  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get conversation with a user
// @route   GET /api/messages?with=userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const { with: otherUserId } = req.query;

    if (!otherUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID required' 
      });
    }

    // Get all messages between current user and other user
    const messages = await db.messages.find({
      $or: [
        { from: req.user.id, to: otherUserId },
        { from: otherUserId, to: req.user.id }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await db.messages.update(
      { from: otherUserId, to: req.user.id, read: false },
      { $set: { read: true } },
      { multi: true }
    );

    // Get user details
    const otherUser = await db.users.findOne({ _id: otherUserId });

    const messagesWithDetails = messages.map(msg => ({
      id: msg._id,
      from: msg.from,
      to: msg.to,
      text: msg.text,
      attachment: msg.attachment,
      read: msg.read,
      createdAt: msg.createdAt,
      isMine: msg.from === req.user.id
    }));

    res.json({
      success: true,
      conversation: {
        with: {
          id: otherUser._id,
          username: otherUser.username,
          profilePicture: otherUser.profilePicture
        },
        messages: messagesWithDetails
      }
    });

  } catch (error) {
    logger.error('Get conversation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get all conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // Get all messages involving current user
    const messages = await db.messages.find({
      $or: [
        { from: req.user.id },
        { to: req.user.id }
      ]
    }).sort({ createdAt: -1 });

    // Group by conversation partner
    const conversationMap = new Map();

    for (const msg of messages) {
      const partnerId = msg.from === req.user.id ? msg.to : msg.from;
      
      if (!conversationMap.has(partnerId)) {
        const partner = await db.users.findOne({ _id: partnerId });
        const unreadCount = await db.messages.count({
          from: partnerId,
          to: req.user.id,
          read: false
        });

        conversationMap.set(partnerId, {
          user: {
            id: partner._id,
            username: partner.username,
            profilePicture: partner.profilePicture
          },
          lastMessage: {
            text: msg.text,
            createdAt: msg.createdAt,
            isMine: msg.from === req.user.id
          },
          unreadCount
        });
      }
    }

    const conversations = Array.from(conversationMap.values());

    res.json({
      success: true,
      conversations
    });

  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await db.messages.count({
      to: req.user.id,
      read: false
    });

    res.json({
      success: true,
      count
    });

  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await db.messages.findOne({ _id: id });

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    if (message.to !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    await db.messages.update({ _id: id }, { $set: { read: true } });

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
