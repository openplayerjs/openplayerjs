import { sharedPlugins, treeshake } from '../../rollup.shared.mjs';

export default {
  input: 'src/index.ts',
  treeshake,
  plugins: sharedPlugins(),
  output: {
    file: 'dist/index.js',
    format: 'esm',
    sourcemap: true,
    inlineDynamicImports: true,
  },
};
