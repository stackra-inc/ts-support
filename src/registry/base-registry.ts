/**
 * @fileoverview Base registry implementation
 *
 * A generic key-value registry backed by {@link MapCollection}.
 * Provides O(1) lookups, optional default values, and validation hooks.
 *
 * @module @stackra/support
 * @category Registries
 */

import { MapCollection } from '@/collections/map.collection';
import type { BaseRegistryOptions, ValidationResult, Collection } from '@/interfaces';

/**
 * Base registry class
 *
 * Stores items by string key using {@link MapCollection} for O(1) operations.
 * Adds default-item fallback, before-add validation, and after-add hooks
 * on top of the raw collection.
 *
 * @typeParam T - The type of items stored in the registry
 *
 * @example
 * ```typescript
 * const registry = new BaseRegistry<Theme>({
 *   defaultItem: defaultTheme,
 *   validateBeforeAdd: (key, theme) => {
 *     if (!theme.name) return { valid: false, error: 'Theme must have a name' };
 *     return { valid: true };
 *   },
 * });
 *
 * registry.register('blue', blueTheme);
 * registry.get('blue');   // blueTheme
 * registry.get('nope');   // defaultTheme
 * ```
 */
export class BaseRegistry<T> implements Collection<T> {
  /**
   * Internal map-based storage.
   */
  protected readonly storage = new MapCollection<string, T>();

  /**
   * Fallback value returned by {@link get} when a key is missing.
   */
  protected defaultItem?: T;

  /**
   * Optional validation executed before every {@link register} call.
   */
  protected validateBeforeAdd?: (key: string, item: T) => ValidationResult;

  /**
   * Optional callback executed after a successful {@link register}.
   */
  protected afterAdd?: (key: string, item: T) => void;

  /**
   * Create a new registry.
   *
   * @param options - Optional default item, validation, and lifecycle hooks
   */
  constructor(options: BaseRegistryOptions<T> = {}) {
    this.defaultItem = options.defaultItem;
    this.validateBeforeAdd = options.validateBeforeAdd;
    this.afterAdd = options.afterAdd;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Core
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Register (add or replace) an item.
   *
   * Runs the `validateBeforeAdd` hook first; throws on failure.
   * Fires the `afterAdd` hook on success.
   *
   * @param key  - Unique identifier
   * @param item - Value to store
   * @throws Error if validation fails
   */
  register(key: string, item: T): void {
    if (this.validateBeforeAdd) {
      const result = this.validateBeforeAdd(key, item);

      if (!result.valid) {
        throw new Error(`Validation failed for key "${key}": ${result.error || 'Unknown error'}`);
      }
    }

    this.storage.set(key, item);

    if (this.afterAdd) {
      this.afterAdd(key, item);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Collection interface
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * @inheritdoc — delegates to {@link register} so hooks still fire.
   */
  add(key: string, value: T): void {
    this.register(key, value);
  }

  /**
   * Retrieve an item by key.
   *
   * Falls back to {@link defaultItem} when the key is not found.
   *
   * @param key - Item identifier
   * @returns The stored value, the default item, or `undefined`
   */
  get(key: string): T | undefined {
    return this.storage.get(key) ?? this.defaultItem;
  }

  /**
   * Return every stored value in insertion order.
   */
  getAll(): T[] {
    return this.storage.values();
  }

  /**
   * Return every registered key in insertion order.
   */
  getKeys(): string[] {
    return this.storage.keys();
  }

  /**
   * Convert the registry to a plain `Record<string, T>`.
   */
  getAsRecord(): Record<string, T> {
    return this.storage.toObject();
  }

  /**
   * Check whether a key exists.
   */
  has(key: string): boolean {
    return this.storage.has(key);
  }

  /**
   * Remove an item by key.
   *
   * @returns `true` if the key existed and was removed
   */
  remove(key: string): boolean {
    return this.storage.delete(key);
  }

  /**
   * Remove all items from the registry.
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Return the number of registered items.
   */
  size(): number {
    return this.storage.size();
  }

  /**
   * Return `true` when the registry is empty.
   */
  isEmpty(): boolean {
    return this.storage.isEmpty();
  }

  /**
   * Iterate over every entry in insertion order.
   */
  forEach(callback: (value: T, key: string) => void): void {
    this.storage.each((value, key) => {
      callback(value, key);
    });
  }

  /**
   * Map every entry to a new value and return the results as an array.
   */
  map<U>(callback: (value: T, key: string) => U): U[] {
    const result: U[] = [];

    this.storage.each((value, key) => {
      result.push(callback(value, key));
    });

    return result;
  }

  /**
   * Return all values whose entries satisfy the predicate.
   */
  filter(predicate: (value: T, key: string) => boolean): T[] {
    const result: T[] = [];

    this.storage.each((value, key) => {
      if (predicate(value, key)) {
        result.push(value);
      }
    });

    return result;
  }

  /**
   * Return the first value whose entry satisfies the predicate.
   */
  find(predicate: (value: T, key: string) => boolean): T | undefined {
    return this.storage.first(predicate);
  }
}
