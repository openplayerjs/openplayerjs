// const webpackConfig = require('./webpack.config');

module.exports = function (config) {
    config.set({
        target: 'node',
        basePath: '',
        frameworks: ['mocha', 'chai', 'sinon'],
        files: [
            'test/index.html'
        ],
        exclude: [
        ],
        // preprocessors: {
        //     'test/**/*.js': ['webpack']
        // },
        // webpack: {
        //     node: {
        //         fs: 'empty'
        //     },
        //     module: webpackConfig.module,
        //     resolve: webpackConfig.resolve
        // },
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: true,
        concurrency: Infinity
    });
};
