const db = require('../config/db');
const logger = require('../utils/logger');
const Joi = require('joi');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await db.users.count({});
    const pendingUsers = await db.users.count({ status: 'pending' });
    const approvedUsers = await db.users.count({ status: 'approved' });
    const totalFiles = await db.files.count({ status: 'approved' });
    const pendingFiles = await db.files.count({ status: 'pending' });
    const totalSubjects = await db.subjects.count({});
    const totalChapters = await db.chapters.count({});
    const totalMessages = await db.messages.count({});
    const totalBroadcasts = await db.broadcasts.count({});

    // Calculate storage used
    const files = await db.files.find({});
    const storageUsed = files.reduce((total, file) => total + (file.size || 0), 0);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          pending: pendingUsers,
          approved: approvedUsers
        },
        files: {
          total: totalFiles,
          pending: pendingFiles
        },
        subjects: totalSubjects,
        chapters: totalChapters,
        messages: totalMessages,
        broadcasts: totalBroadcasts,
        storage: {
          used: storageUsed,
          usedMB: (storageUsed / (1024 * 1024)).toFixed(2)
        }
      }
    });

  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get site settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    const settings = await db.settings.findOne({ key: 'site' });

    res.json({
      success: true,
      settings: settings || {
        bio: '',
        tagline: '',
        aboutText: ''
      }
    });

  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update site settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const { bio, tagline, aboutText } = req.body;

    const settings = await db.settings.findOne({ key: 'site' });

    if (settings) {
      const updates = {};
      if (bio !== undefined) updates.bio = bio;
      if (tagline !== undefined) updates.tagline = tagline;
      if (aboutText !== undefined) updates.aboutText = aboutText;

      await db.settings.update({ key: 'site' }, { $set: updates });
    } else {
      await db.settings.insert({
        key: 'site',
        bio: bio || '',
        tagline: tagline || '',
        aboutText: aboutText || '',
        createdAt: new Date()
      });
    }

    logger.info('Site settings updated');

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    logger.error('Update settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Upload result
// @route   POST /api/admin/results
// @access  Private/Admin
exports.uploadResult = async (req, res) => {
  try {
    const { title, gpa, description } = req.body;

    if (!title || !gpa) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and GPA required' 
      });
    }

    const result = await db.results.insert({
      title,
      gpa: parseFloat(gpa),
      description: description || '',
      fileUrl: req.file ? '/assets/uploads/' + req.file.filename : null,
      createdAt: new Date()
    });

    logger.info(`Result uploaded: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Result uploaded successfully',
      result: {
        id: result._id,
        title: result.title,
        gpa: result.gpa,
        createdAt: result.createdAt
      }
    });

  } catch (error) {
    logger.error('Upload result error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get all results
// @route   GET /api/results
// @access  Private
exports.getResults = async (req, res) => {
  try {
    const results = await db.results.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      results: results.map(r => ({
        id: r._id,
        title: r.title,
        gpa: r.gpa,
        description: r.description,
        fileUrl: r.fileUrl,
        createdAt: r.createdAt
      }))
    });

  } catch (error) {
    logger.error('Get results error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete result
// @route   DELETE /api/results/:id
// @access  Private/Admin
exports.deleteResult = async (req, res) => {
  try {
    const { id } = req.params;

    await db.results.remove({ _id: id });

    logger.info(`Result deleted: ${id}`);

    res.json({
      success: true,
      message: 'Result deleted successfully'
    });

  } catch (error) {
    logger.error('Delete result error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/admin/activity
// @access  Private/Admin
exports.getRecentActivity = async (req, res) => {
  try {
    // Get recent files
    const recentFiles = await db.files.find({})
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent users
    const recentUsers = await db.users.find({})
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent messages
    const recentMessages = await db.messages.find({})
      .sort({ createdAt: -1 })
      .limit(10);

    const activity = {
      files: await Promise.all(recentFiles.map(async (f) => {
        const user = await db.users.findOne({ _id: f.uploadedBy });
        return {
          type: 'file',
          description: `${user?.username || 'Unknown'} uploaded ${f.originalname}`,
          createdAt: f.createdAt
        };
      })),
      users: recentUsers.map(u => ({
        type: 'user',
        description: `${u.username} registered`,
        createdAt: u.createdAt
      })),
      messages: await Promise.all(recentMessages.map(async (m) => {
        const from = await db.users.findOne({ _id: m.from });
        const to = await db.users.findOne({ _id: m.to });
        return {
          type: 'message',
          description: `${from?.username || 'Unknown'} sent message to ${to?.username || 'Unknown'}`,
          createdAt: m.createdAt
        };
      }))
    };

    // Combine and sort all activity
    const allActivity = [...activity.files, ...activity.users, ...activity.messages]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    res.json({
      success: true,
      activity: allActivity
    });

  } catch (error) {
    logger.error('Get activity error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
