const config = {
    verbose: true,
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/interfaces.ts',
        '!<rootDir>/src/media/native.ts',
        '!<rootDir>/src/__tests__',
    ],
    coverageThreshold: {
        global: {
            lines: 70,
        },
    },
    moduleFileExtensions: ['js', 'ts', 'node'],
    modulePaths: ['<rootDir>/src'],
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/src/__tests__/**/*.ts'],
    testPathIgnorePatterns: [
        '<rootDir>/src/__tests__/helper.ts',
        '<rootDir>/src/__tests__/setupTests.js',
        '<rootDir>/src/interfaces.ts',
    ],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.js'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};

module.exports = config;
