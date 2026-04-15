import { defineConfig } from 'tsup';
import path from 'path';

/**
 * tsup Configuration for @abdokouta/ts-ui Package
 *
 * |--------------------------------------------------------------------------
 * | Builds the UI package with dual format output (ESM + CJS).
 * |--------------------------------------------------------------------------
 * |
 * | Features:
 * |   - Dual format output (ESM and CJS)
 * |   - TypeScript declaration files
 * |   - Source maps for debugging
 * |   - Path alias resolution (@/ → src/)
 * |   - CSS bundling for styles
 * |   - External React, HeroUI, Framer Motion
 * |
 * @see https://tsup.egoist.dev/
 */
export default defineConfig({
  entry: ['src/index.ts', 'src/styles.css'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  target: 'es2020',
  splitting: false,
  skipNodeModulesBundle: true,
  external: [
    'react',
    'react-dom',
    '@heroui/react',
    '@heroui/theme',
    'framer-motion',
    'tailwindcss',
  ],
  loader: {
    '.css': 'copy',
  },
  esbuildOptions(options) {
    options.jsx = 'automatic';
    /* Resolve @/ path alias to src/ */
    options.alias = {
      '@': path.resolve(__dirname, 'src'),
    };
  },
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    };
  },
});
