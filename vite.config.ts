/* eslint-disable import/no-extraneous-dependencies */
import { resolve } from 'path';
import { minify } from 'rollup-plugin-esbuild-minify';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: './dist',
        lib: {
            entry: resolve(__dirname, 'src/player.ts'),
        },
        minify: false,
        sourcemap: true,
        rollupOptions: {
            output: [
                {
                    entryFileNames: 'openplayer.js',
                    name: 'openplayerjs',
                    format: 'umd',
                },
                {
                    entryFileNames: 'openplayer.min.js',
                    name: 'openplayerjs',
                    format: 'umd',
                    plugins: [minify()],
                },
                {
                    entryFileNames: 'openplayer.es.js',
                    esModule: true,
                    plugins: [minify()],
                },
            ],
        },
    },
});
