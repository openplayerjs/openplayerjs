module.exports = config => {
    config.set({
        basePath: './',
        browserNoActivityTimeout: 200000,
        frameworks: ['mocha', 'chai', 'karma-typescript'],
        files: [
            {
                pattern: 'src/css/**/*.svg', watched: false, included: false, served: true
            },
            'src/css/*.css',
            { pattern: 'node_modules/expect.js/index.js' },
            { pattern: 'test/player.html', type: 'dom', watched: false },
            'src/js/**/*.ts',
            'test/utils/*.ts',
            'test/controls/*.ts',
            'test/player.ts',
        ],
        proxies: {
            '/src/': '/base/src/',
            '/test/': '/base/test/',
        },
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
