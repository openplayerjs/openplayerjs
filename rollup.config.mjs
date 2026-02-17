import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const baseConfig = {
  external: [
    // keep core external so you don't bundle it twice
    '@your-scope/openplayer-core'
  ],
  plugins: [
    resolve({ browser: true, extensions: ['.ts', '.js'] }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json'
    }),
    terser()
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false
  },
};

const umdBaseOutput = {
  format: 'umd',
  sourcemap: true,
  inlineDynamicImports: true,
  globals: {
    '@your-scope/openplayer-core': 'OpenPlayer'
  }
}

export default [
  // ESM
  {
    ...baseConfig,
    input: 'src/index.ts',
    output: { file: 'dist/esm/openplayer.js', format: 'esm', sourcemap: true },
  },
  // CJS
  {
    ...baseConfig,
    input: 'src/index.ts',
    output: { file: 'dist/cjs/openplayer.cjs', format: 'cjs', sourcemap: true },
  },
  // UMD
  {
    ...baseConfig,
    input: 'src/umd/index.ts',
    output: {
      file: 'dist/openplayer.umd.js',
      format: 'umd',
      name: 'OpenPlayer',
      sourcemap: true
    },
  },
  {
    ...baseConfig,
    input: 'src/umd/hls.ts',
    output: {
      ...umdBaseOutput,
      file: 'dist/openplayer-hls.umd.js',
      name: 'OpenPlayerHlsEngine',
    },
  },
  {
    ...baseConfig,
    input: 'src/umd/ads.ts',
    output: {
      ...umdBaseOutput,
      file: 'dist/openplayer-ads.umd.js',
      name: 'OpenPlayerAdsPlugin',
    },
  }
];
