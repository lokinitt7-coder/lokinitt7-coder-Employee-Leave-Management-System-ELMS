const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getBusinessDaysCount, mapLeaveTypeToKey } = require('./leaveController');

// @desc    Get all leave requests of team members
// @route   GET /api/manager/leaves
// @access  Private (Manager only)
const getTeamLeaves = async (req, res) => {
  try {
    // Find all users who report to this manager
    const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
    const memberIds = teamMembers.map(member => member._id);

    // Find leaves submitted by these team members
    const leaves = await LeaveRequest.find({ employeeId: { $in: memberIds } })
      .populate('employeeId', 'name email department designation leaveBalance')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve a leave request
// @route   PUT /api/manager/leaves/:id/approve
// @access  Private (Manager only)
const approveLeave = async (req, res) => {
  const { comment } = req.body;

  try {
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Verify manager authority: the employee must have this manager
    const employee = await User.findById(leave.employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (employee.managerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to approve this request' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${leave.status}` });
    }

    const duration = getBusinessDaysCount(leave.startDate, leave.endDate, leave.halfDay);
    const balanceKey = mapLeaveTypeToKey(leave.leaveType);

    if (!balanceKey) {
      return res.status(400).json({ success: false, message: 'Invalid leave type' });
    }

    // Double-check balance
    if (employee.leaveBalance[balanceKey] < duration) {
      return res.status(400).json({
        success: false,
        message: `Employee has insufficient balance (${employee.leaveBalance[balanceKey]} days available, requested ${duration} days).`
      });
    }

    // Deduct balance
    employee.leaveBalance[balanceKey] -= duration;
    await employee.save();

    // Update leave request
    leave.status = 'approved';
    leave.managerComment = comment || 'Approved by Manager';
    await leave.save();

    // Notify employee
    await Notification.create({
      userId: leave.employeeId,
      message: `Your ${leave.leaveType} from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been Approved. Comment: ${leave.managerComment}`
    });

    res.json({
      success: true,
      message: 'Leave request approved successfully',
      data: leave
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a leave request
// @route   PUT /api/manager/leaves/:id/reject
// @access  Private (Manager only)
const rejectLeave = async (req, res) => {
  const { comment } = req.body;

  try {
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Verify manager authority
    const employee = await User.findById(leave.employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (employee.managerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this request' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${leave.status}` });
    }

    // Update leave request
    leave.status = 'rejected';
    leave.managerComment = comment || 'Rejected by Manager';
    await leave.save();

    // Notify employee
    await Notification.create({
      userId: leave.employeeId,
      message: `Your ${leave.leaveType} from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been Rejected. Reason/Comment: ${leave.managerComment}`
    });

    res.json({
      success: true,
      message: 'Leave request rejected successfully',
      data: leave
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTeamLeaves,
  approveLeave,
  rejectLeave
};
