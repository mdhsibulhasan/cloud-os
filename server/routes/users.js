const express = require('express');
const router = express.Router();
const {
  getApprovedUsers,
  getAllUsers,
  updateProfile,
  updateUser,
  deleteUser,
  adminResetPassword,
  changeRole
} = require('../controllers/userController');
const { protect, adminOnly, adminOrModerator, approvedOnly } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

router.get('/approved', protect, approvedOnly, getApprovedUsers);
router.get('/', protect, adminOrModerator, getAllUsers);
router.put('/profile', protect, uploadProfile.single('profilePicture'), updateProfile);
router.put('/:id/reset-password', protect, adminOnly, adminResetPassword);
router.put('/:id/role', protect, adminOnly, changeRole);
router.put('/:id', protect, adminOrModerator, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
