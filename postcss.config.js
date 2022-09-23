module.exports = {
    plugins: [
        require('postcss-preset-env'),
        require('cssnano')({
            preset: 'default',
        }),
    ],
};
