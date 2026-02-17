// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginImport from 'eslint-plugin-import';

export default defineConfig({
    ignores: ['dist/**', 'node_modules/**'],
  }, {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic],
    plugins: { prettier: pluginPrettier, import: pluginImport },
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json', './tsconfig.types.json'],
          tsconfigRootDir: import.meta.dirname,
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
      'prettier/prettier': ['error', {
          'printWidth': 120,
          'singleQuote': true,
          'arrowParens': 'always',
          'bracketSpacing': true,
          'endOfLine': 'lf',
          'jsxSingleQuote': false,
          'proseWrap': 'preserve',
          'quoteProps': 'preserve',
          'semi': true,
          'trailingComma': 'es5',
          'useTabs': false
      }],
  },
});
