/**
 * Refine Configuration
 *
 * Pure data config — no instances, no connections.
 * Redis connections are resolved at runtime by the RedisFactory
 * registered in the DI container.
 *
 * @module config/refine
 */

import { defineConfig } from '@abdokouta/ts-refine';

const cacheConfig = defineConfig({});

export default cacheConfig;
