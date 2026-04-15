/**
 * ESLint Configuration
 *
 * |--------------------------------------------------------------------------
 * | @abdokouta/ts-container-react
 * |--------------------------------------------------------------------------
 * |
 * | Extends the shared @nesvel/eslint-config with project-specific
 * | ignore patterns. Uses the ESLint flat config format.
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
