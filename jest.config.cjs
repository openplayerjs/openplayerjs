/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/packages'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/mediaMocks.ts'],
  moduleNameMapper: {
    '^@openplayerjs/core$':  '<rootDir>/packages/core/src/index.ts',
    '^@openplayerjs/player$': '<rootDir>/packages/player/src/index.ts',
    '^@openplayerjs/hls$':   '<rootDir>/packages/hls/src/index.ts',
    '^@openplayerjs/ads$':   '<rootDir>/packages/ads/src/index.ts',
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
    '!packages/youtube/**',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
