import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",

    "next-env.d.ts",

    // Generated code
    "src/generated/**",
    "**/generated/**",

    // Prisma generated client
    "prisma/generated/**",

    // Build artifacts
    "dist/**",
  ]),
]);
