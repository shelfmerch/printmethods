const express = require('express');
const router = express.Router();
const CareIcon = require('../models/CareIcon');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');
const { uploadToS3 } = require('../utils/s3Upload');

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * @route   GET /api/care-icons
 * @desc    Get all global care icons
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const icons = await CareIcon.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: icons
    });
  } catch (error) {
    console.error('Error fetching care icons:', error);
    res.status(500).json({ success: false, message: 'Server error fetching care icons' });
  }
});

/**
 * @route   POST /api/care-icons
 * @desc    Add a new global care icon
 * @access  Private/Admin
 */
router.post('/', protect, adminOnly, upload.single('icon'), async (req, res) => {
  try {
    const { label, type = 'custom', iconKey } = req.body;

    if (!req.file && !req.body.url) {
      return res.status(400).json({ success: false, message: 'Please upload an icon file or provide a URL' });
    }

    let url = req.body.url;
    if (req.file) {
      url = await uploadToS3(req.file.buffer, req.file.originalname, 'care-icons');
    }

    const careIcon = new CareIcon({
      url,
      label,
      type,
      iconKey
    });

    await careIcon.save();

    res.status(201).json({
      success: true,
      data: careIcon
    });
  } catch (error) {
    console.error('Error creating care icon:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Icon key already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error creating care icon' });
  }
});

/**
 * @route   DELETE /api/care-icons/:id
 * @desc    Delete a global care icon
 * @access  Private/Admin
 */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const icon = await CareIcon.findById(req.params.id);
    if (!icon) {
      return res.status(404).json({ success: false, message: 'Icon not found' });
    }

    await icon.deleteOne();
    res.json({ success: true, message: 'Icon removed' });
  } catch (error) {
    console.error('Error deleting care icon:', error);
    res.status(500).json({ success: false, message: 'Server error deleting care icon' });
  }
});

module.exports = router;
