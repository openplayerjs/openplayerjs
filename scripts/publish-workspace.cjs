/**
 * Custom pnpm publish wrapper used by @release-it-plugins/workspaces.
 * Adds --no-git-checks so pnpm does not prompt when publishing from a
 * non-default branch (e.g. version-3.0).
 */
'use strict';

const { execSync } = require('child_process');

const path    = process.env.RELEASE_IT_WORKSPACES_PATH_TO_WORKSPACE;
const tag     = process.env.RELEASE_IT_WORKSPACES_TAG;
const isDry   = process.env.RELEASE_IT_WORKSPACES_DRY_RUN === 'true';

const args = ['pnpm', 'publish', path, '--tag', tag, '--no-git-checks'];
if (isDry) args.push('--dry-run');

execSync(args.join(' '), { stdio: 'inherit' });
