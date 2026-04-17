/**
 * @fileoverview Configuration options for the PWA Vite plugin wrapper.
 *
 * @module pwa/plugins/interfaces/vite-pwa-plugin-options
 */

import type { ManifestOptions } from './manifest-options.interface';
import type { RuntimeCachingEntry } from './runtime-caching-entry.interface';

/**
 * Configuration options for the PWA Vite plugin wrapper.
 *
 * Wraps `vite-plugin-pwa` with sensible defaults for production PWAs.
 * All options are optional — the plugin works out of the box.
 *
 * @example
 * ```ts
 * import { vitePwaPlugin } from '@abdokouta/ts-pwa/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     vitePwaPlugin({
 *       manifest: {
 *         name: 'My App',
 *         short_name: 'App',
 *         theme_color: '#ffffff',
 *       },
 *     }),
 *   ],
 * })
 * ```
 */
export interface VitePwaPluginOptions {
  /**
   * Service worker registration type.
   *
   * - `"autoUpdate"` — auto-updates the service worker in the background (recommended)
   * - `"prompt"` — shows a prompt to the user when an update is available
   *
   * @default "autoUpdate"
   */
  registerType?: 'autoUpdate' | 'prompt';

  /**
   * Whether to include the PWA assets (manifest, icons) in the build.
   * @default true
   */
  includeAssets?: string[];

  /**
   * Web App Manifest configuration.
   * Merged with sensible defaults (standalone display, start_url "/", etc.).
   */
  manifest?: ManifestOptions | false;

  /**
   * Workbox configuration for the service worker.
   */
  workbox?: {
    /** Glob patterns for files to precache. */
    globPatterns?: string[];

    /** Runtime caching strategies. */
    runtimeCaching?: RuntimeCachingEntry[];

    /** Whether to clean outdated caches on activate. @default true */
    cleanupOutdatedCaches?: boolean;

    /** Navigation fallback for SPA routing. @default "index.html" */
    navigateFallback?: string;

    /** Additional workbox options. */
    [key: string]: unknown;
  };

  /**
   * Development options.
   */
  devOptions?: {
    /** Enable PWA in development mode. @default false */
    enabled?: boolean;

    /** Service worker type. @default "module" */
    type?: 'classic' | 'module';

    /** Additional dev options. */
    [key: string]: unknown;
  };

  /**
   * Strategy for generating the service worker.
   *
   * - `"generateSW"` — Workbox generates the SW automatically (recommended)
   * - `"injectManifest"` — inject precache manifest into a custom SW file
   *
   * @default "generateSW"
   */
  strategies?: 'generateSW' | 'injectManifest';

  /**
   * Path to the custom service worker source file.
   * Only used when `strategies` is `"injectManifest"`.
   *
   * @default "src/sw.ts"
   */
  srcDir?: string;

  /**
   * Filename for the custom service worker.
   * Only used when `strategies` is `"injectManifest"`.
   *
   * @default "sw.ts"
   */
  filename?: string;

  /**
   * Whether to disable the plugin entirely.
   * Useful for conditional enabling based on environment.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Pass-through options for vite-plugin-pwa.
   * These are merged last and override any computed defaults.
   */
  overrides?: Record<string, unknown>;
}
