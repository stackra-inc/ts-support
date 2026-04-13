/**
 * Dispatcher Config Union Type
 *
 * Equivalent to `StoreConfig` in the cache package.
 *
 * @module @pixielity/events
 */

import type { MemoryDispatcherConfig } from '@/interfaces/memory-dispatcher-config.interface';
import type { RedisDispatcherConfig } from '@/interfaces/redis-dispatcher-config.interface';
import type { NullDispatcherConfig } from '@/interfaces/null-dispatcher-config.interface';

export type DispatcherConfig =
  | MemoryDispatcherConfig
  | RedisDispatcherConfig
  | NullDispatcherConfig;
