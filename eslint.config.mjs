import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "coverage/**",
      "node_modules/**",
      "dist/**",
      "apps/webScraper-api/dist/**",
    ],
  },
  {
    files: ["**/*.cjs"],
    languageOptions: { globals: { module: "readonly" } },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
];
