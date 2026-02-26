/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/packages'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/mediaMocks.ts'],
  moduleNameMapper: {
    '^@openplayer/core$':  '<rootDir>/packages/core/src/index.ts',
    '^@openplayer/ui$':    '<rootDir>/packages/ui/src/index.ts',
    '^@openplayer/hls$':   '<rootDir>/packages/hls/src/index.ts',
    '^@openplayer/ads$':   '<rootDir>/packages/ads/src/index.ts',
    '^@dailymotion\\/vmap$': '<rootDir>/packages/ads/__tests__/mocks/vmap.ts',
    '^@dailymotion\\/vast-client$': '<rootDir>/packages/ads/__tests__/mocks/vast-client.ts',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/umd/',
    '/__tests__/mocks/',
    '/packages/[^/]+/__tests__/mocks/',
    '/packages/[^/]+/src/types/',
    '/packages/[^/]+/types/',
  ],
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/**/umd.ts',
    '!packages/*/src/index.ts',
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
