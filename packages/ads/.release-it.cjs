module.exports = {
  git: {
    requireCleanWorkingDir: false,
    addFiles: ['package.json', '../../CHANGELOG.md'],
    tagName: '@openplayerjs/ads@${version}',
    commitMessage: 'chore(release): @openplayerjs/ads@${version}',
  },

  github: {
    release: false,
  },

  npm: {
    publish: true,
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
      infile: '../../CHANGELOG.md',
      header: '# Changelog',
      gitRawCommitsOpts: { path: '.' },
    },
  },
};
