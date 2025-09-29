import js from '@eslint/js';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    // Ignore junk and generated paths
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'supabase/.temp/**', 'claude-setup/**'],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // Project rules
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        // Browser globals
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Audio: 'readonly',
        navigator: 'readonly',
        indexedDB: 'readonly',
        crypto: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        // React globals (for react scripts)
        React: 'readonly',
        ReactDOM: 'readonly',
        // Node.js globals (for config files)
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      // keep friendly; tighten later if we want
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
    },
  },
];
