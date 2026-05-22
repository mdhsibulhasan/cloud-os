const User         = require('../models/User');
const Subject      = require('../models/Subject');
const Chapter      = require('../models/Chapter');
const File         = require('../models/File');
const Result       = require('../models/Result');
const Broadcast    = require('../models/Broadcast');
const Message      = require('../models/Message');
const Setting      = require('../models/Setting');
const logger = require('../utils/logger');
const archiver = require('archiver');

// @desc    Get admin dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, pendingUsers, approvedUsers, totalFiles, pendingFiles,
           totalSubjects, totalChapters, totalMessages, totalBroadcasts, files] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: 'pending' }),
      User.countDocuments({ status: 'approved' }),
      File.countDocuments({ status: 'approved' }),
      File.countDocuments({ status: 'pending' }),
      Subject.countDocuments({}),
      Chapter.countDocuments({}),
      Message.countDocuments({}),
      Broadcast.countDocuments({}),
      File.find({}, 'size')
    ]);

    const storageUsed = files.reduce((total, f) => total + (f.size || 0), 0);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, pending: pendingUsers, approved: approvedUsers },
        files: { total: totalFiles, pending: pendingFiles },
        subjects: totalSubjects,
        chapters: totalChapters,
        messages: totalMessages,
        broadcasts: totalBroadcasts,
        storage: { used: storageUsed, usedMB: (storageUsed / (1024 * 1024)).toFixed(2) }
      }
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get site settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne({ key: 'site' });
    res.json({ success: true, settings: settings || { bio: '', tagline: '', aboutText: '' } });
  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update site settings
