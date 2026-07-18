const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getHolidays,
  createHoliday,
  deleteHoliday,
  getStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Users CRUD (Admin Only)
router.route('/users')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

router.route('/users/:id')
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

// Departments CRUD (Fetch is available to all logged-in, modify is Admin Only)
router.route('/departments')
  .get(protect, getDepartments)
  .post(protect, authorize('admin'), createDepartment);

router.route('/departments/:id')
  .put(protect, authorize('admin'), updateDepartment)
  .delete(protect, authorize('admin'), deleteDepartment);

// Holidays CRUD (Fetch is available to all logged-in, modify is Admin Only)
router.route('/holidays')
  .get(protect, getHolidays)
  .post(protect, authorize('admin'), createHoliday);

router.route('/holidays/:id')
  .delete(protect, authorize('admin'), deleteHoliday);

// Stats & Dashboard Analytics (Admin Only)
router.get('/stats', protect, authorize('admin'), getStats);

module.exports = router;
