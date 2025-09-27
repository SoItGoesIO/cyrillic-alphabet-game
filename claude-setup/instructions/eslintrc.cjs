/* eslint-env node */
module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
    browser: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.netlify/',
    'supabase/.temp/',
    'claude-*.tar.gz',
  ],
  rules: {
    // Keep it friendly for gradual adoption
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'prefer-const': 'warn',
    'no-var': 'error',
  },
  globals: {
    // Frontend globals
    React: 'readonly',
    ReactDOM: 'readonly',
  },
};
