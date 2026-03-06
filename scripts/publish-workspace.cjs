/**
 * Custom pnpm publish wrapper used by @release-it-plugins/workspaces.
 * Adds --no-git-checks so pnpm does not prompt when publishing from a
 * non-default branch (e.g. version-3.0).
 */
'use strict';

const { spawnSync } = require('child_process');

const path  = process.env.RELEASE_IT_WORKSPACES_PATH_TO_WORKSPACE;
const tag   = process.env.RELEASE_IT_WORKSPACES_TAG;
const isDry = process.env.RELEASE_IT_WORKSPACES_DRY_RUN === 'true';

const args = ['publish', path, '--tag', tag, '--no-git-checks'];
if (isDry) args.push('--dry-run');

// pnpm v10 re-injects its own config keys as npm_config_* vars into every npm
// API call it makes internally, regardless of the inherited environment.
// npm v11+ warns about any it doesn't recognise. Capture stderr and filter
// those lines so they never reach the terminal.
const SUPPRESS = /^npm warn Unknown env config/;

const result = spawnSync('pnpm', args, {
  stdio: ['inherit', 'inherit', 'pipe'],
  encoding: 'utf8',
  // Force ANSI colour codes even though stderr is piped (not a TTY).
  env: { ...process.env, FORCE_COLOR: '1' },
});

if (result.stderr) {
  const filtered = result.stderr
    .split('\n')
    .filter(line => !SUPPRESS.test(line))
    .join('\n');
  if (filtered.trim()) process.stderr.write(filtered);
}

process.exit(result.status ?? 1);
