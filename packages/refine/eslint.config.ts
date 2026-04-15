/**
 * ESLint Configuration
 *
 * |--------------------------------------------------------------------------
 * | @abdokouta/ts-cache
 * |--------------------------------------------------------------------------
 * |
 * | Extends the shared @nesvel/eslint-config with project-specific
 * | ignore patterns. Uses the ESLint flat config format.
 * |
 * | The shared config provides:
 * |   - TypeScript-aware rules via typescript-eslint
 * |   - Import ordering and unused import detection
 * |   - Consistent code style enforcement
 * |
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */

import type { Linter } from 'eslint';
import { viteConfig } from '@nesvel/eslint-config';

const config: Linter.Config[] = [
  /*
  |--------------------------------------------------------------------------
  | Shared Rules
  |--------------------------------------------------------------------------
  |
  | Spread the shared Nesvel ESLint configuration.
  | Includes TypeScript, import, and style rules.
  |
  */
  ...viteConfig,

  /*
  |--------------------------------------------------------------------------
  | Ignored Paths
  |--------------------------------------------------------------------------
  |
  | Files and directories excluded from linting:
  |   - dist/          — build output (generated code)
  |   - node_modules/  — third-party dependencies
  |   - *.config.js    — JavaScript config files
  |   - *.config.ts    — TypeScript config files (tsup, vitest, etc.)
  |
  */
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },

  /*
  |--------------------------------------------------------------------------
  | Project-Specific Overrides
  |--------------------------------------------------------------------------
  |
  | Add package-specific rule overrides here.
  | These take precedence over the shared config.
  |
  */
  {
    rules: {},
  },
];

export default config;
