/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/index.js', '!src/scripts/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  clearMocks: true,
  resetMocks: true,
};
