const { generateToken } = require('../middlewares/auth');
const logger = require('../utils/logger');


const login = async (req, res) => {
  try {
    const { username, password } = req.body;


    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Generate token
    const token = generateToken(username);

    logger.info('User logged in successfully', { username });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        username
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};


const verifyToken = async (req, res) => {
  try {
    // If middleware reaches here, token is valid
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};

module.exports = {
  login,
  verifyToken
}; 