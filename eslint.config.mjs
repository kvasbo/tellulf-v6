import tslint from "@typescript-eslint/eslint-plugin";
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    plugins: {
      "@typescript-eslint": tslint
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
          ...globals.browser,
          ...globals.node,
          ...globals.es2022,
          ...globals.es6
      }
  },
    rules: {
      "no-console": 0,
      "no-unused-vars": 1,
      "no-undef": 1,
    },
  },
];
