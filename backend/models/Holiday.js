const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Holiday title is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Holiday date is required'],
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Holiday', holidaySchema);
