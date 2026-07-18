const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee reference is required']
  },
  leaveType: {
    type: String,
    required: [true, 'Leave type is required'],
    enum: [
      'Casual Leave',
      'Sick Leave',
      'Earned Leave',
      'Work From Home',
      'Unpaid Leave',
      'Maternity Leave',
      'Paternity Leave'
    ]
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  halfDay: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  managerComment: {
    type: String,
    default: ''
  },
  attachment: {
    type: String,
    default: ''
  },
  isEmergency: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
