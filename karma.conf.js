module.exports = config => {
    config.set({
        basePath: './',
        browserNoActivityTimeout: 20000,
        frameworks: ['mocha', 'chai', 'karma-typescript'],
        files: [
            { pattern: 'node_modules/expect.js/index.js' },
            'src/js/**/*.ts',
            { pattern: 'test/player.html', type: 'dom', watched: false },
            'test/**/*.ts',
        ],
        proxies: {
            'dist/': 'base/dist/'
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
        customHeaders: [
            {match: '.*', name: 'Cross-Origin-Opener-Policy', value: 'same-origin'},
            {match: '.*', name: 'Cross-Origin-Embedder-Policy', value: 'require-corp'},
        ],
        reporters: ['mocha', 'karma-typescript'],
        port: 9876,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        concurrency: Infinity,
    });
};
