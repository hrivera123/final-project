import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.browser,
        bootstrap: "readonly", // Bootstrap is loaded via CDN
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "no-empty": "warn", // Changed from error to warning
    },
  },
  {
    ignores: ["node_modules/**", "dist/**", "build/**"],
  },
];
