/**
 * @file vite.config.ts
 * @description Production-ready Vite configuration for the Pixielity Vite app.
 *
 * This file configures the Vite build pipeline, dev server, plugins,
 * path aliases, chunk splitting, and asset optimisation.
 *
 * @see https://vitejs.dev/config/
 * @see https://vitejs.dev/guide/build.html
 */

import { resolve } from "path";

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { viteConfigPlugin } from "@abdokouta/ts-config/vite-plugin";

/**
 * Vite configuration factory.
 *
 * Receives the current `mode` ("development" | "production" | "test") and
 * the resolved environment variables so we can make mode-aware decisions
 * (e.g. enable source maps only in development).
 *
 * @param root - The project root directory (injected by Vite).
 * @param mode - The current build mode.
 */
export default defineConfig(({ mode }) => {
  /**
   * Load .env files for the current mode.
   * Variables prefixed with VITE_ are exposed to the client bundle.
   * Variables without the prefix are server-only and never bundled.
   *
   * @see https://vitejs.dev/guide/env-and-mode.html
   */
  const env = loadEnv(mode, process.cwd(), "");

  const isDev = mode === "development";
  const isProd = mode === "production";

  return {
    // -------------------------------------------------------------------------
    // Plugins
    // -------------------------------------------------------------------------

    /**
     * Plugin pipeline (order matters):
     *
     * 1. react()         — JSX transform, Fast Refresh in dev, automatic runtime.
     * 2. tsconfigPaths() — resolves TypeScript path aliases (@/*) in Vite.
     * 3. tailwindcss()   — Tailwind CSS v4 Vite plugin (replaces PostCSS plugin).
     */
    plugins: [
      react({
        /**
         * Enable TypeScript decorators via SWC.
         * SWC handles experimentalDecorators + emitDecoratorMetadata natively.
         * No Babel plugins needed.
         */
        tsDecorators: true,
      }),

      /**
       * Resolve TypeScript path aliases defined in tsconfig.json.
       * e.g. import Foo from "@/components/Foo" → src/components/Foo
       */
      tsconfigPaths(),

      /**
       * Tailwind CSS v4 Vite plugin.
       * Replaces the PostCSS-based approach for better HMR performance.
       */
      tailwindcss(),

      /**
       * Config plugin — injects env vars into window.__APP_CONFIG__ so
       * ConfigService (EnvDriver) can read them at runtime in the browser.
       */
      viteConfigPlugin({ env }),
    ],

    // -------------------------------------------------------------------------
    // Path resolution
    // -------------------------------------------------------------------------

    resolve: {
      alias: {
        /**
         * @/ maps to the src/ directory.
         * Matches the paths config in tsconfig.json.
         */
        "@": resolve(__dirname, "src"),
      },
    },

    // -------------------------------------------------------------------------
    // Development server
    // -------------------------------------------------------------------------

    server: {
      /**
       * Dev server port.
       * Override with VITE_PORT env var or the --port CLI flag.
       */
      port: parseInt(env.VITE_PORT ?? "5173", 10),

      /**
       * Automatically open the browser when the dev server starts.
       */
      open: false,

      /**
       * Enable CORS for the dev server.
       * Useful when the frontend is served from a different origin than the API.
       */
      cors: true,

      /**
       * Proxy API requests to the backend during development.
       * Avoids CORS issues and mirrors the production setup.
       *
       * Example: requests to /api/* are forwarded to http://localhost:8000/api/*
       */
      proxy: {
        // "/api": {
        //   target: env.VITE_API_URL ?? "http://localhost:8000",
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/api/, "/api"),
        // },
      },

      /**
       * HMR (Hot Module Replacement) configuration.
       * Disable overlay if you prefer to see errors in the console only.
       */
      hmr: {
        overlay: true,
      },
    },

    // -------------------------------------------------------------------------
    // Preview server (vite preview)
    // -------------------------------------------------------------------------

    preview: {
      /**
       * Port for `vite preview` (serves the production build locally).
       */
      port: parseInt(env.VITE_PREVIEW_PORT ?? "4173", 10),
      open: false,
    },

    // -------------------------------------------------------------------------
    // Build
    // -------------------------------------------------------------------------

    build: {
      /**
       * Output directory for the production build.
       * Relative to the project root.
       */
      outDir: "dist",

      /**
       * Empty the output directory before each build.
       */
      emptyOutDir: true,

      /**
       * Generate source maps.
       * - "hidden" in production: maps are generated but not referenced in
       *   the bundle (useful for error tracking tools like Sentry).
       * - true in development: full inline source maps for debugging.
       */
      sourcemap: isProd ? "hidden" : true,

      /**
       * Minimum file size (in bytes) for assets to be inlined as base64.
       * Files smaller than this are inlined; larger files are emitted separately.
       * Default: 4096 (4 KB).
       */
      assetsInlineLimit: 4096,

      /**
       * Target browsers for the production build.
       * "esnext" produces the smallest output; adjust for legacy browser support.
       *
       * @see https://vitejs.dev/config/build-options.html#build-target
       */
      target: isProd ? "es2020" : "esnext",

      /**
       * Rollup output options — controls chunk splitting and file naming.
       *
       * Manual chunks: split large dependencies into separate chunks so
       * browsers can cache them independently of your application code.
       */
      rollupOptions: {
        output: {
          /**
           * Chunk file naming pattern.
           * Includes a content hash for long-term caching.
           */
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",

          /**
           * Manual chunk splitting strategy.
           *
           * Separating vendor code from application code means users only
           * re-download your app code when you ship a new version — the
           * vendor chunk stays cached.
           */
          manualChunks: {
            // React runtime — changes rarely.
            "vendor-react": ["react", "react-dom"],

            // HeroUI component library — large, changes on library updates only.
            "vendor-heroui": ["@heroui/react"],

            // Router — if you add react-router-dom.
            // "vendor-router": ["react-router-dom"],
          },
        },
      },

      /**
       * Warn when a chunk exceeds this size (in kB).
       * Helps catch accidental large bundles before they reach production.
       */
      chunkSizeWarningLimit: 500,
    },

    // -------------------------------------------------------------------------
    // CSS
    // -------------------------------------------------------------------------

    css: {
      /**
       * CSS source maps in development for easier debugging.
       */
      devSourcemap: isDev,
    },

    // -------------------------------------------------------------------------
    // Environment variables
    // -------------------------------------------------------------------------

    /**
     * Only variables prefixed with VITE_ are exposed to the client.
     * This is the default prefix — change it here if needed.
     */
    envPrefix: "VITE_",

    // -------------------------------------------------------------------------
    // esbuild
    // -------------------------------------------------------------------------

    esbuild: {
      /**
       * Disable esbuild's TS decorator handling.
       * SWC (via @vitejs/plugin-react-swc) handles decorators instead.
       * This prevents the "experimental decorators" conflict.
       */
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        },
      },
    },

    // -------------------------------------------------------------------------
    // Optimisation (dependency pre-bundling)
    // -------------------------------------------------------------------------

    optimizeDeps: {
      /**
       * Force-include dependencies that Vite might miss during pre-bundling.
       * Add packages that use CommonJS or have complex re-exports.
       */
      include: ["react", "react-dom", "@heroui/react"],

      /**
       * Exclude packages from pre-bundling.
       * Use for packages that are already ESM and don't need transformation.
       */
      exclude: [],
    },

    // -------------------------------------------------------------------------
    // Logging
    // -------------------------------------------------------------------------

    /**
     * Log level — "info" in development, "warn" in production CI.
     */
    logLevel: isDev ? "info" : "warn",
  };
});
