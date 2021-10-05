module.exports = {
    plugins: [
        require('autoprefixer'),
        require('postcss-preset-env')({
            browsers: '> 0.25%',
        }),
    ],
};
