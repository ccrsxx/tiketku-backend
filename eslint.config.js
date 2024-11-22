import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    ignores: ['coverage']
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'jsx-quotes': ['error', 'prefer-single'],
      'linebreak-style': ['error', 'unix'],
      'no-undef': 'off',
      'no-console': 'warn',
      'comma-dangle': ['error', 'never'],
      'no-unused-vars': [
        'warn',
        { args: 'all', argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'no-sparse-arrays': 'off',
      'no-unused-expressions': 'error',
      'no-constant-binary-expression': 'error'
    }
  }
];
