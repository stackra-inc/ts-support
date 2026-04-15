/**
 * ESLint Configuration
 *
 * |--------------------------------------------------------------------------
 * | @abdokouta/ts-ui
 * |--------------------------------------------------------------------------
 * |
 * | Extends the shared @nesvel/eslint-config.
 * |
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */

import type { Linter } from 'eslint';
import { viteConfig } from '@nesvel/eslint-config';

const config: Linter.Config[] = [
  ...viteConfig,
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },
  {
    rules: {},
  },
];

export default config;
