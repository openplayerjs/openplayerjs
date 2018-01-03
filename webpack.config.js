const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './openmedia.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'openmedia.min.js'
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {
                    failOnWarning: true,
                    failOnError: true
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['babel-preset-env']
                    }
                }
            },
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};