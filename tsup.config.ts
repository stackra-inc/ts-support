/**
 * @fileoverview tsup build configuration for @stackra/ts-support
 * @module @stackra/ts-support
 * @see https://tsup.egoist.dev/
 */

import { defineConfig } from 'tsup';
import { basePreset } from '@stackra/tsup-config';

export default defineConfig({
  ...basePreset,
  entry: ['src/index.ts'],
  external: [],
});
