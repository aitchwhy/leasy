import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/*.tsbuildinfo",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/.vscode/**",
      "**/.idea/**",
      "**/*.min.js",
      "**/*.min.css",
      "bun.lock",
      "**/*.json",
      "**/*.yml",
      "**/*.yaml",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,mts,cts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  },
  {
    files: ["**/*.config.ts", "**/*.config.js"],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "**/*.e2e.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
