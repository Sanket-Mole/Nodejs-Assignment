const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validatePurchase,
  validateEmail
} = require('../middlewares/validation');
const {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  deleteProduct,
  purchaseProduct,
  updateProductQuantity,
  shareProduct
} = require('../controllers/productController');

// Apply authentication to all routes
router.use(authenticateToken);


router.post('/', upload.single('productImage'), handleUploadError, validateCreateProduct, createProduct);


router.patch('/:id', upload.single('productImage'), handleUploadError, validateUpdateProduct, updateProduct);


router.get('/list', getProducts);


router.get('/:id', getProductById);


router.delete('/:id', deleteProduct);


router.post('/:id/purchase', validatePurchase, purchaseProduct);


router.put('/:id/quantity', updateProductQuantity);


router.post('/:id/share', validateEmail, shareProduct);

module.exports = router; 