import jsdoc from "eslint-plugin-jsdoc";
import eslint from '@eslint/js';
import globals from "globals";

export default [
  eslint.configs.recommended,
  {
    files: ["./src/*.js"],
    plugins: {
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
      "no-console": 1,
      "no-unused-vars": 1,
      "no-undef": 1,
      'jsdoc/require-description': 'warn'
    },
  }
];
