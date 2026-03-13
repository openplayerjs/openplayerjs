import { sharedPlugins, treeshake, CORE_EXTERNAL, sharedPluginsMinified } from '../../rollup.shared.mjs';

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
  // UMD standalone bundle (bundles core + player together, no externals)
  {
    input: 'src/umd.ts',
    treeshake: false,
    plugins: sharedPluginsMinified(),
    output: {
      file: 'dist/openplayer-youtube.js',
      format: 'umd',
      name: 'OpenPlayerJSYouTube',
      sourcemap: true,
    },
  },
];
