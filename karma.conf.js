// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
module.exports = (config) => {
    config.set({
        basePath: './',
        browserNoActivityTimeout: 60000,
        frameworks: ['mocha', 'chai', 'karma-typescript'],
        files: [
            { pattern: 'node_modules/expect.js/index.js' },
            { pattern: 'test/player.html', type: 'dom', watched: false },
            'styles/*.css',
            'src/**/*.ts',
            'test/**/*.ts',
        ],
        preprocessors: {
            'src/**/*.ts': ['karma-typescript', 'coverage'],
            'test/**/*.ts': 'karma-typescript',
        },
        karmaTypescriptConfig: {
            bundlerOptions: {
                sourceMap: true,
                validateSyntax: false,
            },
            compilerOptions: {
                target: 'es6',
                esModuleInterop: true,
            },
            coverageOptions: {
                instrumentation: true,
                exclude: /test\/.*?\.ts$/,
                threshold: {
                    emitWarning: true,
                    global: {
                        lines: 37,
                    },
                },
            },
            reports: {
                text: '.',
                lcov: {
                    directory: 'coverage',
                    filename: 'lcov.info',
                    subdirectory: '.',
                },
            },
        },
        coverageReporter: {
            dir: 'coverage',
            subdir: '.',
        },
        reporters: ['mocha', 'karma-typescript', 'coverage'],
        port: 9876,
        crossOriginAttribute: false,
        runnerPort: 9100,
        captureTimeout: 60000,
        concurrency: Infinity,
        client: {
            mocha: {
                asyncOnly: true,
                forbidOnly: true,
                bail: true,
            },
        },
    });
};
