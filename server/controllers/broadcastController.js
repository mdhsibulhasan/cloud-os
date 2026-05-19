const Joi = require('joi');
const db = require('../config/db');
const logger = require('../utils/logger');

// Validation schema
const broadcastSchema = Joi.object({
  message: Joi.string().min(1).max(2000).required(),
  pinned: Joi.boolean().optional()
});

// @desc    Create broadcast
// @route   POST /api/broadcasts
// @access  Private/Admin
exports.createBroadcast = async (req, res) => {
  try {
    const { error, value } = broadcastSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { message, pinned } = value;

    const broadcast = await db.broadcasts.insert({
      message,
      attachment: req.file ? req.file.path : null,  // Cloudinary URL
      pinned: pinned || false,
      createdBy: req.user.id,
      createdAt: new Date()
    });

    // Create notifications for all approved users
    const approvedUsers = await db.users.find({ 
      status: 'approved',
      role: 'user'
    });

    for (const user of approvedUsers) {
      await db.notifications.insert({
        userId: user._id,
        message: `New broadcast: ${message.substring(0, 50)}...`,
        type: 'broadcast',
        read: false,
        broadcastId: broadcast._id,
        createdAt: new Date()
      });
    }

    logger.info(`Broadcast created by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Broadcast created successfully',
      broadcast: {
        id: broadcast._id,
        message: broadcast.message,
        pinned: broadcast.pinned,
        createdAt: broadcast.createdAt
      }
    });

  } catch (error) {
    logger.error('Create broadcast error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get all broadcasts
// @route   GET /api/broadcasts
// @access  Private
exports.getBroadcasts = async (req, res) => {
  try {
    const broadcasts = await db.broadcasts.find({}).sort({ pinned: -1, createdAt: -1 });

    // Check read status for current user
    const broadcastsWithStatus = await Promise.all(
      broadcasts.map(async (broadcast) => {
        const notification = await db.notifications.findOne({
          userId: req.user.id,
          broadcastId: broadcast._id
        });

        return {
          id: broadcast._id,
          message: broadcast.message,
          attachment: broadcast.attachment,
          pinned: broadcast.pinned,
          read: notification ? notification.read : false,
          createdAt: broadcast.createdAt
        };
      })
    );

    res.json({
      success: true,
      broadcasts: broadcastsWithStatus
    });

  } catch (error) {
    logger.error('Get broadcasts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Mark broadcast as read
// @route   PUT /api/broadcasts/:id/read
// @access  Private
exports.markBroadcastAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const broadcast = await db.broadcasts.findOne({ _id: id });

    if (!broadcast) {
      return res.status(404).json({ 
        success: false, 
        message: 'Broadcast not found' 
      });
    }

    // Update notification
    await db.notifications.update(
      { userId: req.user.id, broadcastId: id },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      message: 'Broadcast marked as read'
    });

  } catch (error) {
    logger.error('Mark broadcast as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update broadcast
// @route   PUT /api/broadcasts/:id
// @access  Private/Admin
exports.updateBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, pinned } = req.body;

    const broadcast = await db.broadcasts.findOne({ _id: id });

    if (!broadcast) {
      return res.status(404).json({ 
        success: false, 
        message: 'Broadcast not found' 
      });
    }

    const updates = {};
    if (message !== undefined) updates.message = message;
    if (pinned !== undefined) updates.pinned = pinned;

    await db.broadcasts.update({ _id: id }, { $set: updates });

    logger.info(`Broadcast updated: ${id}`);

    res.json({
      success: true,
      message: 'Broadcast updated successfully'
    });

  } catch (error) {
    logger.error('Update broadcast error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete broadcast
// @route   DELETE /api/broadcasts/:id
// @access  Private/Admin
exports.deleteBroadcast = async (req, res) => {
  try {
    const { id } = req.params;

    await db.broadcasts.remove({ _id: id });
    await db.notifications.remove({ broadcastId: id }, { multi: true });

    logger.info(`Broadcast deleted: ${id}`);

    res.json({
      success: true,
      message: 'Broadcast deleted successfully'
    });

  } catch (error) {
    logger.error('Delete broadcast error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
