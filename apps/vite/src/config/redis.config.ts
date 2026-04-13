/**
 * Redis Configuration
 *
 * |--------------------------------------------------------------------------
 * | Upstash Redis HTTP connections.
 * |--------------------------------------------------------------------------
 * |
 * | Only includes connections that have credentials configured.
 * | If no VITE_UPSTASH_REDIS_REST_URL is set, no connections are registered
 * | and RedisManager won't attempt to connect on startup.
 * |
 * @module config/redis
 */

import { defineConfig } from "@abdokouta/ts-redis";

/*
|--------------------------------------------------------------------------
| Build connections map dynamically.
|--------------------------------------------------------------------------
|
| Only add a connection if its URL is set. This prevents the
| RedisManager from throwing "URL is required" on startup
| when credentials aren't configured yet.
|
*/
const connections: Record<string, { url: string; token: string; timeout?: number }> = {};

const mainUrl = import.meta.env.VITE_UPSTASH_REDIS_REST_URL;
const mainToken = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN;

if (mainUrl && mainToken) {
  connections.main = { url: mainUrl, token: mainToken };
}

const cacheUrl = import.meta.env.VITE_UPSTASH_CACHE_REST_URL || mainUrl;
const cacheToken = import.meta.env.VITE_UPSTASH_CACHE_REST_TOKEN || mainToken;

if (cacheUrl && cacheToken) {
  connections.cache = { url: cacheUrl, token: cacheToken };
}

const sessionUrl = import.meta.env.VITE_UPSTASH_SESSION_REST_URL || mainUrl;
const sessionToken = import.meta.env.VITE_UPSTASH_SESSION_REST_TOKEN || mainToken;

if (sessionUrl && sessionToken) {
  connections.session = { url: sessionUrl, token: sessionToken, timeout: 10000 };
}

const redisConfig = defineConfig({
  isGlobal: true,
  default: import.meta.env.VITE_REDIS_DEFAULT_CONNECTION || "main",
  connections,
});

export default redisConfig;
