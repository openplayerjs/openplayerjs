// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default defineConfig({
  ignores: ['dist/**', 'node_modules/**'],
  extends: [eslint.configs.recommended, tseslint.configs.recommended,tseslint.configs.stylistic],
  plugins: { prettier },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
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
