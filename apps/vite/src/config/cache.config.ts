/**
 * Cache Configuration
 *
 * Pure data config — no instances, no connections.
 * Redis connections are resolved at runtime by the RedisFactory
 * registered in the DI container.
 *
 * @module config/cache
 */

import { defineConfig } from '@abdokouta/ts-cache';

const cacheConfig = defineConfig({
  /**
   * Default store — switch via VITE_CACHE_DRIVER env var.
   */
  default: import.meta.env.VITE_CACHE_DRIVER || 'memory',

  stores: {
    /**
     * In-memory cache. Fast, no dependencies. Lost on refresh.
     */
    memory: {
      driver: 'memory',
      maxSize: Number(import.meta.env.VITE_CACHE_MEMORY_MAX_SIZE) || 100,
      ttl: Number(import.meta.env.VITE_CACHE_MEMORY_TTL) || 300,
      prefix: 'mem_',
    },

    /**
     * Redis cache via Upstash.
     * The connection name "cache" is resolved by the RedisFactory
     * registered under REDIS_FACTORY in the DI container.
     */
    redis: {
      driver: 'redis',
      connection: import.meta.env.VITE_REDIS_CACHE_CONNECTION || 'cache',
      prefix: import.meta.env.VITE_CACHE_REDIS_PREFIX || 'cache_',
      ttl: Number(import.meta.env.VITE_CACHE_REDIS_TTL) || 3600,
    },

    /**
     * Session store — longer TTL, separate Redis connection.
     */
    session: {
      driver: 'redis',
      connection: import.meta.env.VITE_REDIS_SESSION_CONNECTION || 'session',
      prefix: 'sess_',
      ttl: Number(import.meta.env.VITE_CACHE_SESSION_TTL) || 86400,
    },

    /**
     * No-op cache for testing.
     */
    null: {
      driver: 'null',
    },
  },

  /**
   * Global key prefix applied to all stores.
   */
  prefix: import.meta.env.VITE_CACHE_PREFIX || 'app_',
});

export default cacheConfig;
