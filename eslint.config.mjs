// Import globals from the ESM module
import globals from "globals";

export default [
  {
      files: ["src/*.js", "src/*.mjs"],
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
          ...globals.jquery,
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
