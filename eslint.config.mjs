import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // One-off data/debug/ops scripts should not block app lint.
    "scripts/**",
    "check-*.ts",
    "debug-*.ts",
    "diagnose*.ts",
    "list-*.ts",
    "sample-data.ts",
    "sync-*.ts",
    "test-*.ts",
    "trigger-*.ts",
    "verify-*.ts",
  ]),
]);

export default eslintConfig;
