const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const BabiliPlugin = require('babili-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: {
        'om_player.js': './src/js/player.ts',
        'om_player.min.js': './src/js/player.ts',
        'om_player.css': './src/css/player.css',
        'om_player.min.css': './src/css/player.css',
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name]'
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /src\/*\.js$/,
                exclude: /node_modules/,

                use: [{
                    loader: 'eslint-loader',

                    options: {
                        failOnWarning: true,
                        failOnError: true
                    }
                }]
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['babel-preset-env']
                        }
                    },
                    {
                        loader: 'ts-loader'
                    }
                ]
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
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use: [{
                    loader: 'url-loader',

                    options: {
                        limit: 100000
                    }
                }]
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
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
                                    require('autoprefixer')(),
                                    require('postcss-cssnext')({
                                        browsers: ['last 5 versions', 'ie >= 11'],
                                        warnForDuplicates: false
                                    }),
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
        new ExtractTextPlugin('[name]'),
        new BabiliPlugin({}, {
            test: /\.min\.js$/,
        }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.min\.css$/,
            cssProcessorOptions: {
                discardComments: {
                    removeAll: true
                }
            },
            cssProcessor: require('cssnano')({
                zindex: false
            }),
        }),
    ]
};
