/**
 * Event Module Options
 *
 * Main configuration object for the events module.
 * Equivalent to `CacheModuleOptions` in the cache package.
 *
 * @module @pixielity/events
 * @category Interfaces
 */

import type { DispatcherConfig } from '@/types/dispatcher-config.type';

/**
 * EventModuleOptions — configuration for EventsModule.forRoot().
 *
 * @example
 * ```typescript
 * EventsModule.forRoot({
 *   default: 'memory',
 *   dispatchers: {
 *     memory: { driver: 'memory', wildcards: true },
 *     redis: { driver: 'redis', connection: 'events' },
 *     test: { driver: 'null' },
 *   },
 * })
 * ```
 */
export interface EventModuleOptions {
  /**
   * Default dispatcher name.
   * Must match a key in the `dispatchers` map.
   *
   * @default 'memory'
   */
  default: string;

  /**
   * Named dispatcher configurations.
   * Each dispatcher has a `driver` field and driver-specific options.
   */
  dispatchers: Record<string, DispatcherConfig>;

  /**
   * Global wildcard setting.
   * Individual dispatchers can override this.
   *
   * @default true
   */
  wildcards?: boolean;

  /**
   * Global key prefix for event channels (used by Redis dispatcher).
   *
   * @default ''
   */
  prefix?: string;
}
