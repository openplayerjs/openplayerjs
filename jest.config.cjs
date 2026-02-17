/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/mediaMocks.ts'],
  modulePathIgnorePatterns: ['<rootDir>/src/.*/umd/'],
  moduleNameMapper: {
    '^@dailymotion\\/vmap$': '<rootDir>/__tests__/mocks/vmap.ts',
    '^@dailymotion\\/vast-client$': '<rootDir>/__tests__/mocks/vast-client.ts',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/umd/',
    '/__tests__/mocks/',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/umd/**',
    '!src/**/*.umd.*',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 67,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
