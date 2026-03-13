module.exports = {
  git: {
    requireCleanWorkingDir: false,
    addFiles: ['package.json'],
    tagName: '@openplayerjs/youtube@${version}',
    commitMessage: 'chore(release): @openplayerjs/youtube@${version}',
  },

  github: {
    release: false,
  },

  npm: {
    publish: true,
    // Allow first publish at the version already in package.json (no prior npm release).
    versionArgs: ['--allow-same-version'],
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
