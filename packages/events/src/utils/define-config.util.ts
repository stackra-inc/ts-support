/**
 * Define Config Utility
 *
 * Type-safe helper for creating EventsModule configuration.
 *
 * @module @pixielity/events
 * @category Utils
 */

import type { EventModuleOptions } from '@/interfaces';

/**
 * Creates a type-safe events configuration object.
 *
 * @param config - The events module options.
 * @returns The same config object (identity function for type safety).
 */
export function defineConfig(config: EventModuleOptions): EventModuleOptions {
  return config;
}
