// @ts-check
'use strict';

const eslint        = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint      = require('typescript-eslint');
const pluginPrettier = require('eslint-plugin-prettier');
const pluginImport  = require('eslint-plugin-import');

module.exports = defineConfig({
    ignores: ['dist/**', 'node_modules/**', 'packages/**/dist/**', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'],
  }, {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic],
    plugins: { prettier: pluginPrettier, import: pluginImport },
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: __dirname
      }
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
          tsconfigRootDir: __dirname,
          alwaysTryTypes: true,
          noWarnOnMultipleProjects: true,
        }
      },
      'import/extensions': ['.ts'],
      'import/parsers': { '@typescript-eslint/parser': ['.ts']},
    },
    rules: {
      '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions']}],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-unused-private-class-members': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^(err|_)',
        ignoreRestSiblings: true,
        args: 'after-used',
      }],
      'no-console': 'warn',
      'no-empty': 'off',
      'import/no-cycle': ['error', { maxDepth: 10 }],
      'import/no-extraneous-dependencies': ['error', { devDependencies: false, peerDependencies: true }],
  },
});
