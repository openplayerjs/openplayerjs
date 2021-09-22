module.exports = config => {
    config.set({
        basePath: './',
        browserNoActivityTimeout: 20000,
        frameworks: ['mocha', 'chai', 'karma-typescript'],
        files: [
            'src/css/*',
            { pattern: 'node_modules/expect.js/index.js' },
            'src/js/**/*.ts',
            { pattern: 'test/player.html', type: 'dom', watched: false },
            'test/utils/*.ts',
            'test/controls/*.ts',
            'test/player.ts',
        ],
        preprocessors: {
            'src/js/**/*.ts': 'karma-typescript',
            'test/**/*.ts': 'karma-typescript',
        },
        karmaTypescriptConfig: {
            compilerOptions: {
                target: 'es6',
                types: ['node', 'mocha', 'chai', 'expect.js'],
                esModuleInterop: true,
                noResolve: false
            },
            exclude: ['node_modules']
        },
        reporters: ['mocha', 'karma-typescript'],
        port: 9876,
        runnerPort: 9100,
        captureTimeout: 60000,
        concurrency: Infinity,
        client: {
            mocha: {
                asyncOnly: true,
            }
        }
    });
};
