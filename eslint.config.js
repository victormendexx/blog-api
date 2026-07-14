const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ['dist/', 'node_modules/', 'coverage/'],
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'off',
    },
  },
  {
    // Arquivos de config na raiz (eslint.config.js, jest.config.js) são
    // CommonJS puro — precisam dos globais de Node (require/module/exports)
    // que o ESLint 9 não assume por padrão.
    files: ['*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);