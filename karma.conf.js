module.exports = config => {
    config.set({
        basePath: './',
        browserNoActivityTimeout: 60000,
        frameworks: ['mocha', 'chai', 'karma-typescript'],
        files: [
            {
                pattern: 'src/css/**/*.svg', watched: false, included: false, served: true
            },
            { pattern: 'node_modules/expect.js/index.js' },
            { pattern: 'test/player.html', type: 'dom', watched: false },
            'src/css/*.css',
            'src/js/**/*.ts',
            'test/**/*.ts',
        ],
        preprocessors: {
            'src/js/**/*.ts': ['karma-typescript', 'coverage'],
            'test/**/*.ts': 'karma-typescript',
        },
        karmaTypescriptConfig: {
            bundlerOptions: {
                sourceMap: true,
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
            exclude: ['node_modules'],
            reports: {
                text: '.',
                lcov: {
                    directory: 'coverage',
                    filename: 'lcov.info',
                    subdirectory: '.'
                }
            }
        },
        coverageReporter: {
            dir: 'coverage',
            subdir: '.'
        },
        reporters: ['mocha', 'karma-typescript', 'coverage'],
        port: 9876,
        runnerPort: 9100,
        captureTimeout: 60000,
        concurrency: Infinity,
        client: {
            mocha: {
                asyncOnly: true,
                forbidOnly: true,
                bail: true
            }
        },
    });
};
