const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

const TEST_BYPASS_TOKEN = 'bypass-otp-shelfmerch';

// Middleware: if NODE_ENV=test and x-test-token header is present,
// look up the user by x-test-email and return a real JWT immediately.
// Never active in production — check is first line.
exports.testAuthMiddleware = async (req, res, next) => {
  if (process.env.NODE_ENV !== 'test') return next();

  const providedToken = req.headers['x-test-token'];
  const email = req.headers['x-test-email'];

  if (providedToken !== TEST_BYPASS_TOKEN || !email) return next();

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: `Test user not found: ${email}` });
    }
    const token = generateToken(user._id.toString());
    return res.json({
      success: true,
      token,
      user: { id: user._id.toString(), email: user.email, role: user.role, name: user.name }
    });
  } catch (err) {
    console.error('[testAuth] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Test auth middleware error' });
  }
};
