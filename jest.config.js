const config = {
    verbose: true,
    collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/interfaces.ts', '!<rootDir>/src/media/native.ts'],
    coveragePathIgnorePatterns: ['/node_modules/', 'package.json', 'package-lock.json'],
    coverageReporters: ['lcov', 'html'],
    coverageThreshold: {
        global: {
            lines: 70,
        },
    },
    moduleFileExtensions: ['js', 'ts', 'node'],
    modulePaths: ['<rootDir>/src'],
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/test/**/*.ts'],
    testPathIgnorePatterns: ['<rootDir>/test/helper.ts', '<rootDir>/test/setupTests.js', '<rootDir>/src/interfaces.ts'],
    setupFilesAfterEnv: ['<rootDir>/test/setupTests.js'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};

module.exports = config;
