/**
 * Vitest Configuration
 *
 * |--------------------------------------------------------------------------
 * | @abdokouta/ts-application
 * |--------------------------------------------------------------------------
 * |
 * | Test runner configuration for the application package.
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
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/vitest.setup.ts'],
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    passWithNoTests: true,
    server: {
      deps: {
        inline: ['inversiland', '@inversiland/inversify'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.test.ts', '**/*.config.ts'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
