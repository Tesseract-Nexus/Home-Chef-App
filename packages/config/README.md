# Config Package

This package contains shared configurations for tools like ESLint.

## Configurations

- `index.js`: A shared ESLint configuration for Next.js projects.

## Usage

To use this configuration in another package (like `apps/web`), add it to the `devDependencies` in `package.json`:

```json
"devDependencies": {
  "@homechef/config": "workspace:^1.0.0"
}
```

Then, extend it in the local ESLint configuration file (e.g., `eslint.config.mjs`):

```javascript
import homechefConfig from "@homechef/config";
import { createConfigFromLegacy } from "@eslint/compat";
// ...
const eslintConfig = defineConfig([
  // ... your other configs
  ...createConfigFromLegacy(homechefConfig), // Using a compatibility layer for flat config
]);
```
