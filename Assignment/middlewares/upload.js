const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Create upload directory if it doesn't exist
const uploadDir = process.env.UPLOAD_PATH || './images/products';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB default
  },
  fileFilter: fileFilter
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      logger.warn('File size limit exceeded', { 
        file: req.file?.originalname, 
        size: req.file?.size 
      });
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
  } else if (error.message === 'Only image files are allowed') {
    logger.warn('Invalid file type uploaded', { 
      file: req.file?.originalname, 
      mimetype: req.file?.mimetype 
    });
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }
  
  logger.error('File upload error:', error);
  return res.status(500).json({
    success: false,
    message: 'File upload failed'
  });
};

module.exports = { upload, handleUploadError }; 