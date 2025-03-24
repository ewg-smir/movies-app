import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import airbnb from 'eslint-config-airbnb';
import airbnbHooks from 'eslint-config-airbnb/hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import babelParser from '@babel/eslint-parser';

export default [
  
  jsxA11y.flatConfigs.recommended,
  eslintConfigPrettier,
  js.configs.recommended,

  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
        fetch: "readonly"
      },
      ecmaVersion: 2020,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
      parser: babelParser,
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...airbnb.rules,
      ...airbnbHooks.rules,
      'react/jsx-no-target-blank': 'off',
    },
  },
];