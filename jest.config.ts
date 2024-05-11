import type { Config } from 'jest';

export default async (): Promise<Config> => {
  return {
    preset: 'jest-puppeteer',
    testTimeout: 100000,
    globals: {
      'ts-jest': {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    },
  };
};