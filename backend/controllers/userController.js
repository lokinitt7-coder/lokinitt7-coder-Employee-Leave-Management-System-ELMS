const User = require('../models/User');


// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private

// const User = require('../models/User');
const path = require('path');
// Get all managers (public route for registration)
const getManagers = async (req, res) => {
  try {
    const managers = await User.find(
      { role: 'manager' },
      '_id name role department'
    );

    res.json({
      success: true,
      data: managers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch managers',
    });
  }
};


const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('managerId', 'name email designation')
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {  
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    
    // Handle profile photo upload if present
    if (req.file) {
      // Save local relative path /uploads/filename
      user.profilePhoto = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();
    
    // Remove password and return
    const responseUser = await User.findById(updatedUser._id)
      .populate('managerId', 'name email designation')
      .select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: responseUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// module.exports = {
//   getProfile,
//   updateProfile
// };

module.exports = {
  getProfile,
  updateProfile,
  getManagers
};