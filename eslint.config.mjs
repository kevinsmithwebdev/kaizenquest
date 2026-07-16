import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  globalIgnores([
    "apps/web/.next/**",
    "apps/web/out/**",
    "apps/web/build/**",
    "apps/web/next-env.d.ts",
    "dist/**",
    ".nx/**",
  ]),
]);

export default eslintConfig;
