const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

const extractPlugin = new ExtractTextPlugin({
    filename: 'om_player.min.css',
    allChunks: true
});

module.exports = {
    entry: './src/js/player.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'om_player.min.js'
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
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: extractPlugin.extract({
                    use: [
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: [
                                    require('postcss-cssnext')({ browsers: ['last 3 versions'] }),
                                    require('cssnano')()
                                ]
                            }
                        }
                    ],
                })
            },
            {
                test: /\.svg$/,
                loader: 'svg-sprite-loader',
                // options: {
                //     extract: true,
                //     spriteFilename: 'sprite-[hash:6].svg'
                // }
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin(),
        extractPlugin,
        new SpriteLoaderPlugin()
    ]
};
