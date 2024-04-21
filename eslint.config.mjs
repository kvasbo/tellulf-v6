import tslint from "@typescript-eslint/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["./ts/*.ts"],
    plugins: {
      "@typescript-eslint": tslint,
      jsdoc: jsdoc,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
        ...globals.es6,
      },
    },
    rules: {
      "no-console": 0,
      "no-unused-vars": 1,
      "no-undef": 1,
    },
  },
  {
    files: ["./ts/*.js"],
    plugins: {
      jsdoc: jsdoc,
    },
    rules: {
      'jsdoc/require-description': 'warn'
    },
  },
];
