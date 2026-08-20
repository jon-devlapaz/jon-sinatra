import js from '@eslint/js';
import globals from 'globals';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs['flat/recommended'],
  {
    files: ['**/*.astro'],
    rules: {
      'astro/no-unused-css-selector': 'off',
    },
  },
  {
    // Node CLI scripts (OG poster + Lighthouse runner) and the Node configs.
    files: ['scripts/**/*.mjs', '*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    ignores: [
      'dist/**',
      '.astro/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
);
