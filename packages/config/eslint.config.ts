/**
 * @file ESLint Flat Configuration (Root)
 * @description Root-level ESLint configuration for the monorepo.
 *   Extends the shared Nesvel ESLint config and applies global
 *   ignore patterns for build artifacts and generated files.
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */

import type { Linter } from 'eslint';
import { viteConfig } from '@nesvel/eslint-config';

/**
 * Root ESLint flat configuration array.
 *
 * Composed of:
 * 1. Shared Nesvel ESLint rules (spread from the shared config package).
 * 2. Global ignore patterns for build output and config files.
 * 3. Placeholder for monorepo-wide rule overrides.
 */
const config: Linter.Config[] = [
  ...viteConfig,

  /**
   * Directories and files excluded from linting across the monorepo.
   */
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },

  /**
   * Monorepo-wide rule overrides — add any shared overrides here.
   */
  {
    rules: {},
  },
];

export default config;
