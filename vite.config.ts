/* eslint-disable import/no-extraneous-dependencies */
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/js/player.ts'),
            name: 'openplayer',
            fileName: (format) =>
                ({
                    es: 'esm/player.js',
                    umd: 'openplayer.js',
                }[format]),
        },
        target: 'esnext',
        minify: true,
        sourcemap: true,
    },
    plugins: [
        dts({
            outDir: './types',
        }),
    ],
    resolve: { alias: { src: resolve('src/') } },
});
