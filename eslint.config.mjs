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
        }
      },
      rules: {
          "semi": "warn",
          "no-unused-vars": "error",
          "no-console": "warn",
          "no-undef": "error",
      }
  }
];
