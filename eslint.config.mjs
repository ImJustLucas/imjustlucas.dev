import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import testingLibrary from "eslint-plugin-testing-library";

import js from "@eslint/js";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".claude/**",
  ]),
  js.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierRecommended,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^.+\\.?(css)$"],
            ["^react", "^@react", "^next"],
            ["^[a-z]"],
            ["^@/"],
            [
              "^\\.\\.(?!/?$)",
              "^\\.\\./?$",
              "^\\./(?=.*/)(?!/?$)",
              "^\\.(?!/?$)",
              "^\\./?$",
            ],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "react/jsx-filename-extension": [1, { extensions: [".tsx", ".ts"] }],
      "react/jsx-props-no-spreading": 0,
      "react/no-unknown-property": ["error", { ignore: ["jsx"] }],
      "react/react-in-jsx-scope": "off",
      "react/jsx-indent-props": ["error", 2],
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "no-console": 0,
      "no-control-regex": 0,
      "react/prop-types": "off",
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
  {
    // ADR-0002: Effect runs on the server only; pages and components get
    // plain data from `lib/content/server.ts` or `lib/admin/server.ts`.
    files: ["app/**", "components/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["effect", "effect/*", "@effect/*"],
              message:
                "React code never imports Effect (ADR-0002): call lib/content/server.ts or lib/admin/server.ts instead.",
            },
          ],
        },
      ],
    },
  },
  {
    // Text goes through the typography primitives, which accept a className.
    files: ["app/**/*.tsx", "components/**/*.tsx"],
    ignores: ["components/typography/**", "components/ui/**"],
    rules: {
      "react/forbid-elements": [
        "error",
        {
          forbid: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "strong"].map(
            (element) => ({
              element,
              message: "use a primitive from @/components/typography",
            }),
          ),
        },
      ],
    },
  },
  {
    files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    plugins: {
      "testing-library": testingLibrary,
    },
    rules: testingLibrary.configs.react.rules,
  },
]);
