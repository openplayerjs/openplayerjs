/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
module.exports = {
    plugins: [
        require('postcss-preset-env'),
        require('cssnano')({
            preset: 'default',
        }),
    ],
};
