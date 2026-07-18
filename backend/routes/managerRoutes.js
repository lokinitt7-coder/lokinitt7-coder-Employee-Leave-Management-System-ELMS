const express = require('express');
const router = express.Router();
const {
  getTeamLeaves,
  approveLeave,
  rejectLeave
} = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('manager', 'admin'));

router.get('/leaves', getTeamLeaves);
router.put('/leaves/:id/approve', approveLeave);
router.put('/leaves/:id/reject', rejectLeave);

module.exports = router;
