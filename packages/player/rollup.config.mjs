import { sharedPlugins, sharedPluginsMinified, treeshake, CORE_EXTERNAL } from '../../rollup.shared.mjs';

export default [
  // ESM library build (peer-depends on @openplayerjs/core)
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
      file: 'dist/openplayer.js',
      format: 'umd',
      name: 'OpenPlayerJS',
      sourcemap: true,
    },
  },
];
