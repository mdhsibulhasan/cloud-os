const bcrypt = require('bcrypt');
const db = require('../config/db');
const logger = require('../utils/logger');
const { deleteFromCloudinary } = require('../utils/thumbnailGenerator');

// @desc    Get all approved users (exclude self)
// @route   GET /api/users/approved
exports.getApprovedUsers = async (req, res) => {
  try {
    const users = await db.users.find({ status: 'approved', _id: { $ne: req.user.id } });
    res.json({ success: true, users: users.map(u => ({ id: u._id, username: u.username, email: u.email, profilePicture: u.profilePicture, role: u.role })) });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.users.find({});
    res.json({ success: true, users: users.map(u => ({ id: u._id, username: u.username, email: u.email, role: u.role, status: u.status, profilePicture: u.profilePicture, createdAt: u.createdAt })) });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

// @desc    Update own profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await db.users.findOne({ _id: req.user.id });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (username && username !== user.username) user.username = username;

    if (email && email !== user.email) {
      const exists = await db.users.findOne({ email, _id: { $ne: req.user.id } });
      if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });
      user.email = email;
    }

    if (newPassword && currentPassword) {
      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (req.file) {
      // Delete old profile picture from Cloudinary if it exists
      if (user.profilePicture && user.profilePicture.startsWith('http')) {
        await deleteFromCloudinary(user.profilePicture, 'image');
      }
      // req.file.path is the Cloudinary URL when using multer-storage-cloudinary
      user.profilePicture = req.file.path;
    }

    await db.users.update({ _id: req.user.id }, user);
    res.json({ success: true, message: 'Profile updated successfully', user: { id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture } });
  } catch (e) { logger.error('Update profile error:', e); res.status(500).json({ success: false, message: 'Server error' }); }
};

// @desc    Admin reset a user's password (no old password needed)
// @route   PUT /api/users/:id/reset-password
exports.adminResetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const user = await db.users.findOne({ _id: id });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Admin cannot reset another admin's password
    if (user.role === 'admin' && req.user.id !== id) return res.status(403).json({ success: false, message: 'Cannot reset another admin password' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await db.users.update({ _id: id }, user);
    logger.info(`Password reset for user ${user.email} by admin`);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

// @desc    Promote/demote user role (admin only, cannot change own role or another admin)
// @route   PUT /api/users/:id/role
exports.changeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'moderator', 'admin'];
    if (!validRoles.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });

    // Cannot change own role
    if (id === req.user.id) return res.status(403).json({ success: false, message: 'You cannot change your own role' });

    const target = await db.users.findOne({ _id: id });
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Admin cannot demote another admin
    if (target.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot change another admin\'s role' });

    // Only admin can promote to admin
    if (role === 'admin' && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only admin can promote to admin' });

    await db.users.update({ _id: id }, { $set: { role } });
    logger.info(`Role changed: ${target.email} → ${role} by ${req.user.email}`);
    res.json({ success: true, message: `Role updated to ${role}` });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

// @desc    Update user (admin/moderator)
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, status, role, resetPassword } = req.body;
    const user = await db.users.findOne({ _id: id });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Moderators cannot edit admins or other moderators
    if (req.user.role === 'moderator' && (user.role === 'admin' || user.role === 'moderator')) {
      return res.status(403).json({ success: false, message: 'Moderators cannot edit admins or other moderators' });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (status) user.status = status;
    
    // Only admins can change roles
    if (role && req.user.role === 'admin' && user.role !== 'admin') user.role = role;
    
    // Only admins can reset passwords
    if (resetPassword && req.user.role === 'admin') user.passwordHash = await bcrypt.hash(resetPassword, 10);

    await db.users.update({ _id: id }, user);
    res.json({ success: true, message: 'User updated successfully', user: { id: user._id, username: user.username, email: user.email, role: user.role, status: user.status } });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.users.findOne({ _id: id });
    if (user && user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin account' });
    await db.users.remove({ _id: id });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};
