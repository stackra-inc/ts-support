/**
 * @fileoverview ESLint configuration for @stackra/ts-support package
 *
 * This configuration extends the shared @stackra/eslint-config with
 * project-specific ignore patterns. Uses the ESLint flat config format.
 *
 * Configuration Features:
 * - TypeScript Rules: TypeScript-aware linting via typescript-eslint
 * - Import Ordering: Enforces consistent import order and detects unused imports
 * - Code Style: Consistent code style enforcement across the monorepo
 * - Ignore Patterns: Excludes build output, node_modules, and config files
 *
 * @module @stackra/ts-support
 * @category Configuration
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */

// Import the Linter type for type-safe configuration
import type { Linter } from 'eslint';

// Import the shared Vite-optimized ESLint configuration from @stackra/eslint-config.
// This includes TypeScript, import ordering, and style rules.
import { viteConfig } from '@stackra/eslint-config';

const config: Linter.Config[] = [
  // Spread the shared Stackra ESLint configuration.
  // Includes TypeScript, import, and style rules.
  ...viteConfig,

  // Files and directories excluded from linting:
  //   - dist/          — build output (generated code)
  //   - node_modules/  — third-party dependencies
  //   - *.config.js    — JavaScript config files
  //   - *.config.ts    — TypeScript config files (tsup, vitest, etc.)
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },

  // Add package-specific rule overrides here.
  // These take precedence over the shared config.
  // Disable no-explicit-any across the project — this is a utility library
  // that wraps collect.js and provides generic facades/registries where
  // `any` is unavoidable in bridge casts and generic type parameters.
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-control-regex': 'off',
    },
  },
];

export default config;
