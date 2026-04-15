/**
 * @fileoverview Vitest configuration for @abdokouta/kbd package
 *
 * This configuration sets up the testing environment for the kbd package,
 * including test globals, jsdom environment, coverage reporting, and path aliases.
 *
 * Configuration Features:
 * - Globals: Enables global test functions (describe, it, expect)
 * - Environment: Uses jsdom for DOM testing
 * - Setup Files: Runs vitest.setup.ts before tests
 * - Coverage: Configures v8 coverage provider with HTML/JSON/text reports
 * - Path Aliases: Resolves @ to ./src for consistent imports
 *
 * @module @abdokouta/kbd
 * @category Configuration
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Enable global test functions (describe, it, expect, etc.)
    globals: true,

    // Use jsdom environment for DOM testing
    environment: 'jsdom',

    // Run setup file before tests (now in same directory)
    setupFiles: ['./__tests__/vitest.setup.ts'],

    // Only include __tests__ directory
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],

    // Coverage configuration
    coverage: {
      // Use v8 coverage provider (faster than istanbul)
      provider: 'v8',

      // Generate multiple report formats
      reporter: ['text', 'json', 'html'],

      // Exclude files from coverage
      exclude: [
        'node_modules/',
        'dist/',
        'test/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.stories.tsx',
        '**/*.config.ts',
      ],
    },
  },

  // Resolve path aliases
  resolve: {
    alias: {
      // Map @ to ./src for consistent imports
      '@': path.resolve(__dirname, './src'),
    },
  },
});
