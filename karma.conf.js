module.exports = config => {
    config.set({
        basePath: '',
        browserNoActivityTimeout: 20000,
        frameworks: ['mocha', 'chai'],
        files: [
            './dist/openplayer.js',
            './test/*.js',
        ],
        customContextFile: 'test/context.html',
        // reporters: ['mocha', 'coverage'],
        reporters: ['mocha'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        proxies: {
            '/dist/': '/base/dist/',
            '/test/': '/base/test/',
        },
        // preprocessors: {
        //     'dist/om_player.js': 'coverage',
        // },
        autoWatch: false,
        // coverageReporter: {
        //     dir: 'coverage',
        //     reporters: [
        //         {
        //             type: 'html',
        //             subdir: 'report-html'
        //         },
        //         {
        //             type: 'lcov',
        //             subdir: 'report-lcov'
        //         }
        //     ]
        // },
        concurrency: Infinity
    });
};
