module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Coverage directory
  coverageDirectory: 'coverage',

  // Coverage thresholds (20% minimum)
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20
    }
  },

  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/database/migrations/**',
    '!src/database/seeders/**',
    '!src/config/**'
  ],

  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,

  // Test timeout (10 seconds)
  testTimeout: 10000,

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html'
  ]
};
