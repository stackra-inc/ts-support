/**
 * Memory Dispatcher Configuration
 *
 * @module @pixielity/events
 * @category Interfaces
 */

export interface MemoryDispatcherConfig {
  driver: 'memory';
  /**
   * Enable wildcard matching. @default true
   */
  wildcards?: boolean;
  /**
   * Key prefix for namespacing.
   */
  prefix?: string;
}
