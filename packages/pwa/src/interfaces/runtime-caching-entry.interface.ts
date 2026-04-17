/**
 * @fileoverview Workbox runtime caching strategy configuration.
 *
 * @module @abdokouta/ts-pwa
 * @category Interfaces
 */

/**
 * Workbox runtime caching strategy configuration.
 */
export interface RuntimeCachingEntry {
  /** URL pattern to match (string or RegExp). */
  urlPattern: string | RegExp;

  /** Caching strategy handler. */
  handler: 'CacheFirst' | 'NetworkFirst' | 'NetworkOnly' | 'StaleWhileRevalidate' | 'CacheOnly';

  /** Strategy options. */
  options?: {
    cacheName?: string;
    expiration?: {
      maxEntries?: number;
      maxAgeSeconds?: number;
    };
    cacheableResponse?: {
      statuses?: number[];
    };
    networkTimeoutSeconds?: number;
    [key: string]: unknown;
  };

  /** HTTP method to match. @default "GET" */
  method?: string;
}
