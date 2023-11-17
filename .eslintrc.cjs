/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest",
    parser: "@typescript-eslint/parser",
    project: ["./tsconfig.json"],
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
  ],
  rules: {
    "prettier/prettier": "error",
    eqeqeq: ["error", "smart"],
    yoda: "error",
    "prefer-template": "error",
    "no-console": ["error", { allow: ["warn", "error"] }],
    "require-await": "error",

    // Typescript rules
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": [
      "error",
      {
        allowComparingNullableBooleansToTrue: false,
      },
    ],
    "@typescript-eslint/no-unnecessary-condition": "error",
    "@typescript-eslint/no-duplicate-enum-values": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-non-null-assertion": "off",

    // Vue rules
    "vue/multi-word-component-names": "off",
    "vue/attribute-hyphenation": ["error", "never"],
    "vue/component-definition-name-casing": "error",
    "vue/prop-name-casing": "error",
    "vue/require-prop-types": "error",
    "vue/v-bind-style": "error",
    "vue/v-on-event-hyphenation": ["error", "never"],
    "vue/v-on-style": "error",
    "vue/v-slot-style": ["error", "shorthand"],
    "vue/component-tags-order": [
      "error",
      {
        order: ["script", "template", "style"],
      },
    ],
    "vue/this-in-template": "error",
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
    "vue/custom-event-name-casing": ["error", "camelCase"],
    "vue/next-tick-style": ["error", "promise"],
    "vue/v-for-delimiter-style": ["error", "of"],
    "vue/no-unused-properties": [
      "error",
      { groups: ["props", "setup"], ignorePublicMembers: true },
    ],

    "vue/no-unsupported-features": [
      "error",
      {
        version: "^3.3.0",
      },
    ],
    "vue/no-unused-refs": "error",
    "vue/no-useless-v-bind": "error",
    "vue/padding-lines-in-component-definition": [
      "error",
      {
        betweenOptions: "always",
        withinOption: "ignore",
        groupSingleLineProperties: false,
      },
    ],
    "vue/require-explicit-emits": "error",
    "vue/block-lang": [
      "error",
      {
        script: {
          lang: "ts",
        },
      },
    ],
    "vue/no-reserved-component-names": [
      "off",
      {
        disallowVueBuiltInComponents: false,
        disallowVue3BuiltInComponents: false,
      },
    ],
  },
};
