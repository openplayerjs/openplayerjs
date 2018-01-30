const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractPlugin = new ExtractTextPlugin({
    filename: 'om_player.min.css',
    allChunks: false
});

const babelLoader = {
    loader: 'babel-loader',
    options: {
        presets: ['babel-preset-env']
    }
};

module.exports = {
    entry: './src/js/player.ts',
    output: {
        path: path.resolve(__dirname, './dist'),
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
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    babelLoader,
                    {
                        loader: 'ts-loader'
                    }
                ]
            },
            {
                test: /src\/*\.js$/,
                exclude: /node_modules/,
                use: babelLoader
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
                                    require('stylelint')(),
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
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin(),
        extractPlugin,
    ]
};
