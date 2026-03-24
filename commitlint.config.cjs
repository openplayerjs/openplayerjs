/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'perf', 'refactor', 'chore', 'docs', 'test', 'build', 'ci', 'revert'],
    ],
    
    'scope-empty': [2, 'never'],
    'scope-enum': [
      2,
      'always',
      ['core', 'player', 'hls', 'ads', 'youtube', 'deps', 'ci', 'release', 'docs', 'repo', 'changelog'],
    ],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'header-max-length': [2, 'always', 150],
    // Bodies often contain URLs, code snippets, or stack traces that exceed 100 chars.
    // Only the header length is enforced.
    'body-max-line-length': [0],
  },
};
