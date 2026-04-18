/**
 * @fileoverview Base registry options interface.
 *
 * Configuration options for creating a registry instance.
 * Allows customization of default item behavior and validation.
 *
 * @module @stackra/ts-support
 * @category Interfaces
 */

import type { ValidationResult } from './validation-result.interface';

/**
 * Base registry options
 *
 * Configuration options for creating a registry instance.
 * Allows customization of default item behavior and validation.
 *
 * @template T - The type of items stored in the registry
 */
export interface BaseRegistryOptions<T> {
  /**
   * Default item to return when requested item is not found
   *
   * If not provided, get() will return undefined for missing items.
   * If provided, get() will return this default item instead.
   */
  defaultItem?: T;

  /**
   * Validation hook called before adding an item
   *
   * Allows custom validation logic before items are added to the registry.
   * If validation fails, the item will not be added and an error will be thrown.
   *
   * @param key - Item key
   * @param item - Item to validate
   * @returns Validation result
   */
  validateBeforeAdd?: (key: string, item: T) => ValidationResult;

  /**
   * Hook called after an item is successfully added
   *
   * Useful for side effects like logging, notifications, or triggering
   * dependent updates after an item is registered.
   *
   * @param key - Item key
   * @param item - Item that was added
   */
  afterAdd?: (key: string, item: T) => void;
}
