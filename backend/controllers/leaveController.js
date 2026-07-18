const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Utility to calculate business days between two dates
const getBusinessDaysCount = (startDate, endDate, halfDay) => {
  if (halfDay) return 0.5;
  
  let count = 0;
  let curDate = new Date(startDate.getTime());
  curDate.setHours(0, 0, 0, 0);
  
  let endLimit = new Date(endDate.getTime());
  endLimit.setHours(0, 0, 0, 0);

  while (curDate <= endLimit) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Saturday (6) and Sunday (0)
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
};

// Map leave names to schema keys
const mapLeaveTypeToKey = (leaveType) => {
  switch (leaveType) {
    case 'Casual Leave': return 'casualLeave';
    case 'Sick Leave': return 'sickLeave';
    case 'Earned Leave': return 'earnedLeave';
    case 'Work From Home': return 'wfh';
    case 'Maternity Leave': return 'maternityLeave';
    case 'Paternity Leave': return 'paternityLeave';
    case 'Unpaid Leave': return 'unpaidLeave';
    default: return null;
  }
};

// @desc    Apply for a leave
// @route   POST /api/leaves
// @access  Private
const createLeaveRequest = async (req, res) => {
  const { leaveType, startDate, endDate, halfDay, reason, isEmergency } = req.body;

  try {
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
    }

    // Calculate duration in business days
    const duration = getBusinessDaysCount(start, end, halfDay === 'true' || halfDay === true);

    if (duration <= 0) {
      return res.status(400).json({ success: false, message: 'Duration must be at least 0.5 business days (weekends are excluded)' });
    }

    const user = await User.findById(req.user._id);
    const balanceKey = mapLeaveTypeToKey(leaveType);

    if (!balanceKey) {
      return res.status(400).json({ success: false, message: 'Invalid leave type selected' });
    }

    // Check balance limit
    const currentBalance = user.leaveBalance[balanceKey];
    if (currentBalance < duration) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient leave balance. Requested: ${duration} days, Available: ${currentBalance} days.` 
      });
    }

    // Check for overlapping approved/pending requests
    const overlappingRequests = await LeaveRequest.find({
      employeeId: req.user._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingRequests.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a pending or approved leave request overlapping with these dates.' 
      });
    }

    // Check file attachment
    let attachmentPath = '';
    if (req.file) {
      attachmentPath = `/uploads/${req.file.filename}`;
    }

    // Create request (status defaults to 'pending')
    const leaveRequest = await LeaveRequest.create({
      employeeId: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      halfDay: halfDay === 'true' || halfDay === true,
      reason,
      attachment: attachmentPath,
      isEmergency: isEmergency === 'true' || isEmergency === true
    });

    // Notify Manager
    if (user.managerId) {
      await Notification.create({
        userId: user.managerId,
        message: `${user.name} has submitted a new ${leaveType} request (${duration} days) starting ${start.toLocaleDateString()}.`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current employee's leave history
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employeeId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a pending or approved leave request
// @route   PUT /api/leaves/:id/cancel
// @access  Private
const cancelLeaveRequest = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Check ownership
    if (leave.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    // Can only cancel pending or approved
    if (leave.status === 'rejected' || leave.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Request is already ${leave.status}` });
    }

    const originalStatus = leave.status;
    leave.status = 'cancelled';
    await leave.save();

    // If it was already approved, refund the leave balance!
    if (originalStatus === 'approved') {
      const user = await User.findById(req.user._id);
      const balanceKey = mapLeaveTypeToKey(leave.leaveType);
      const duration = getBusinessDaysCount(leave.startDate, leave.endDate, leave.halfDay);
      
      if (balanceKey) {
        user.leaveBalance[balanceKey] += duration;
        await user.save();
      }

      // Notify manager of cancellation
      if (user.managerId) {
        await Notification.create({
          userId: user.managerId,
          message: `${user.name} has cancelled their approved ${leave.leaveType} request for ${leave.startDate.toLocaleDateString()}.`
        });
      }
    } else {
      // If it was pending, just notify manager of cancellation
      const user = await User.findById(req.user._id);
      if (user.managerId) {
        await Notification.create({
          userId: user.managerId,
          message: `${user.name} has cancelled their pending ${leave.leaveType} request.`
        });
      }
    }

    res.json({ success: true, message: 'Leave request cancelled successfully', data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createLeaveRequest,
  getMyLeaveRequests,
  cancelLeaveRequest,
  getBusinessDaysCount,
  mapLeaveTypeToKey
};
