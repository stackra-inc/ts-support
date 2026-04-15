/**
 * Vitest Configuration
 *
 * |--------------------------------------------------------------------------
 * | @abdokouta/ts-cache
 * |--------------------------------------------------------------------------
 * |
 * | Test runner configuration for the package.
 * |
 * | Features:
 * |   - Global test functions (describe, it, expect) — no imports needed
 * |   - jsdom environment for React component testing
 * |   - Setup file for mocks and test utilities
 * |   - v8 coverage provider (faster than istanbul)
 * |   - Path alias @ → ./src for consistent imports
 * |   - passWithNoTests — CI won't fail if no tests exist yet
 * |
 * @see https://vitest.dev/config/
 */

import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    /*
    |--------------------------------------------------------------------------
    | Globals
    |--------------------------------------------------------------------------
    |
    | Enable global test functions (describe, it, expect, vi, etc.)
    | without requiring explicit imports in every test file.
    |
    */
    globals: true,

    /*
    |--------------------------------------------------------------------------
    | Environment
    |--------------------------------------------------------------------------
    |
    | Use jsdom to simulate a browser DOM environment.
    | Required for testing React hooks and components.
    | Pure logic tests work fine with jsdom too.
    |
    */
    environment: 'jsdom',

    /*
    |--------------------------------------------------------------------------
    | Setup Files
    |--------------------------------------------------------------------------
    |
    | Runs before every test file. Used for:
    |   - Mocking DI decorators (@Injectable, @Inject, etc.)
    |   - Setting up global test utilities
    |   - Configuring reflect-metadata
    |
    */
    setupFiles: ['./__tests__/vitest.setup.ts'],

    /*
    |--------------------------------------------------------------------------
    | Test File Pattern
    |--------------------------------------------------------------------------
    |
    | Only include files in the __tests__/ directory.
    | Supports .test.ts, .spec.ts, .test.tsx, .spec.tsx extensions.
    |
    */
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],

    /*
    |--------------------------------------------------------------------------
    | Pass With No Tests
    |--------------------------------------------------------------------------
    |
    | Don't fail the test run if no test files are found.
    | Useful during initial development before tests are written.
    |
    */
    passWithNoTests: true,

    /*
    |--------------------------------------------------------------------------
    | Server Dependencies
    |--------------------------------------------------------------------------
    |
    | Inline specific ESM-only packages that cause issues with Vitest's
    | module resolution. Required for inversiland (DI container internals).
    |
    */
    server: {
      deps: {
        inline: ['inversiland', '@inversiland/inversify'],
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Coverage
    |--------------------------------------------------------------------------
    |
    | v8 coverage provider — faster than istanbul, uses V8's built-in
    | code coverage. Generates text (terminal), JSON, and HTML reports.
    |
    */
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
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

  /*
  |--------------------------------------------------------------------------
  | Path Aliases
  |--------------------------------------------------------------------------
  |
  | Map @ to ./src so imports like '@/services/cache.service' resolve
  | correctly in both source code and test files.
  |
  */
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
