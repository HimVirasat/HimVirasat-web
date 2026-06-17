import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,

  ...tseslint.configs.recommended,

  prettier,

  {
    files: ["src/**/*.ts"],

    rules: {
      // General
      "no-console": "warn",

      // TS
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/consistent-type-imports": "error",

      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/explicit-function-return-type": "off",

      "@typescript-eslint/no-inferrable-types": "off",
    },
  },
);
