const fs = require('node:fs');

function readIfExists(p) {
  try {
    return fs.readFileSync(p, 'utf8').trim();
  } catch {
    return '';
  }
}

module.exports = {
  git: {
    requireCleanWorkingDir: true,
    tagName: 'v${version}',
    commitMessage: 'chore(release): v${version}',
  },

  github: {
    release: true,
    // Prefer curated notes; fall back to generated notes; otherwise let release-it decide.
    releaseNotes: () => {
      const curated = readIfExists('RELEASE_NOTES.md');
      if (curated) return curated;

      const generated = readIfExists('RELEASE_NOTES.generated.md');
      if (generated) return generated;

      return undefined;
    },
  },

  // Workspace plugin publishes packages; root is not published.
  npm: false,

  plugins: {
    '@release-it/conventional-changelog': {
      preset: { name: 'angular' },
      infile: 'CHANGELOG.md',
      header: '# Changelog',
    },
    '@release-it-plugins/workspaces': true,
  },

  hooks: {
    // Create dist and validate before releasing
    'before:init': ['pnpm turbo run test', 'pnpm turbo run build'],

    // Create generated notes + per-package changelogs from the updated root changelog
    'after:changelog': [
      'node scripts/split-changelog.mjs',
      // Inject curated notes into the newest release section (optional)
      'node scripts/inject-release-notes.mjs',
    ],
  },
};