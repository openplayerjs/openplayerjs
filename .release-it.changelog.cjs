/**
 * Changelog-only release-it config.
 * Writes CHANGELOG.md and runs the after:changelog scripts,
 * but performs no git operations, no GitHub release, and no npm publish.
 *
 * Usage:
 *   pnpm run changelog            (auto-detects increment from commits)
 *   pnpm run changelog --preRelease=beta
 */
module.exports = {
  git: false,
  github: false,
  npm: false,

  plugins: {
    '@release-it/conventional-changelog': {
      preset: {
        name: 'angular',
        types: [
          { type: 'feat',     section: 'Features' },
          { type: 'fix',      section: 'Bug Fixes' },
          { type: 'perf',     section: 'Performance Improvements' },
          { type: 'revert',   section: 'Reverts' },
          { type: 'refactor', section: 'Refactoring' },
          { type: 'chore',    section: 'Chores' },
        ],
      },
      infile: 'CHANGELOG.md',
      header: '# Changelog',
      // releaseCount: 1 means only the new entry is generated and prepended.
      // Never set this to 0 — that regenerates the full history from all tags.
      releaseCount: 1,
    },
    // Workspaces plugin omitted — nothing to publish.
  },

  hooks: {
    // Skip tests/build; only run the post-changelog scripts.
    'after:changelog': [
      'node scripts/split-changelog.mjs',
      'node scripts/inject-release-notes.mjs',
    ],
  },
};
