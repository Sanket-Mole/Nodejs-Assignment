const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    logger.warn('Access attempt without token', { ip: req.ip, path: req.path });
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Invalid token attempt', { ip: req.ip, path: req.path, error: err.message });
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    logger.info('Token verified successfully', { userId: user.id, path: req.path });
    next();
  });
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

module.exports = { authenticateToken, generateToken }; 