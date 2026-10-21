import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "coverage/**",
      "node_modules/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/.expo/**",
    ],
  },
  {
    files: ["**/*.cjs"],
    languageOptions: { globals: { module: "readonly" } },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
];
