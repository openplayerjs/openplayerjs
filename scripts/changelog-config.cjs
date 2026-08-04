'use strict';
/**
 * scripts/changelog-config.cjs
 *
 * Single source of truth for the conventional-commit type → changelog section
 * mapping and scope → package mapping used by both orchestrate-release.cjs and
 * split-changelog.cjs.
 */

/** Maps conventional-commit types to human-readable section headers. */
const TYPE_SECTIONS = {
  feat:     'Features',
  fix:      'Bug Fixes',
  perf:     'Performance Improvements',
  revert:   'Reverts',
  refactor: 'Refactoring',
  docs:     'Documentation',
  build:    'Build System',
  chore:    'Chores',
  test:     'Tests',
  style:    'Styles',
  ci:       'CI',
};

/** Display order for sections in the generated CHANGELOG (most visible first). */
const SECTION_ORDER = [
  'Breaking Changes',
  'Features',
  'Bug Fixes',
  'Performance Improvements',
  'Refactoring',
  'Documentation',
  'Build System',
  'Chores',
  'Tests',
  'Styles',
  'CI',
  'Reverts',
];

/**
 * All known package names in release-dependency order.
 * Core must always appear first so dependents can reference its version.
 */
const PACKAGES = ['core', 'player', 'hls', 'ads', 'youtube'];

/**
 * Maps conventional-commit scopes to their corresponding package folder and
 * display name for CHANGELOG section headings.
 *
 * Cross-cutting scopes ('deps', 'ci', 'release', 'docs', 'repo') are intentionally
 * absent — those commits surface in the root CHANGELOG only, not per-package files.
 */
const SCOPE_TO_PACKAGE = {
  core:    { dir: 'packages/core',    name: '@openplayerjs/core' },
  player:  { dir: 'packages/player',  name: '@openplayerjs/player' },
  hls:     { dir: 'packages/hls',     name: '@openplayerjs/hls' },
  ads:     { dir: 'packages/ads',     name: '@openplayerjs/ads' },
  youtube: { dir: 'packages/youtube', name: '@openplayerjs/youtube' },
};

/**
 * Maps a git author name (`%an`) to a GitHub login, so changelog credits render
 * as real @mentions. Keyed on the name rather than the email because the same
 * contributor commits under several addresses over the years.
 *
 * Bot authors ('renovate[bot]', 'dependabot[bot]') already commit under their
 * exact GitHub login and need no entry here.
 */
const AUTHOR_ALIASES = {
  'Rafael Miranda': 'rafa8626',
  'Snyk bot': 'snyk-bot',
};

/**
 * Render a git author name as a changelog credit.
 *
 * A GitHub login never contains whitespace, so an unmapped multi-word name
 * cannot be mentioned safely — `@Nejc Sever` would either dangle or, worse,
 * notify whoever happens to own `@Nejc`. Those fall back to the plain name with
 * no `@`; add an AUTHOR_ALIASES entry to turn one into a real mention.
 */
function authorCredit(author) {
  const name = String(author ?? '').trim();
  if (!name) return '';
  const alias = AUTHOR_ALIASES[name];
  if (alias) return `@${alias}`;
  return /\s/.test(name) ? name : `@${name}`;
}

module.exports = { TYPE_SECTIONS, SECTION_ORDER, PACKAGES, SCOPE_TO_PACKAGE, AUTHOR_ALIASES, authorCredit };
