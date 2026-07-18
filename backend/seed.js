require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const LeaveRequest = require('./models/LeaveRequest');
const Department = require('./models/Department');
const Holiday = require('./models/Holiday');
const Notification = require('./models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leave_management';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database. Cleaning old data...');

    // Clear existing data
    await User.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Department.deleteMany({});
    await Holiday.deleteMany({});
    await Notification.deleteMany({});

    console.log('Database cleared. Seeding users...');

    // 1. Create Admin
    const admin = new User({
      name: 'Sarah Connor',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin',
      department: 'HR',
      designation: 'HR Director',
      joiningDate: new Date('2022-01-15')
    });
    await admin.save();

    // 2. Create Managers
    const manager1 = new User({
      name: 'John Doe',
      email: 'manager1@company.com',
      password: 'manager123',
      role: 'manager',
      department: 'Engineering',
      designation: 'Engineering Manager',
      joiningDate: new Date('2023-03-10')
    });
    await manager1.save();

    const manager2 = new User({
      name: 'Jane Smith',
      email: 'manager2@company.com',
      password: 'manager123',
      role: 'manager',
      department: 'Sales',
      designation: 'Sales Director',
      joiningDate: new Date('2023-08-01')
    });
    await manager2.save();

    // 3. Create Employees
    const employee1 = new User({
      name: 'Alice Johnson',
      email: 'employee1@company.com',
      password: 'employee123',
      role: 'employee',
      department: 'Engineering',
      designation: 'Senior Developer',
      managerId: manager1._id,
      joiningDate: new Date('2024-05-12'),
      leaveBalance: {
        casualLeave: 10,
        sickLeave: 8,
        earnedLeave: 15,
        wfh: 18,
        maternityLeave: 90,
        paternityLeave: 15,
        unpaidLeave: 99
      }
    });
    await employee1.save();

    const employee2 = new User({
      name: 'Bob Miller',
      email: 'employee2@company.com',
      password: 'employee123',
      role: 'employee',
      department: 'Engineering',
      designation: 'Frontend Engineer',
      managerId: manager1._id,
      joiningDate: new Date('2025-01-20'),
      leaveBalance: {
        casualLeave: 12,
        sickLeave: 10,
        earnedLeave: 15,
        wfh: 20,
        maternityLeave: 90,
        paternityLeave: 15,
        unpaidLeave: 99
      }
    });
    await employee2.save();

    const employee3 = new User({
      name: 'Charlie Brown',
      email: 'employee3@company.com',
      password: 'employee123',
      role: 'employee',
      department: 'Sales',
      designation: 'Account Executive',
      managerId: manager2._id,
      joiningDate: new Date('2024-11-01'),
      leaveBalance: {
        casualLeave: 8,
        sickLeave: 9,
        earnedLeave: 12,
        wfh: 15,
        maternityLeave: 90,
        paternityLeave: 15,
        unpaidLeave: 99
      }
    });
    await employee3.save();

    const employee4 = new User({
      name: 'Diana Prince',
      email: 'employee4@company.com',
      password: 'employee123',
      role: 'employee',
      department: 'Sales',
      designation: 'Sales Representative',
      managerId: manager2._id,
      joiningDate: new Date('2025-02-15'),
      leaveBalance: {
        casualLeave: 12,
        sickLeave: 10,
        earnedLeave: 15,
        wfh: 20,
        maternityLeave: 90,
        paternityLeave: 15,
        unpaidLeave: 99
      }
    });
    await employee4.save();

    console.log('Users seeded. Seeding departments...');

    // 4. Create Departments
    const depHR = new Department({ name: 'HR', managerId: admin._id });
    await depHR.save();

    const depEng = new Department({ name: 'Engineering', managerId: manager1._id });
    await depEng.save();

    const depSales = new Department({ name: 'Sales', managerId: manager2._id });
    await depSales.save();

    console.log('Departments seeded. Seeding holidays...');

    // 5. Create Holidays (for 2026/2027)
    const holidays = [
      { title: "New Year's Day", date: new Date('2026-01-01') },
      { title: "Martin Luther King Jr. Day", date: new Date('2026-01-19') },
      { title: "Good Friday", date: new Date('2026-04-03') },
      { title: "Memorial Day", date: new Date('2026-05-25') },
      { title: "Independence Day", date: new Date('2026-07-04') },
      { title: "Labor Day", date: new Date('2026-09-07') },
      { title: "Thanksgiving Day", date: new Date('2026-11-26') },
      { title: "Christmas Day", date: new Date('2026-12-25') }
    ];
    await Holiday.insertMany(holidays);

    console.log('Holidays seeded. Seeding leave requests...');

    // 6. Create Leave Requests
    const leaveRequests = [
      // Alice (employee1, manager: John Doe)
      {
        employeeId: employee1._id,
        leaveType: 'Sick Leave',
        startDate: new Date('2026-06-10'),
        endDate: new Date('2026-06-12'),
        halfDay: false,
        reason: 'Recovering from fever and cold',
        status: 'approved',
        managerComment: 'Approved. Get well soon!'
      },
      {
        employeeId: employee1._id,
        leaveType: 'Casual Leave',
        startDate: new Date('2026-08-15'),
        endDate: new Date('2026-08-19'),
        halfDay: false,
        reason: 'Going for a family vacation to the grand canyon',
        status: 'pending'
      },
      // Bob (employee2, manager: John Doe)
      {
        employeeId: employee2._id,
        leaveType: 'Earned Leave',
        startDate: new Date('2026-02-05'),
        endDate: new Date('2026-02-10'),
        halfDay: false,
        reason: 'Sailing trip with friends',
        status: 'rejected',
        managerComment: 'Sorry Bob, we have a major release scheduled during this period.'
      },
      {
        employeeId: employee2._id,
        leaveType: 'Work From Home',
        startDate: new Date('2026-07-10'),
        endDate: new Date('2026-07-10'),
        halfDay: false,
        reason: 'Internet technician visiting my house',
        status: 'approved',
        managerComment: 'Approved. Make sure to stay online on Slack.'
      },
      {
        employeeId: employee2._id,
        leaveType: 'Sick Leave',
        startDate: new Date('2026-07-20'),
        endDate: new Date('2026-07-20'),
        halfDay: true,
        reason: 'Dentist appointment in the afternoon',
        status: 'pending'
      },
      // Charlie (employee3, manager: Jane Smith)
      {
        employeeId: employee3._id,
        leaveType: 'Work From Home',
        startDate: new Date('2026-07-02'),
        endDate: new Date('2026-07-03'),
        halfDay: false,
        reason: 'Plumbing leak repairs at home',
        status: 'approved',
        managerComment: 'Approved. Keep me updated.'
      },
      {
        employeeId: employee3._id,
        leaveType: 'Casual Leave',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-04'),
        halfDay: false,
        reason: 'Attending a close cousin\'s wedding',
        status: 'pending'
      },
      // Diana (employee4, manager: Jane Smith)
      {
        employeeId: employee4._id,
        leaveType: 'Unpaid Leave',
        startDate: new Date('2026-07-12'),
        endDate: new Date('2026-07-14'),
        halfDay: false,
        reason: 'Personal emergency at hometown',
        status: 'approved',
        managerComment: 'Approved. Hope everything is fine.',
        isEmergency: true
      }
    ];
    await LeaveRequest.insertMany(leaveRequests);

    console.log('Leave requests seeded. Seeding notifications...');

    // 7. Create Notifications
    const notifications = [
      {
        userId: employee1._id,
        message: 'Your Sick Leave from 2026-06-10 to 2026-06-12 has been Approved.',
        isRead: true
      },
      {
        userId: employee2._id,
        message: 'Your Earned Leave from 2026-02-05 to 2026-02-10 has been Rejected.',
        isRead: false
      },
      {
        userId: manager1._id,
        message: 'New Casual Leave request submitted by Alice Johnson.',
        isRead: false
      },
      {
        userId: manager2._id,
        message: 'New Casual Leave request submitted by Charlie Brown.',
        isRead: false
      }
    ];
    await Notification.insertMany(notifications);

    console.log('Database seeding finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
};

seedData();
