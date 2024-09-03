// Import globals from the ESM module
import globals from "globals";
import jsdoc from "eslint-plugin-jsdoc";
import eslint from '@eslint/js';

export default [
  jsdoc.configs['flat/recommended'],
  eslint.configs.recommended,
  {
      files: ["src/*.js", "src/*.mjs"],
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
          hourlyWeatherTemplate: "readonly",
          calendarDay: "readonly",
          Twig: "readonly",
        }
      },
      rules: {
          "semi": "error",
          "no-unused-vars": "error",
          "no-undef": "error",
          // JSDoc rules
          // TODO: Enable these rules
          "jsdoc/require-description": 'off',
          "jsdoc/require-param-description": 'off',
          "jsdoc/require-returns-description": 'off',
          "jsdoc/require-param-type": 'off',
          "jsdoc/require-returns": 'off',
          "jsdoc/require-returns-type": 'off',
          "jsdoc/require-param": 'off',
          "jsdoc/check-param-names": 'off',
          "jsdoc/require-property-description": 'off',
      }
  },
  {
      files: ["src/Server.mjs"],
      rules: {
          "jsdoc/require-description": 'error',
      }
  }
];
