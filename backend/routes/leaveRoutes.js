const express = require('express');
const router = express.Router();
const {
  createLeaveRequest,
  getMyLeaveRequests,
  cancelLeaveRequest
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .post(protect, upload.single('attachment'), createLeaveRequest);

router.get('/my', protect, getMyLeaveRequests);
router.put('/:id/cancel', protect, cancelLeaveRequest);

module.exports = router;
