const path = require('path');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    target: 'node',
    stats: {
        children: true,
    },
    context: __dirname,
    entry: {
        openplayer: ['./src/player.ts', './styles/player.css'],
    },
    performance: {
        hints: 'error',
        maxAssetSize: 500000,
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].min.js',
        publicPath: '/dist/',
        library: 'OpenPlayer',
        libraryTarget: 'umd',
        libraryExport: 'default',
        globalObject: 'this',
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /src\/*\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'eslint-loader',

                        options: {
                            failOnWarning: true,
                            failOnError: true,
                        },
                    },
                ],
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                        },
                    },
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
            {
                test: /src\/*\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.svg$/,
                exclude: /node_modules/,
                type: 'asset/inline',
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: false,
                            sourceMap: true,
                        },
                    },

                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [require('stylelint'), require('postcss-preset-env'), require('autoprefixer')],
                                minimize: false,
                            },
                            sourceMap: true,
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            fs: false,
        },
    },
    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin({
                minimizerOptions: {
                    preset: [
                        'default',
                        {
                            discardComments: { removeAll: true },
                        },
                    ],
                },
            }),
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    mangle: true,
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].min.css',
        }),
        new UnminifiedWebpackPlugin({
            postfix: 'nomin',
        }),
    ],
};
