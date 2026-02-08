// Jest setup file
// Runs before each test suite

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1d';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Global test helpers
global.testHelpers = {
  // Add any global test helpers here
  generateTestToken: (payload) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  }
};

// Mock console methods to reduce noise in tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Cleanup after all tests
afterAll(async () => {
  // Close database connections, etc.
  // This will be implemented when we add database models
});
