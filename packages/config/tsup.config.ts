import { defineConfig } from 'tsup';

/**
 * tsup Configuration for @abdokouta/react-config Package
 *
 * Builds the config package with dual format output (ESM + CJS).
 * Provides configuration management with multiple drivers (env, file).
 *
 * @see https://tsup.egoist.dev/
 */
export default defineConfig({
  /**
   * Entry points for the build.
   *
   * - Main entry: config service, drivers, interfaces
   * - Vite plugin: separate entry for Vite integration
   */
  entry: ['src/index.ts'],

  /**
   * Dual format output (ESM + CJS).
   */
  format: ['esm', 'cjs'],

  /**
   * Generate TypeScript declaration files.
   */
  dts: true,

  /**
   * Generate source maps for debugging.
   */
  sourcemap: true,

  /**
   * Clean output directory before each build.
   */
  clean: true,

  /**
   * Library code should not be pre-minified.
   */
  minify: false,

  /**
   * Target ES2020 for broad compatibility.
   */
  target: 'es2020',

  /**
   * Platform-neutral build.
   */
  platform: 'neutral',

  /**
   * External dependencies that should not be bundled.
   *
   * - @abdokouta/ts-container: DI system (peer dependency)
   * - react: React library (optional peer dependency)
   * - dotenv: Optional peer dependency for .env file loading
   * - vite: Optional peer dependency for Vite plugin
   * - glob: Used by scan utility (optional)
   */
  external: ['@abdokouta/ts-container', 'react', 'dotenv', 'vite', 'glob'],

  /**
   * Disable code splitting for library builds.
   */
  splitting: false,

  /**
   * Skip node_modules from being processed.
   */
  skipNodeModulesBundle: true,

  /**
   * Ensure proper file extensions for each format.
   */
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.js' };
  },
});
