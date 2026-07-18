const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, upload.single('profilePhoto'), updateProfile);

module.exports = router;
