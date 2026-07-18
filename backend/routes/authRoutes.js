const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
 changePassword,
  forgotPassword,
  getManagersList
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.post('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.get('/managers', getManagersList);

module.exports = router;