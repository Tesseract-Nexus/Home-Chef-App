import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { createConfigFromLegacy } from "@eslint/compat"; // Import compatibility layer
import homechefConfig from "@homechef/config"; // Import our shared config

const eslintConfig = defineConfig([
  // Use compatibility layer for our legacy shared config
  ...createConfigFromLegacy(homechefConfig),
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;