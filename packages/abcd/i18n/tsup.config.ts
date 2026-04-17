/**
 * @fileoverview tsup build configuration for @abdokouta/react-i18n
 *
 * Uses the @nesvel/tsup-config React library preset which extends the
 * base preset with JSX automatic transform and React externalization.
 *
 * This package has multiple entry points:
 * - src/index.ts          → main exports (module, hooks, services)
 * - src/adapters/index.ts → Vite plugin adapter (./vite-plugin)
 * - src/providers/index.ts → i18n providers (./providers)
 *
 * Build output:
 *   dist/index.mjs            — ESM main entry
 *   dist/index.js             — CJS main entry
 *   dist/index.d.ts           — TypeScript declarations
 *   dist/adapters/index.mjs   — ESM Vite plugin
 *   dist/adapters/index.js    — CJS Vite plugin
 *   dist/providers/index.mjs  — ESM providers
 *   dist/providers/index.js   — CJS providers
 *
 * @module @abdokouta/react-i18n
 * @category Configuration
 * @see https://tsup.egoist.dev/
 */

import { defineConfig } from 'tsup';
import { reactLibPreset } from '@nesvel/tsup-config';

export default defineConfig({
  ...reactLibPreset,

  // Multiple entry points for sub-path exports:
  // - './vite-plugin' → adapters
  // - './providers'   → providers
  entry: ['src/index.ts', 'src/adapters/index.ts', 'src/providers/index.ts'],
});
