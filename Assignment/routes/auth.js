const express = require('express');
const router = express.Router();
const { login, verifyToken } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');


router.post('/login', login);

router.post('/verify', authenticateToken, verifyToken);

module.exports = router; 