/**
 * @fileoverview Vitest configuration for @abdokouta/ts-container package
 *
 * This configuration sets up the testing environment for the container package,
 * including test globals, jsdom environment, coverage reporting, and path aliases.
 *
 * Configuration Features:
 * - Globals: Enables global test functions (describe, it, expect)
 * - Environment: Uses jsdom for React component testing
 * - Setup Files: Runs vitest.setup.ts before tests
 * - Coverage: Configures v8 coverage provider with HTML/JSON/text reports
 * - Path Aliases: Resolves @ to ./src for consistent imports
 *
 * @module @abdokouta/ts-container
 * @category Configuration
 */

import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    // Enable global test functions (describe, it, expect, etc.)
    globals: true,

    // Use jsdom environment for React testing
    environment: 'jsdom',

    // Run setup file before tests
    setupFiles: ['./__tests__/vitest.setup.ts'],

    // Only include __tests__ directory
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],

    // Fix ESM/CJS compatibility for inversiland
    server: {
      deps: {
        inline: ['inversiland', '@inversiland/inversify', '@abdokouta/ts-container'],
        interopDefault: true,
      },
    },

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
        '**/*.config.ts',
      ],
    },
  },

  // Resolve path aliases
  resolve: {
    alias: {
      // Map @ to ./src for consistent imports
      '@': resolve(__dirname, './src'),
    },
  },
});
