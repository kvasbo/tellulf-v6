// Import globals from the ESM module
import globals from "globals";
import eslint from '@eslint/js';

export default [
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
      }
  }
];
