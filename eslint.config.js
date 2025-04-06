import { Linter } from 'eslint'; // Import ESLint Linter
import * as tsPlugin from '@typescript-eslint/eslint-plugin'; // Import TypeScript ESLint plugin
import tsParser from "@typescript-eslint/parser";

/** @type {Linter.Config[]} */
export default [
    {
        files: ['**/*.{js,ts}'], // Match JavaScript and TypeScript files
        languageOptions: {
            ecmaVersion: 2021, // Use ES2021
            sourceType: 'module', // Use ES Modules
            parser: tsParser,
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            // Add custom rules here
        },
    },
    {
        files: ['**/*.{ts,tsx}'], // Match TypeScript-specific files
        rules: {
            ...tsPlugin.configs.recommended.rules, // Extend recommended rules
            'object-curly-spacing': ['error', 'always'],
            'no-multiple-empty-lines': ["error", { max: 1, maxEOF: 1, maxBOF: 0 }],
            "semi": ["error", "always"],
            "object-curly-newline": ["error", { "multiline": true, "consistent": true }]
        },
    },
];
