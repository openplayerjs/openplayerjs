module.exports = config => {
    config.set({
        basePath: '',
        browserNoActivityTimeout: 20000,
        frameworks: ['mocha', 'chai'],
        files: [
            './dist/om_player.*',
            './test/*.js',
        ],
        customContextFile: 'test/context.html',
        // reporters: ['mocha', 'coverage'],
        reporters: ['mocha'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['Firefox'], // 'Chrome', 'ChromeHeadless', 'ChromeHeadlessNoSandbox'],

        // you can define custom flags
        // customLaunchers: {
        //     ChromeHeadlessNoSandbox: {
        //         base: 'ChromeHeadless',
        //         flags: ['--no-sandbox']
        //     }
        // },
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
