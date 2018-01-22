const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');


const extractPlugin = new ExtractTextPlugin({
    filename: 'om_player.min.css',
    allChunks: false
});

module.exports = {
    entry: './ts-dist/player.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'om_player.js'
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /src\/*\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {
                    failOnWarning: true,
                    failOnError: true
                }
            },
            {
                enforce: 'pre',
                test: /\.css$/,
                exclude: /node_modules/,
                loader: 'stylelint-loader'
            },
            {
                test: /src\/*\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['babel-preset-env']
                    }
                }
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: extractPlugin.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            options: { importLoaders: 1 },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: [
                                    require('postcss-cssnext')({
                                        browsers: ['last 3 versions'],
                                        warnForDuplicates: false
                                    }),
                                    require('cssnano')()
                                ]
                            }
                        }
                    ],
                })
            }
        ]
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin(),
        new StyleLintPlugin(),
        extractPlugin,
    ]
};
