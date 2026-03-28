'use strict';
/**
 * Shared Rollup helpers used by every package's own rollup.config.cjs.
 * Require from a package with:  const { ... } = require('../../rollup.shared.cjs');
 */

const resolve    = require('@rollup/plugin-node-resolve');
const commonjs   = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const terser     = require('@rollup/plugin-terser');
const path       = require('node:path');

// Absolute path to the root tsconfig used for bundle compilation.
// Resolved relative to THIS file so it is correct regardless of CWD.
const rootTsconfig = path.join(__dirname, 'tsconfig.rollup.json');

const treeshake = {
  moduleSideEffects: false,
  propertyReadSideEffects: false,
};

function plugins(minify = false) {
  const base = [
    resolve({ browser: true, extensions: ['.cjs', '.mjs', '.js', '.ts', '.json'] }),
    typescript({ tsconfig: rootTsconfig }),
    commonjs(),
  ];
  return minify ? [...base, terser()] : base;
}

const sharedPlugins         = () => plugins(false);
const sharedPluginsMinified = () => plugins(true);

/** Core externals shared by all non-core packages. */
const CORE_EXTERNAL = ['@openplayerjs/core'];
const CORE_GLOBALS  = { '@openplayerjs/core': 'OpenPlayerJS' };

module.exports = { treeshake, sharedPlugins, sharedPluginsMinified, CORE_EXTERNAL, CORE_GLOBALS };
