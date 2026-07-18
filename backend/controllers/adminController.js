const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const Department = require('../models/Department');
const Holiday = require('../models/Holiday');

// ================= USER MANAGEMENT =================

// @desc    Get all users (employees, managers, admins)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const { role, search, status } = req.query;
    let query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const users = await User.find(query)
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Private (Admin only)
const createUser = async (req, res) => {
  const { name, email, password, role, department, designation, managerId, joiningDate, leaveBalance } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'employee',
      department: department || '',
      designation: designation || '',
      managerId: managerId || null,
      joiningDate: joiningDate || new Date(),
      status: 'active'
    });

    if (leaveBalance) {
      user.leaveBalance = { ...user.leaveBalance, ...leaveBalance };
    }

    await user.save();
    res.status(201).json({ success: true, message: 'User created successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  const { name, email, role, department, designation, managerId, status, leaveBalance } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check email uniqueness if changed
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already taken by another user' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (designation) user.designation = designation;
    if (managerId !== undefined) user.managerId = managerId || null;
    if (status) user.status = status;
    if (leaveBalance) {
      user.leaveBalance = { ...user.leaveBalance.toObject(), ...leaveBalance };
    }

    await user.save();
    res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deactivate/Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Instead of deleting, deactivate the user to maintain data references
    user.status = 'inactive';
    await user.save();

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DEPARTMENT MANAGEMENT =================

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Private (Admin only or authed)
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('managerId', 'name email designation')
      .sort({ name: 1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create department
// @route   POST /api/admin/departments
// @access  Private (Admin only)
const createDepartment = async (req, res) => {
  const { name, managerId } = req.body;
  try {
    const deptExists = await Department.findOne({ name });
    if (deptExists) {
      return res.status(400).json({ success: false, message: 'Department already exists' });
    }

    const department = await Department.create({
      name,
      managerId: managerId || null
    });
    res.status(201).json({ success: true, message: 'Department created successfully', data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update department
// @route   PUT /api/admin/departments/:id
// @access  Private (Admin only)
const updateDepartment = async (req, res) => {
  const { name, managerId } = req.body;
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    if (name) department.name = name;
    department.managerId = managerId || null;
    await department.save();

    res.json({ success: true, message: 'Department updated successfully', data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete department
// @route   DELETE /api/admin/departments/:id
// @access  Private (Admin only)
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= HOLIDAY CONFIGURATION =================

// @desc    Get all holidays
// @route   GET /api/admin/holidays
// @access  Private (Authenticated users)
const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json({ success: true, data: holidays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create holiday
// @route   POST /api/admin/holidays
// @access  Private (Admin only)
const createHoliday = async (req, res) => {
  const { title, date } = req.body;
  try {
    const holidayExists = await Holiday.findOne({ date });
    if (holidayExists) {
      return res.status(400).json({ success: false, message: 'A holiday on this date already exists' });
    }

    const holiday = await Holiday.create({ title, date });
    res.status(201).json({ success: true, message: 'Holiday created successfully', data: holiday });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete holiday
// @route   DELETE /api/admin/holidays/:id
// @access  Private (Admin only)
const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }
    res.json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= ANALYTICS & STATS =================

// @desc    Get system-wide stats and charts data
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getStats = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'employee', status: 'active' });
    const totalManagers = await User.countDocuments({ role: 'manager', status: 'active' });
    const pendingLeavesCount = await LeaveRequest.countDocuments({ status: 'pending' });
    const approvedLeavesCount = await LeaveRequest.countDocuments({ status: 'approved' });

    // Fetch all leave requests for admin main list view
    const allLeaves = await LeaveRequest.find()
      .populate('employeeId', 'name email department designation')
      .sort({ createdAt: -1 });

    // 1. Department-wise employee count
    const departments = await Department.find();
    const deptStats = [];
    for (const dept of departments) {
      const count = await User.countDocuments({ department: dept.name, status: 'active' });
      deptStats.push({ name: dept.name, value: count });
    }

    // 2. Status Breakdown
    const statusBreakdown = [
      { name: 'Pending', value: await LeaveRequest.countDocuments({ status: 'pending' }) },
      { name: 'Approved', value: await LeaveRequest.countDocuments({ status: 'approved' }) },
      { name: 'Rejected', value: await LeaveRequest.countDocuments({ status: 'rejected' }) },
      { name: 'Cancelled', value: await LeaveRequest.countDocuments({ status: 'cancelled' }) }
    ];

    // 3. Leave types breakdown
    const typeBreakdown = [
      { name: 'Casual Leave', value: await LeaveRequest.countDocuments({ leaveType: 'Casual Leave', status: 'approved' }) },
      { name: 'Sick Leave', value: await LeaveRequest.countDocuments({ leaveType: 'Sick Leave', status: 'approved' }) },
      { name: 'Earned Leave', value: await LeaveRequest.countDocuments({ leaveType: 'Earned Leave', status: 'approved' }) },
      { name: 'WFH', value: await LeaveRequest.countDocuments({ leaveType: 'Work From Home', status: 'approved' }) },
      { name: 'Unpaid Leave', value: await LeaveRequest.countDocuments({ leaveType: 'Unpaid Leave', status: 'approved' }) }
    ];

    // 4. Monthly trends (for the current calendar year)
    const currentYear = new Date().getFullYear();
    const monthlyLeaves = await LeaveRequest.find({
      status: 'approved',
      startDate: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`)
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = monthNames.map((name, index) => {
      // Count requests that fall in this month
      const count = monthlyLeaves.filter(leave => {
        const month = new Date(leave.startDate).getMonth();
        return month === index;
      }).length;

      return { month: name, leaves: count };
    });

    res.json({
      success: true,
      data: {
        counts: {
          totalEmployees,
          totalManagers,
          pendingLeavesCount,
          approvedLeavesCount
        },
        deptStats,
        statusBreakdown,
        typeBreakdown,
        monthlyTrends,
        allLeaves
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};




// const User = require('../models/User');  

// const getManagersList = async (req, res) => {
//   try {
//     const managers = await User.find(
//       { role: 'manager' },
//       '_id name department role'
//     );

//     res.json({
//       success: true,
//       data: managers,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// module.exports = {
//     registerUser,
//     loginUser,
//     logoutUser,
//     changePassword,
//     forgotPassword,
//     getManagersList
// };