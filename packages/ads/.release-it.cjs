module.exports = {
  git: {
    requireCleanWorkingDir: false,
    addFiles: ['package.json', 'CHANGELOG.md'],
    tagName: '@openplayerjs/ads@${version}',
    commitMessage: 'chore(release): @openplayerjs/ads@${version}',
  },

  github: {
    release: false,
  },

  // Disable npm's own publish; pnpm publish (below) correctly replaces
  // workspace:^ peer-dependency references with the resolved version.
  npm: {
    publish: false,
  },

  hooks: {
    // Run pnpm publish AFTER git commit+tag+push succeed so a failed push
    // never leaves the package published without a matching git tag.
    'after:git:release': 'pnpm publish --access public --no-git-checks',
  },

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
          { type: 'test',     section: 'Tests' },
          { type: 'docs',     section: 'Documentation' },
          { type: 'style',    section: 'Styles' },
          { type: 'build',    section: 'Build System' },
          { type: 'ci',       section: 'CI' },
        ],
      },
      gitRawCommitsOpts: { path: '.' },
    },
  },
};
