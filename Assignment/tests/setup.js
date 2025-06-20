// Jest setup file
require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart_test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Global test timeout
jest.setTimeout(10000);

// Suppress console logs during tests unless there's an error
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.info = originalConsoleInfo;
  console.warn = originalConsoleWarn;
}); 