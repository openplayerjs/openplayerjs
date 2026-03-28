'use strict';

const { sharedPlugins, treeshake } = require('../../rollup.shared.cjs');

module.exports = {
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
