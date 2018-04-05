const webpackConfig = require('./webpack.config');

webpackConfig.module.rules = [
    {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'awesome-typescript-loader',
        query: {
            compilerOptions: {
                inlineSourceMap: true,
                sourceMap: false
            }
        }
    },
    {
        test: /\.ts$/,
        enforce: 'post',
        query: {
            esModules: true
        },
        loader: 'istanbul-instrumenter-loader',
        exclude: [
            'node_modules',
            /\.spec\.ts$/
        ]
    }
];

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'chai', 'sinon'],
        files: [
            'test/**/*.ts'
        ],
        exclude: [],
        preprocessors: {
            'test/**/*.ts': ['webpack']
        },
        webpack: {
            node: {
                fs: 'empty'
            },
            devtool: 'inline-source-map',
            module: webpackConfig.module,
            resolve: webpackConfig.resolve
        },
        webpackServer: {
            noInfo: true
        },
        coverageReporter: {
            dir: 'coverage',
            reporters: [
                {
                    type: 'html',
                    subdir: 'report-html'
                },
                {
                    type: 'lcov',
                    subdir: 'report-lcov'
                }
            ]
        },
        reporters: ['progress', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: true,
        concurrency: Infinity
    });
};
