const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ONLY works in test mode - completely disabled in production
router.post('/test-login', async (req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    // Find real user in DB
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: `No user found with email: ${email}. Create this account in your app first.`
      });
    }

    // Generate JWT exactly like your real auth does
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      refreshToken,
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    });

  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
