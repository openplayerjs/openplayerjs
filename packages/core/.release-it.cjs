module.exports = {
  git: {
    requireCleanWorkingDir: false,
    addFiles: ['package.json', '../../CHANGELOG.md'],
    tagName: '@openplayerjs/core@${version}',
    commitMessage: 'chore(release): @openplayerjs/core@${version}',
  },

  github: {
    release: false,
  },

  // Publishing is handled by .github/workflows/publish.yml via OIDC Trusted
  // Publishers.  Disabling here prevents release-it from attempting to publish
  // with a local NPM_TOKEN (which no longer needs to exist).
  npm: {
    publish: false,
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
