// @ts-check

import eslintJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from "eslint-config-prettier";
import reactPlugin from "eslint-plugin-react";

export default tseslint.config(
    eslintJs.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        plugins: {
            react: reactPlugin
        },
        rules: {
            '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-duplicate-enum-values': 'off',
            "@typescript-eslint/no-non-null-assertion": "off",
        }
    }
  );
