/**
 * Events Configuration
 *
 * Default configuration for the events package.
 * Override these values when calling EventsModule.forRoot().
 *
 * @module @pixielity/events
 * @category Config
 */

import type { EventModuleOptions } from '@/src/interfaces';

/**
 * Default events configuration.
 */
export const defaultEventsConfig: EventModuleOptions = {
  /*
  |--------------------------------------------------------------------------
  | Default Dispatcher
  |--------------------------------------------------------------------------
  |
  | The name of the default dispatcher. Must match a key in `dispatchers`.
  |
  */
  default: 'memory',

  /*
  |--------------------------------------------------------------------------
  | Dispatchers
  |--------------------------------------------------------------------------
  |
  | Named dispatcher configurations. Each has a `driver` field.
  |
  | Drivers:
  |   - 'memory': In-memory (Map + RxJS Subject). Default.
  |   - 'redis':  Redis-backed via @abdokouta/react-redis.
  |   - 'null':   No-op for testing.
  |
  */
  dispatchers: {
    memory: {
      driver: 'memory',
      wildcards: true,
    },
    // redis: {
    //   driver: 'redis',
    //   connection: 'events',
    //   prefix: 'events:',
    //   wildcards: true,
    //   pollingInterval: 1000,
    // },
    // test: {
    //   driver: 'null',
    // },
  },

  /*
  |--------------------------------------------------------------------------
  | Wildcards
  |--------------------------------------------------------------------------
  |
  | Global default — individual dispatchers can override.
  |
  */
  wildcards: true,
};
