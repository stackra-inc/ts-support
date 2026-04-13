/**
 * Redis Dispatcher Configuration
 *
 * @module @pixielity/events
 * @category Interfaces
 */

export interface RedisDispatcherConfig {
  driver: 'redis';
  /**
   * Redis connection name from RedisModule config. @default 'default'
   */
  connection?: string;
  /**
   * Redis key prefix. @default 'events:'
   */
  prefix?: string;
  /**
   * Enable wildcard matching. @default true
   */
  wildcards?: boolean;
  /**
   * Polling interval in ms. @default 1000
   */
  pollingInterval?: number;
}