exports.updateSettings = async (req, res) => {
  try {
    const { bio, tagline, aboutText } = req.body;
    const updates = {};
    if (bio !== undefined) updates.bio = bio;
    if (tagline !== undefined) updates.tagline = tagline;
    if (aboutText !== undefined) updates.aboutText = aboutText;

    await Setting.findOneAndUpdate(
      { key: 'site' },
      { $set: updates },
      { upsert: true, new: true }
    );

    logger.info('Site settings updated');
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    logger.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Upload result
exports.uploadResult = async (req, res) => {
  try {
    const { title, gpa, description } = req.body;
    if (!title || !gpa) return res.status(400).json({ success: false, message: 'Title and GPA required' });

    const result = await Result.create({
      title,
      gpa: parseFloat(gpa),
      description: description || '',
      fileUrl: req.file ? req.file.path : null
    });

    logger.info(`Result uploaded: ${title}`);
    res.status(201).json({
      success: true,
      message: 'Result uploaded successfully',
      result: { id: result._id.toString(), title: result.title, gpa: result.gpa, createdAt: result.createdAt }
    });
  } catch (error) {
    logger.error('Upload result error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all results
exports.getResults = async (req, res) => {
  try {
    const results = await Result.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      results: results.map(r => ({
        id: r._id.toString(), title: r.title, gpa: r.gpa,
        description: r.description, fileUrl: r.fileUrl, createdAt: r.createdAt
      }))
    });
  } catch (error) {
    logger.error('Get results error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete result
exports.deleteResult = async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    logger.info(`Result deleted: ${req.params.id}`);
    res.json({ success: true, message: 'Result deleted successfully' });
  } catch (error) {
    logger.error('Delete result error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Download backup (owner only) — real files in ZIP organized by Subject/Chapter
exports.downloadBackup = async (req, res) => {
  const https = require('https');
  const http = require('http');
  const { getSignedFileUrl } = require('../utils/b2Storage');

  try {
    const [subjects, chapters, files] = await Promise.all([
      Subject.find({}).sort({ createdAt: 1 }).lean(),
      Chapter.find({}).sort({ createdAt: 1 }).lean(),
      File.find({ status: 'approved' }).lean()
    ]);

    const subjectMap = {};
    subjects.forEach(s => { subjectMap[s._id.toString()] = s.name.replace(/[/\\?%*:|"<>]/g, '-'); });
    const chapterMap = {};
    chapters.forEach(c => { chapterMap[c._id.toString()] = { name: c.name.replace(/[/\\?%*:|"<>]/g, '-'), subjectId: c.subjectId?.toString() }; });

    const filename = `cloudos-backup-${new Date().toISOString().split('T')[0]}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // Disable timeout for this long-running request
    req.socket.setTimeout(0);
    res.socket.setTimeout(0);

    const archive = archiver('zip', { zlib: { level: 1 } }); // level 1 = fastest
    archive.on('error', err => logger.error('Archive error:', err));
    archive.pipe(res);

    // Helper: fetch URL and return readable stream, following redirects
    function getStream(url) {
      return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req2 = client.get(url, (response) => {
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            getStream(response.headers.location).then(resolve).catch(reject);
          } else if (response.statusCode === 200) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${response.statusCode}`));
          }
        });
        req2.on('error', reject);
        req2.setTimeout(60000, () => { req2.destroy(); reject(new Error('Request timeout')); });
      });
    }

    let added = 0;
    for (const file of files) {
      if (!file.path) continue;

      let folderPath = 'Uncategorized';
      if (file.chapterId) {
        const ch = chapterMap[file.chapterId.toString()];
        if (ch) {
          const subjName = ch.subjectId ? (subjectMap[ch.subjectId] || 'Unknown') : 'Unknown';
          folderPath = `${subjName}/${ch.name}`;
        }
      } else if (file.subjectId) {
        folderPath = subjectMap[file.subjectId.toString()] || 'Unknown';
      }

      const safeFilename = file.originalname.replace(/[/\\?%*:|"<>]/g, '-');
      const zipPath = `${folderPath}/${safeFilename}`;

      try {
        let downloadUrl = file.path;
        if (file.storageType === 'b2' && file.filename) {
          downloadUrl = await getSignedFileUrl(file.filename, 3600);
        }
        const stream = await getStream(downloadUrl);
        archive.append(stream, { name: zipPath });
        added++;
      } catch (err) {
        logger.warn(`Skipping ${file.originalname}: ${err.message}`);
        archive.append(`Could not download: ${file.originalname}\nURL: ${file.path}\nError: ${err.message}`, { name: `${folderPath}/${safeFilename}.error.txt` });
      }
    }

    archive.append(JSON.stringify({ exportedAt: new Date().toISOString(), totalFiles: files.length, filesAdded: added }, null, 2), { name: '_manifest.json' });
    await archive.finalize();
    logger.info(`Real-file ZIP backup by ${req.user.email} — ${added}/${files.length} files`);

  } catch (error) {
    logger.error('Backup error:', error);
    if (!res.headersSent) res.status(500).json({ success: false, message: 'Backup failed: ' + error.message });
  }
};

// @desc    Get recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    const [recentFiles, recentUsers, recentMessages] = await Promise.all([
      File.find({}).sort({ createdAt: -1 }).limit(10),
      User.find({}).sort({ createdAt: -1 }).limit(10),
      Message.find({}).sort({ createdAt: -1 }).limit(10)
    ]);

    const fileActivity = await Promise.all(recentFiles.map(async (f) => {
      const user = await User.findById(f.uploadedBy);
      return { type: 'file', description: `${user?.username || 'Unknown'} uploaded ${f.originalname}`, createdAt: f.createdAt };
    }));

    const userActivity = recentUsers.map(u => ({
      type: 'user', description: `${u.username} registered`, createdAt: u.createdAt
    }));

    const msgActivity = await Promise.all(recentMessages.map(async (m) => {
      const [from, to] = await Promise.all([User.findById(m.from), User.findById(m.to)]);
      return { type: 'message', description: `${from?.username || 'Unknown'} sent message to ${to?.username || 'Unknown'}`, createdAt: m.createdAt };
    }));

    const allActivity = [...fileActivity, ...userActivity, ...msgActivity]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    res.json({ success: true, activity: allActivity });
  } catch (error) {
    logger.error('Get activity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
