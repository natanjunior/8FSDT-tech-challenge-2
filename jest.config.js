const baseConfig = {
  testEnvironment: 'node',
  clearMocks: true,
  verbose: true,
  testTimeout: 10000,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20
    }
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/models/index.js',
    '!src/database/migrations/**',
    '!src/database/seeders/**',
    '!src/config/**',
    '!**/node_modules/**'
  ],
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html'
  ]
};

module.exports = {
  ...baseConfig,
  projects: [
    {
      ...baseConfig,
      displayName: 'unit',
      testMatch: ['**/tests/unit/**/*.test.js', '**/tests/unit/**/*.spec.js'],
      // Unit tests: NO database setup (use mocks)
    },
    {
      ...baseConfig,
      displayName: 'integration',
      testMatch: ['**/tests/integration/**/*.test.js', '**/tests/integration/**/*.spec.js'],
      // Integration tests: WITH database setup
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    }
  ]
};
