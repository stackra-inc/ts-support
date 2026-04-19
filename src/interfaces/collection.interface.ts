/**
 * @fileoverview Collection interface for registry storage.
 *
 * Defines the contract for a key-value store used internally by
 * registries.
 *
 * @module @stackra/ts-support
 * @category Interfaces
 */

/**
 * Collection interface for registry storage.
 *
 * Defines the contract for a key-value store used internally by
 * registries. Every method operates on string keys and generic values,
 * providing O(1) lookups, inserts, and deletes when backed by a Map.
 *
 * @typeParam T - The type of values stored in the collection
 */
export interface Collection<T> {
  /**
   * Add or replace a value under the given key.
   */
  add(key: string, value: T): void;

  /**
   * Retrieve a value by its key.
   */
  get(key: string): T | undefined;

  /**
   * Return every value in the collection as an array.
   */
  getAll(): T[];

  /**
   * Return every key in the collection as an array.
   */
  getKeys(): string[];

  /**
   * Convert the collection to a plain record object.
   */
  getAsRecord(): Record<string, T>;

  /**
   * Check whether a key exists in the collection.
   */
  has(key: string): boolean;

  /**
   * Remove a key and its associated value.
   */
  remove(key: string): boolean;

  /**
   * Remove all entries from the collection.
   */
  clear(): void;

  /**
   * Return the number of entries in the collection.
   */
  size(): number;

  /**
   * Check whether the collection contains zero entries.
   */
  isEmpty(): boolean;

  /**
   * Execute a callback for every entry in insertion order.
   */
  forEach(callback: (value: T, key: string) => void): void;

  /**
   * Transform every entry and collect the results into an array.
   */
  map<U>(callback: (value: T, key: string) => U): U[];

  /**
   * Return all values whose entries satisfy the predicate.
   */
  filter(predicate: (value: T, key: string) => boolean): T[];

  /**
   * Return the first value whose entry satisfies the predicate.
   */
  find(predicate: (value: T, key: string) => boolean): T | undefined;
}
