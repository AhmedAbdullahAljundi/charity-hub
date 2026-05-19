/** @type {import('jest').Config} */
module.exports = {
  testMatch: [
    '**/src/**/__tests__/**/*.test.js',
    '**/tests/**/*.test.js',
  ],
  testPathIgnorePatterns: ['/node_modules/'],
};
