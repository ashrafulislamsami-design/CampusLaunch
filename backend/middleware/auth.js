const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if no token or improper format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    // Block suspended users from all protected routes
    const user = await User.findById(req.user.id).select('isSuspended role');
    if (!user) return res.status(401).json({ message: 'User account not found' });
    if (user.isSuspended) {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    // Keep role in sync with DB (in case it changed)
    req.user.role = user.role;

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
