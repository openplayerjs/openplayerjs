import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const sharedPlugins = [
  resolve({ browser: true, extensions: ['.mjs', '.js', '.ts', '.json'] }),
  typescript({ tsconfig: './tsconfig.rollup.json' }),
  commonjs(),
];

const sharedPluginsMinified = [
  ...sharedPlugins,
  terser(),
];

const treeshake = {
  moduleSideEffects: false,
  propertyReadSideEffects: false,
};

function pkgBuilds(pkg, input, external = []) {
  return [
    {
      input,
      external,
      treeshake,
      plugins: sharedPlugins,
      output: {
        file: `packages/${pkg}/dist/index.js`,
        format: 'esm',
        sourcemap: true,
        inlineDynamicImports: true,
      },
    },
  ];
}

const NAME = 'OpenPlayerJS'
const CORE_EXTERNAL = ['@openplayer/core'];
const CORE_GLOBAL   = { '@openplayer/core': NAME };

export default [
  ...pkgBuilds('core', 'packages/core/src/index.ts'),
  ...pkgBuilds('ui',  'packages/ui/src/index.ts',  CORE_EXTERNAL),
  ...pkgBuilds('hls', 'packages/hls/src/index.ts', CORE_EXTERNAL),
  ...pkgBuilds('ads', 'packages/ads/src/index.ts', CORE_EXTERNAL),
  {
    input: 'packages/ui/src/umd.ts',
    treeshake,
    plugins: sharedPluginsMinified,
    output: {
      file: 'dist/openplayer.umd.js',
      format: 'umd',
      name: NAME,
      sourcemap: true
    },
  },
  {
    input: 'packages/hls/src/umd.ts',
    external: CORE_EXTERNAL,
    treeshake,
    plugins: sharedPluginsMinified,
    output: {
      file: 'dist/openplayer-hls.umd.js',
      format: 'umd',
      name: 'OpenPlayerJSHls',
      sourcemap: true,
      inlineDynamicImports: true,
      globals: CORE_GLOBAL,
    },
  },
  {
    input: 'packages/ads/src/umd.ts',
    external: CORE_EXTERNAL,
    treeshake,
    plugins: sharedPluginsMinified,
    output: {
      file: 'dist/openplayer-ads.umd.js',
      format: 'umd',
      name: 'OpenPlayerJSAds',
      sourcemap: true,
      inlineDynamicImports: true,
      globals: CORE_GLOBAL,
    },
  },
];
