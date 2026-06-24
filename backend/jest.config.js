/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  clearMocks: true,
  // Pin to the venue's local timezone so time assertions are CI-independent.
  testEnvironmentOptions: { timezone: 'Australia/Brisbane' },
}
