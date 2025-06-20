const Product = require('../models/Product');
const { sendEmail } = require('../config/email');
const logger = require('../utils/logger');
const path = require('path');
const mongoose = require('mongoose');


const findProductByIdOrProductId = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byObjectId = await Product.findById(id);
    if (byObjectId) return byObjectId;
  }

  if (!isNaN(Number(id))) {
    return await Product.findOne({ productId: Number(id) });
  }
  return null;
};


const createProduct = async (req, res) => {
  try {
    const { productName, expiryDate, totalQuantity, status = 'Active' } = req.body;
    
    const product = new Product({
      productName,
      expiryDate,
      totalQuantity,
      status
    });

    await product.save();

    logger.info('Product created successfully', { 
      productId: product.productId, 
      productName: product.productName 
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, totalQuantity, status } = req.body;
    
    const product = await findProductByIdOrProductId(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

 
    if (productName) product.productName = productName;
    if (totalQuantity !== undefined) product.totalQuantity = totalQuantity;
    if (status) product.status = status;

    await product.save();

    logger.info('Product updated successfully', { 
      productId: product.productId, 
      productName: product.productName 
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    logger.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { status, search, sortBy, sortOrder } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (search) filters.search = search;
    if (sortBy) filters.sortBy = sortBy;
    if (sortOrder) filters.sortOrder = sortOrder;

    const products = await Product.getProductsWithFilters(filters);

    logger.info('Products retrieved successfully', { 
      count: products.length,
      filters 
    });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    logger.error('Error retrieving products:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving products',
      error: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await findProductByIdOrProductId(id);
    
    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    logger.info('Product retrieved successfully', { 
      productId: product.productId 
    });

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    logger.error('Error retrieving product:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving product',
      error: error.message
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await findProductByIdOrProductId(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete
    product.isDeleted = true;
    await product.save();

    logger.info('Product deleted successfully', { 
      productId: product.productId 
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

const purchaseProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    const product = await findProductByIdOrProductId(id);
    
    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available for purchase'
      });
    }

    if (product.totalQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient quantity available'
      });
    }

    // Update quantity
    product.totalQuantity -= quantity;
    await product.save();

    logger.info('Product purchased successfully', { 
      productId: product.productId,
      quantity,
      remainingQuantity: product.totalQuantity
    });

    res.json({
      success: true,
      message: 'Product purchased successfully',
      data: {
        productId: product.productId,
        productName: product.productName,
        quantityPurchased: quantity,
        remainingQuantity: product.totalQuantity
      }
    });
  } catch (error) {
    logger.error('Error purchasing product:', error);
    res.status(500).json({
      success: false,
      message: 'Error purchasing product',
      error: error.message
    });
  }
};


const updateProductQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    const product = await findProductByIdOrProductId(id);
    
    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.totalQuantity = quantity;
    await product.save();

    logger.info('Product quantity updated successfully', { 
      productId: product.productId,
      newQuantity: quantity
    });

    res.json({
      success: true,
      message: 'Product quantity updated successfully',
      data: {
        productId: product.productId,
        productName: product.productName,
        totalQuantity: product.totalQuantity
      }
    });
  } catch (error) {
    logger.error('Error updating product quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product quantity',
      error: error.message
    });
  }
};


const shareProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    const product = await findProductByIdOrProductId(id);
    
    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const imagePath = product.productImage
      ? path.join(__dirname, '..', product.productImage)
      : null;
    
    const emailHtml = `
      <h2>Product Details</h2>
      <p><strong>Product Name:</strong> ${product.productName}</p>
      <p><strong>Product ID:</strong> ${product.productId}</p>
      <p><strong>Status:</strong> ${product.status}</p>
      <p><strong>Available Quantity:</strong> ${product.totalQuantity}</p>
      <p><strong>Expiry Date:</strong> ${new Date(product.expiryDate).toLocaleDateString()}</p>
      <br>
      <p>Product Image is ${imagePath ? 'attached to this email.' : 'not available.'}</p>
    `;

    const attachments = imagePath ? [
      {
        filename: `product-${product.productId}.jpg`,
        path: imagePath
      }
    ] : [];

    await sendEmail(email, `Product: ${product.productName}`, emailHtml, attachments);

    logger.info('Product shared via email successfully', { 
      productId: product.productId,
      email 
    });

    res.json({
      success: true,
      message: 'Product shared successfully via email'
    });
  } catch (error) {
    logger.error('Error sharing product:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing product',
      error: error.message
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  deleteProduct,
  purchaseProduct,
  updateProductQuantity,
  shareProduct
}; 