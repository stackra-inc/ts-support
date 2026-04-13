import { defineConfig } from 'tsup';

/**
 * tsup Configuration for @abdokouta/logger Package
 *
 * Builds the logger package with dual format output (ESM + CJS).
 * Provides a flexible logging system with multiple transporters
 * (console, storage, silent) and formatters (pretty, json, simple).
 *
 * @see https://tsup.egoist.dev/
 */
export default defineConfig({
  /**
   * Entry point for the build.
   *
   * Exports the logger service, transporters, formatters, and hooks.
   */
  entry: ['src/index.ts'],

  /**
   * Dual format output (ESM + CJS).
   *
   * - ESM: Modern module format for tree-shaking
   * - CJS: CommonJS for Node.js compatibility
   */
  format: ['esm', 'cjs'],

  /**
   * Generate TypeScript declaration files.
   *
   * Provides full type safety for consumers.
   */
  dts: true,

  /**
   * Generate source maps for debugging.
   *
   * Helps developers debug issues in production.
   */
  sourcemap: true,

  /**
   * Clean output directory before each build.
   *
   * Prevents stale files from previous builds.
   */
  clean: true,

  /**
   * Consumers will minify during their own build.
   *
   * Library code should not be pre-minified to allow
   * better tree-shaking and debugging.
   */
  minify: false,

  /**
   * Target ES2020 for broad compatibility.
   *
   * Supports modern browsers and Node.js 14+.
   * Includes optional chaining, nullish coalescing, and other ES2020 features.
   */
  target: 'es2020',

  /**
   * Platform-neutral build.
   *
   * Works in both browser and Node.js environments.
   */
  platform: 'neutral',

  /**
   * External dependencies that should not be bundled.
   *
   * - @abdokouta/react-di: DI system (peer dependency)
   * - react: React library (optional peer dependency for hooks)
   */
  external: [
    '@abdokouta/ts-container',
    '@abdokouta/ts-container-react',
    '@abdokouta/react-support',
    '@abdokouta/react-redis',
    'react',
  ],

  /**
   * Disable code splitting for library builds.
   *
   * Libraries should be single-file outputs for easier consumption.
   */
  splitting: false,

  /**
   * Skip node_modules from being processed.
   *
   * Improves build performance by not processing dependencies.
   */
  skipNodeModulesBundle: true,

  /**
   * Ensure proper file extensions for each format.
   *
   * - .mjs for ESM (explicit module format)
   * - .js for CJS (CommonJS format)
   *
   * This ensures proper module resolution in all environments.
   */
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.js' };
  },
});
