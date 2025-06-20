const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');
const { generateToken } = require('../middlewares/auth');

describe('Product API Tests', () => {
  let authToken;
  let testProductId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart_test');
    
    // Generate test token
    authToken = generateToken('testuser');
  });

  afterAll(async () => {
    // Clean up test database
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear products before each test
    await Product.deleteMany({});
  });

  describe('POST /api/products', () => {
    it('should create a new product successfully', async () => {
      const productData = {
        productName: 'Test Product',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        totalQuantity: 100,
        status: 'Active'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .field('productName', productData.productName)
        .field('expiryDate', productData.expiryDate)
        .field('totalQuantity', productData.totalQuantity)
        .field('status', productData.status)
        .attach('productImage', Buffer.from('fake image data'), 'test.jpg');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.productName).toBe(productData.productName);
      expect(response.body.data.productId).toBeDefined();
      testProductId = response.body.data._id;
    });

    it('should fail to create product without authentication', async () => {
      const response = await request(app)
        .post('/api/products')
        .field('productName', 'Test Product')
        .field('expiryDate', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
        .field('totalQuantity', 100);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail to create product without required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .field('productName', 'Test Product');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products/:id', () => {
    beforeEach(async () => {
      // Create a test product
      const product = new Product({
        productName: 'Test Product for Get',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        productImage: '/images/products/test.jpg',
        totalQuantity: 50,
        status: 'Active'
      });
      const savedProduct = await product.save();
      testProductId = savedProduct._id;
    });

    it('should get product by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testProductId.toString());
      expect(response.body.data.productName).toBe('Test Product for Get');
    });

    it('should fail to get product without authentication', async () => {
      const response = await request(app)
        .get(`/api/products/${testProductId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/products/:id/purchase', () => {
    beforeEach(async () => {
      // Create a test product
      const product = new Product({
        productName: 'Test Product for Purchase',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        productImage: '/images/products/test.jpg',
        totalQuantity: 100,
        status: 'Active'
      });
      const savedProduct = await product.save();
      testProductId = savedProduct._id;
    });

    it('should purchase product successfully', async () => {
      const purchaseData = {
        quantity: 10
      };

      const response = await request(app)
        .post(`/api/products/${testProductId}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(purchaseData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.quantityPurchased).toBe(10);
      expect(response.body.data.remainingQuantity).toBe(90);

      // Verify quantity was updated in database
      const updatedProduct = await Product.findById(testProductId);
      expect(updatedProduct.totalQuantity).toBe(90);
    });

    it('should fail to purchase more than available quantity', async () => {
      const purchaseData = {
        quantity: 150
      };

      const response = await request(app)
        .post(`/api/products/${testProductId}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(purchaseData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient quantity');
    });

    it('should fail to purchase inactive product', async () => {
      // Make product inactive
      await Product.findByIdAndUpdate(testProductId, { status: 'Inactive' });

      const purchaseData = {
        quantity: 10
      };

      const response = await request(app)
        .post(`/api/products/${testProductId}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(purchaseData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not available for purchase');
    });

    it('should fail to purchase without authentication', async () => {
      const purchaseData = {
        quantity: 10
      };

      const response = await request(app)
        .post(`/api/products/${testProductId}/purchase`)
        .send(purchaseData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
}); 