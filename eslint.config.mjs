import jsdoc from "eslint-plugin-jsdoc";
import eslint from '@eslint/js';
import globals from "globals";

export default {
  ...eslint.configs.recommended,
  files: ["./src/*.js", "./src/*.mjs"],
  plugins: {
    jsdoc,
  },
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2022,
      ...globals.es6,
      ...globals.commonjs
    },
  },
  rules: {
    "no-console": 'warn',
    "no-unused-vars": 'warn',
    "no-undef": 'warn',
    "jsdoc/require-description": 'warn',
    "semi": "warn",
  },
};
