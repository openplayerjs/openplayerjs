/**
 * Shared Rollup helpers used by every package's own rollup.config.mjs.
 * Import from a package with:  import { ... } from '../../rollup.shared.mjs';
 */

import resolve   from '@rollup/plugin-node-resolve';
import commonjs  from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser    from '@rollup/plugin-terser';
import { fileURLToPath } from 'node:url';

// Absolute path to the root tsconfig used for bundle compilation.
// Resolved relative to THIS file so it is correct regardless of CWD.
const rootTsconfig = fileURLToPath(new URL('tsconfig.rollup.json', import.meta.url));

export const treeshake = {
  moduleSideEffects: false,
  propertyReadSideEffects: false,
};

function plugins(minify = false) {
  const base = [
    resolve({ browser: true, extensions: ['.mjs', '.js', '.ts', '.json'] }),
    typescript({ tsconfig: rootTsconfig }),
    commonjs(),
  ];
  return minify ? [...base, terser()] : base;
}

export const sharedPlugins        = () => plugins(false);
export const sharedPluginsMinified = () => plugins(true);

/** Core externals shared by all non-core packages. */
export const CORE_EXTERNAL = ['@openplayerjs/core'];
export const CORE_GLOBALS  = { '@openplayerjs/core': 'OpenPlayerJS' };
