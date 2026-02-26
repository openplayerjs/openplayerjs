import { fileURLToPath } from 'node:url';
import path from 'node:path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function workspaceAlias() {
  const map = {
    '@openplayer/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
    '@openplayer/ui':   path.resolve(__dirname, 'packages/ui/src/index.ts'),
    '@openplayer/hls':  path.resolve(__dirname, 'packages/hls/src/index.ts'),
    '@openplayer/ads':  path.resolve(__dirname, 'packages/ads/src/index.ts'),
  };
  return {
    name: 'workspace-alias',
    resolveId(id) { return map[id] ?? null; },
  };
}

const sharedPlugins = [
  workspaceAlias(),
  resolve({ browser: true, extensions: ['.ts', '.js'] }),
  commonjs(),
  typescript({ tsconfig: './tsconfig.json' }),
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
    plugins: sharedPlugins,
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
    plugins: sharedPlugins,
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
    plugins: sharedPlugins,
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
