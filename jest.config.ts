import type { Config } from 'jest';

export default async (): Promise<Config> => {
    return {
        preset: 'jest-puppeteer',
        globalSetup: 'jest-environment-puppeteer/setup',
        globalTeardown: 'jest-environment-puppeteer/teardown',
        testEnvironment: 'jest-environment-puppeteer',
        testTimeout: 100000,
        globals: {
            'ts-jest': {
                tsconfig: '<rootDir>/tsconfig.json',
            },
        },
    };
};
