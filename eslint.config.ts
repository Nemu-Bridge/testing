import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "out/**",
      "lib/generated/**",
      "**/prisma/runtime/**",
      "node_modules/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  { files: ["**/*.json"], plugins: { json: json as any }, language: "json/json" },
  { files: ["**/*.jsonc"], plugins: { json: json as any }, language: "json/jsonc" },
  { files: ["**/*.json5"], plugins: { json: json as any }, language: "json/json5" },
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/commonmark",
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "prefer-const": "off",
    },
  },
]);
