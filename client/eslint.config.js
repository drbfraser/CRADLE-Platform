import js from '@eslint/js';
import ts from 'typescript-eslint';
import pluginTanstackQuery from '@tanstack/eslint-plugin-query';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import typescriptParser from '@typescript-eslint/parser';
import globals from 'globals';

// https://github.com/sindresorhus/globals/issues/239
// Workaround for bug related to old version of the "globals" package.
// Without this, the following error is thrown:
//    TypeError: Key "languageOptions": Key "globals": Global "AudioWorkletGlobalScope " has leading or trailing whitespace.
// Eslint has globals v14 as a peer dependency and the issue is fixed there;
// However, our babel installation uses globals v11. When we import globals here, it is
// the older version and does not work with eslint as intended.
const GLOBALS_BROWSER_FIX = Object.assign({}, globals.browser, {
  AudioWorkletGlobalScope: globals.browser['AudioWorkletGlobalScope '],
});
delete GLOBALS_BROWSER_FIX['AudioWorkletGlobalScope '];

export default [
  {
    ignores: ['playwright-report/**/*', 'test-results/**/*', 'coverage/**/*'],
  },
  ...pluginTanstackQuery.configs['flat/recommended'],
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'warn',
      'react/display-name': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parser: typescriptParser,
      globals: {
        ...GLOBALS_BROWSER_FIX,
        ...globals.jest,
      },
    },
  },
  // Relaxed rules for test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/testing/**/*.ts', '**/testing/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
