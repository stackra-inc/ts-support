import { defineConfig } from 'tsup';

/**
 * tsup Build Configuration
 *
 * |--------------------------------------------------------------------------
 * | @abdokouta/ts-cache
 * |--------------------------------------------------------------------------
 * |
 * | Multi-driver cache system with memory, Redis, and null stores.
 * |
 * | Build output:
 * |   dist/index.mjs     — ESM (tree-shakeable, modern bundlers)
 * |   dist/index.js      — CJS (Node.js, legacy bundlers)
 * |   dist/index.d.ts    — TypeScript declarations
 * |   dist/index.d.cts   — CTS declarations
 * |
 * @see https://tsup.egoist.dev/
 */
export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Entry Point
  |--------------------------------------------------------------------------
  |
  | The main entry file that re-exports the entire public API.
  | All exports must go through src/index.ts.
  |
  */
  entry: ['src/index.ts'],

  /*
  |--------------------------------------------------------------------------
  | Output Formats
  |--------------------------------------------------------------------------
  |
  | Dual format output for maximum compatibility:
  |   - ESM (.mjs): Modern module format, enables tree-shaking
  |   - CJS (.js):  CommonJS for Node.js and legacy bundlers
  |
  */
  format: ['esm', 'cjs'],

  /*
  |--------------------------------------------------------------------------
  | TypeScript Declarations
  |--------------------------------------------------------------------------
  |
  | Generate .d.ts and .d.cts declaration files for full type safety.
  | Consumers get autocomplete and type checking without source access.
  |
  */
  dts: true,

  /*
  |--------------------------------------------------------------------------
  | Source Maps
  |--------------------------------------------------------------------------
  |
  | Generate .map files for debugging in production.
  | Allows stack traces to point to original TypeScript source.
  |
  */
  sourcemap: true,

  /*
  |--------------------------------------------------------------------------
  | Clean Output
  |--------------------------------------------------------------------------
  |
  | Remove the dist/ directory before each build.
  | Prevents stale files from previous builds.
  |
  */
  clean: true,

  /*
  |--------------------------------------------------------------------------
  | Minification
  |--------------------------------------------------------------------------
  |
  | Disabled — consumers minify during their own build.
  | Unminified output allows better tree-shaking and debugging.
  |
  */
  minify: false,

  /*
  |--------------------------------------------------------------------------
  | Target
  |--------------------------------------------------------------------------
  |
  | ES2020 for broad compatibility.
  | Includes optional chaining, nullish coalescing, BigInt, Promise.allSettled.
  | Supports Node.js 14+ and all modern browsers.
  |
  */
  target: 'es2020',

  /*
  |--------------------------------------------------------------------------
  | Platform
  |--------------------------------------------------------------------------
  |
  | Platform-neutral — works in both browser and Node.js.
  | Does not inject Node.js polyfills or browser shims.
  |
  */
  platform: 'neutral',

  /*
  |--------------------------------------------------------------------------
  | External Dependencies
  |--------------------------------------------------------------------------
  |
  | Dependencies that should NOT be bundled into the output.
  | These are provided by the consumer's node_modules at runtime.
  | Includes all peer dependencies and optional dependencies.
  |
  */
  external: [
    '@abdokouta/ts-container',
    '@abdokouta/ts-container-react',
    '@abdokouta/ts-support',
    '@abdokouta/ts-redis',
    '@upstash/redis',
    'react',
  ],

  /*
  |--------------------------------------------------------------------------
  | Code Splitting
  |--------------------------------------------------------------------------
  |
  | Disabled — library builds should produce single-file outputs.
  | Code splitting is for applications, not libraries.
  |
  */
  splitting: false,

  /*
  |--------------------------------------------------------------------------
  | Skip node_modules
  |--------------------------------------------------------------------------
  |
  | Don't process files from node_modules.
  | Improves build performance significantly.
  |
  */
  skipNodeModulesBundle: true,

  /*
  |--------------------------------------------------------------------------
  | Output Extensions
  |--------------------------------------------------------------------------
  |
  | Explicit file extensions for each format:
  |   - .mjs for ESM (unambiguous module format)
  |   - .js  for CJS (CommonJS format)
  |
  | This ensures correct module resolution in all environments.
  |
  */
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.js' };
  },
});
