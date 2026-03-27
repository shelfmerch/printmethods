const mongoose = require('mongoose');

const CareIconSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['predefined', 'custom'],
    default: 'custom'
  },
  iconKey: {
    type: String,
    unique: true,
    sparse: true // Only for predefined icons
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CareIcon', CareIconSchema);
