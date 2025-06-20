const { body, query, param, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Product creation validation
const validateCreateProduct = [
  body('productName')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  
  body('expiryDate')
    .notEmpty()
    .withMessage('Expiry date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  
  body('totalQuantity')
    .notEmpty()
    .withMessage('Total quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be either Active or Inactive'),
  
  handleValidationErrors
];

// Product update validation
const validateUpdateProduct = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('productName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  
  body('totalQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be either Active or Inactive'),
  
  handleValidationErrors
];

// Product filters validation
const validateProductFilters = [
  query('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be either Active or Inactive'),
  
  query('search')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Search term cannot be empty'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt'])
    .withMessage('Sort by must be createdAt'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  handleValidationErrors
];

// Purchase validation
const validatePurchase = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  handleValidationErrors
];

// Email validation
const validateEmail = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  
  handleValidationErrors
];

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductFilters,
  validatePurchase,
  validateEmail,
  handleValidationErrors
}; 