const mongoose = require('mongoose');

const generatedImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  prompt: { type: String, required: true },
  style: { type: String, default: 'illustration' },
  createdAt: { type: Date, default: Date.now }
});

const userGeneratedImagesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // one document per user
  },
  images: [generatedImageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('UserGeneratedImages', userGeneratedImagesSchema);
