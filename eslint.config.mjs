import { defineConfig, globalIgnores } from "eslint/config";
import jsdoc from "eslint-plugin-jsdoc";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/node_modules", "**/logs", "**/website", "**/jest.config.js", "**/dist"]),
  {
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylisticTypeChecked,
      tseslint.configs.strictTypeChecked,
    ],

    plugins: {
      jsdoc,
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2023,
      sourceType: "module",
      parserOptions: {
        project: ["./packages/*/tsconfig.json", "./apps/*/tsconfig.json", "./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "arrow-spacing": [
        "warn",
        {
          before: true,
          after: true,
        },
      ],
      "@typescript-eslint/array-type": [
        "error",
        {
          default: "array-simple",
        },
      ],
      "comma-dangle": ["error", "always-multiline"],
      "comma-spacing": "error",
      "comma-style": "error",
      curly: ["error", "multi-line", "consistent"],
      "dot-location": ["error", "property"],
      "handle-callback-err": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "all",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "all",
        },
      ],

      "no-unused-vars": "off",
      "no-empty-function": "off",
      "@typescript-eslint/no-empty-function": [
        "warn",
        {
          allow: ["arrowFunctions", "constructors"],
        },
      ],
      "keyword-spacing": "error",

      "max-nested-callbacks": [
        "error",
        {
          max: 4,
        },
      ],

      "max-statements-per-line": [
        "error",
        {
          max: 2,
        },
      ],

      "no-console": "off",
      "no-floating-decimal": "error",
      "no-lonely-if": "error",
      "no-multi-spaces": "error",

      "no-multiple-empty-lines": [
        "error",
        {
          max: 2,
          maxEOF: 1,
          maxBOF: 0,
        },
      ],

      "@typescript-eslint/no-shadow": [
        "error",
        {
          allow: ["err", "resolve", "reject"],
        },
      ],

      "no-trailing-spaces": ["error"],
      "no-var": "error",
      "object-curly-spacing": ["error", "always"],
      "prefer-const": "error",
      semi: ["error", "always"],
      "space-before-blocks": "error",

      "space-before-function-paren": [
        "error",
        {
          anonymous: "never",
          named: "never",
          asyncArrow: "always",
        },
      ],

      "space-in-parens": "error",
      "space-infix-ops": "error",
      "space-unary-ops": "error",
      "spaced-comment": "error",
      yoda: "error",
    },
  },
]);
