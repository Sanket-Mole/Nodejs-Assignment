module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: false,
  // coverageDirectory: 'coverage',
  // coverageReporters: ['text', 'lcov', 'html'],
  // coveragePathIgnorePatterns: [
  //   '/node_modules/',
  //   '/tests/',
  //   '/logs/',
  //   '/images/'
  // ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  verbose: false
}; 