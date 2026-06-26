/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    '../.eslintrc.json',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:storybook/recommended',
  ],
  env: {
    browser: true,
    es2020: true,
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react-refresh'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    'storybook/no-renderer-packages': 'off',
  },
};
