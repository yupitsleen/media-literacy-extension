const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        chrome: "readonly",
        browser: "readonly",
        console: "readonly",
        document: "readonly",
        window: "readonly"
      },
      ecmaVersion: 2022,
      sourceType: "script"
    },
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error"
    },
    ignores: [
      "node_modules/**",
      "build/**",
      "coverage/**",
      "*.config.js"
    ]
  }
];