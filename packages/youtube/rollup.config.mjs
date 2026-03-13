import { sharedPlugins, sharedPluginsMinified, treeshake, CORE_EXTERNAL, CORE_GLOBALS } from '../../rollup.shared.mjs';

export default [
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
      file: 'dist/openplayer-youtube.js',
      format: 'umd',
      name: 'OpenPlayerJSYouTube',
      sourcemap: true,
      inlineDynamicImports: true,
      globals: CORE_GLOBALS,
    },
  },
];
