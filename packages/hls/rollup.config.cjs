'use strict';

const { sharedPlugins, sharedPluginsMinified, treeshake, CORE_EXTERNAL, CORE_GLOBALS } = require('../../rollup.shared.cjs');

module.exports = [
  // ESM library build
  {
    input: 'src/index.ts',
    external: CORE_EXTERNAL,
    treeshake,
    plugins: sharedPlugins(),
    output: {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  },
  // UMD build (core is external, consumed via global)
  {
    input: 'src/umd.ts',
    external: CORE_EXTERNAL,
    treeshake,
    plugins: sharedPluginsMinified(),
    output: {
      file: 'dist/openplayer-hls.js',
      format: 'umd',
      name: 'OpenPlayerJSHls',
      sourcemap: true,
      inlineDynamicImports: true,
      globals: CORE_GLOBALS,
    },
  },
];
