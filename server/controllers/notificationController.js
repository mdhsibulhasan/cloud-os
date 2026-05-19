const db = require('../config/db');
const logger = require('../utils/logger');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await db.notifications
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      notifications: notifications.map(n => ({
        id: n._id,
        message: n.message,
        type: n.type,
        read: n.read,
        fileId: n.fileId,
        messageId: n.messageId,
        broadcastId: n.broadcastId,
        createdAt: n.createdAt
      }))
    });

  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await db.notifications.count({
      userId: req.user.id,
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

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await db.notifications.findOne({ _id: id });

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    await db.notifications.update({ _id: id }, { $set: { read: true } });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    logger.error('Mark notification as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await db.notifications.update(
      { userId: req.user.id, read: false },
      { $set: { read: true } },
      { multi: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    logger.error('Mark all as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await db.notifications.findOne({ _id: id });

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    await db.notifications.remove({ _id: id });

    res.json({
      success: true,
      message: 'Notification deleted'
    });

  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
