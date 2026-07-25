import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    // Next.js default ignores
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Dependencies
    "node_modules/**",

    // Coverage reports
    "coverage/**",

    // Generated files
    "src/generated/**",
    "src/generated/prisma/**",

    // Optional generated folders
    ".turbo/**",
    ".vercel/**",
    "dist/**",
  ]),
]);

export default eslintConfig;