/**
 * @fileoverview Laravel-style array utility class.
 *
 * Provides static methods for common array and object operations,
 * mirroring Laravel's `Illuminate\Support\Arr` helper class.
 *
 * All methods are pure — they return new arrays/objects without
 * mutating the originals.
 *
 * ## Laravel Parity
 *
 * | Laravel                              | Stackra                                |
 * |--------------------------------------|----------------------------------------|
 * | `Arr::get($arr, 'user.name')`        | `Arr.get(obj, 'user.name')`            |
 * | `Arr::set($arr, 'user.name', 'Joe')` | `Arr.set(obj, 'user.name', 'Joe')`     |
 * | `Arr::has($arr, 'user.name')`        | `Arr.has(obj, 'user.name')`            |
 * | `Arr::only($arr, ['id', 'name'])`    | `Arr.only(obj, ['id', 'name'])`        |
 * | `Arr::except($arr, ['password'])`    | `Arr.except(obj, ['password'])`        |
 * | `Arr::first($arr, $callback)`        | `Arr.first(arr, callback)`             |
 * | `Arr::last($arr, $callback)`         | `Arr.last(arr, callback)`              |
 * | `Arr::flatten($arr)`                 | `Arr.flatten(arr)`                     |
 * | `Arr::wrap($value)`                  | `Arr.wrap(value)`                      |
 *
 * @module arr/arr
 * @category Arrays
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Any plain object with string keys.
 * Used as the input type for dot-notation accessors.
 */
type DataObject = Record<string, any>;

// ============================================================================
// Arr Class
// ============================================================================

/**
 * Laravel-style array and object utility class.
 *
 * Provides dot-notation access, structural transformations, and
 * functional helpers for arrays and plain objects.
 *
 * @example
 * ```typescript
 * import { Arr } from '@stackra/ts-support';
 *
 * // Dot-notation access
 * const name = Arr.get(config, 'database.connections.mysql.host', 'localhost');
 *
 * // Structural helpers
 * const subset = Arr.only(user, ['id', 'name', 'email']);
 * const safe   = Arr.except(user, ['password', 'token']);
 *
 * // Array helpers
 * const first = Arr.first([1, 2, 3], (n) => n > 1); // 2
 * const flat  = Arr.flatten([[1, 2], [3, [4, 5]]]);  // [1, 2, 3, 4, 5]
 * ```
 */
export class Arr {
  // ── Dot-Notation Access ─────────────────────────────────────────────────

  /**
   * Get a value from a nested object using dot notation.
   *
   * Supports wildcard `*` segments to pluck values from arrays of objects.
   *
   * @typeParam T - The expected return type
   * @param target   - The object to read from
   * @param key      - Dot-separated path (e.g., `'user.address.city'`)
   * @param fallback - Value to return if the path doesn't exist
   * @returns The value at the path, or the fallback
   *
   * @example
   * ```typescript
   * const config = { db: { host: 'localhost', port: 5432 } };
   * Arr.get(config, 'db.host');           // 'localhost'
   * Arr.get(config, 'db.name', 'mydb');   // 'mydb'
   *
   * // Wildcard plucking
   * const users = { accounts: [{ name: 'Alice' }, { name: 'Bob' }] };
   * Arr.get(users, 'accounts.*.name');    // ['Alice', 'Bob']
   * ```
   */
  static get<T = any>(target: DataObject, key: string | null, fallback?: T): T {
    /* Null key → return the entire target */
    if (key === null) {
      return target as unknown as T;
    }

    /* Direct key match (no dots) — fast path */
    if (key in target) {
      return target[key] as T;
    }

    const segments = key.split(".");
    let current: any = target;

    for (const segment of segments) {
      /* Wildcard — pluck from array */
      if (segment === "*") {
        if (!Array.isArray(current)) {
          return fallback as T;
        }
        const remaining = segments.slice(segments.indexOf(segment) + 1).join(".");
        if (remaining === "") {
          return current as T;
        }
        return current.map((item: any) => Arr.get(item, remaining, fallback)) as T;
      }

      if (current === null || current === undefined || typeof current !== "object") {
        return fallback as T;
      }

      current = current[segment];
    }

    return (current === undefined ? fallback : current) as T;
  }

  /**
   * Set a value in a nested object using dot notation.
   *
   * Creates intermediate objects as needed. Returns a **new** object —
   * the original is not mutated.
   *
   * @param target - The object to write into
   * @param key    - Dot-separated path
   * @param value  - The value to set
   * @returns A new object with the value set at the given path
   *
   * @example
   * ```typescript
   * const config = { db: { host: 'localhost' } };
   * const updated = Arr.set(config, 'db.port', 5432);
   * // → { db: { host: 'localhost', port: 5432 } }
   * ```
   */
  static set<T extends DataObject>(target: T, key: string, value: any): T {
    const result = Arr.deepClone(target);
    const segments = key.split(".");
    let current: any = result;

    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i]!;

      if (!(segment in current) || typeof current[segment] !== "object") {
        /* Next segment is numeric → create array, otherwise object */
        current[segment] = /^\d+$/.test(segments[i + 1]!) ? [] : {};
      }

      current = current[segment];
    }

    current[segments[segments.length - 1]!] = value;
    return result;
  }

  /**
   * Check if a key exists in a nested object using dot notation.
   *
   * Accepts a single key or an array of keys. When given an array,
   * returns `true` only if **all** keys exist.
   *
   * @param target - The object to inspect
   * @param keys   - One or more dot-separated paths
   * @returns `true` if all specified paths exist
   *
   * @example
   * ```typescript
   * const config = { db: { host: 'localhost' } };
   * Arr.has(config, 'db.host');                  // true
   * Arr.has(config, 'db.port');                  // false
   * Arr.has(config, ['db.host', 'db.port']);      // false
   * ```
   */
  static has(target: DataObject, keys: string | string[]): boolean {
    const keyArray = Array.isArray(keys) ? keys : [keys];

    return keyArray.every((key) => {
      const segments = key.split(".");
      let current: any = target;

      for (const segment of segments) {
        if (
          current === null ||
          current === undefined ||
          typeof current !== "object" ||
          !(segment in current)
        ) {
          return false;
        }
        current = current[segment];
      }

      return true;
    });
  }

  /**
   * Remove one or more keys from a nested object using dot notation.
   *
   * Returns a new object — the original is not mutated.
   *
   * @param target - The object to remove keys from
   * @param keys   - One or more dot-separated paths to remove
   * @returns A new object without the specified keys
   *
   * @example
   * ```typescript
   * const user = { name: 'Alice', password: 'secret', email: 'a@b.com' };
   * Arr.forget(user, 'password');
   * // → { name: 'Alice', email: 'a@b.com' }
   * ```
   */
  static forget<T extends DataObject>(target: T, keys: string | string[]): T {
    const result = Arr.deepClone(target);
    const keyArray = Array.isArray(keys) ? keys : [keys];

    for (const key of keyArray) {
      const segments = key.split(".");
      let current: any = result;

      for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i]!;
        if (!(segment in current) || typeof current[segment] !== "object") {
          break;
        }
        current = current[segment];
      }

      delete current[segments[segments.length - 1]!];
    }

    return result;
  }

  // ── Structural Helpers ──────────────────────────────────────────────────

  /**
   * Return a subset of the object with only the specified keys.
   *
   * @param target - The source object
   * @param keys   - Keys to include
   * @returns A new object containing only the specified keys
   *
   * @example
   * ```typescript
   * const user = { id: 1, name: 'Alice', email: 'a@b.com', password: 'x' };
   * Arr.only(user, ['id', 'name']);
   * // → { id: 1, name: 'Alice' }
   * ```
   */
  static only<T extends DataObject>(target: T, keys: string[]): Partial<T> {
    const result: any = {};

    for (const key of keys) {
      if (key in target) {
        result[key] = target[key];
      }
    }

    return result;
  }

  /**
   * Return the object without the specified keys.
   *
   * @param target - The source object
   * @param keys   - Keys to exclude
   * @returns A new object without the specified keys
   *
   * @example
   * ```typescript
   * const user = { id: 1, name: 'Alice', password: 'secret' };
   * Arr.except(user, ['password']);
   * // → { id: 1, name: 'Alice' }
   * ```
   */
  static except<T extends DataObject>(target: T, keys: string[]): Partial<T> {
    const result: any = { ...target };

    for (const key of keys) {
      delete result[key];
    }

    return result;
  }

  /**
   * Pluck a single field from each item in an array of objects.
   *
   * Optionally key the result by another field.
   *
   * @param items - Array of objects
   * @param value - The field to extract
   * @param key   - Optional field to use as the result key
   * @returns An array of values, or a keyed object
   *
   * @example
   * ```typescript
   * const users = [
   *   { id: 1, name: 'Alice' },
   *   { id: 2, name: 'Bob' },
   * ];
   * Arr.pluck(users, 'name');        // ['Alice', 'Bob']
   * Arr.pluck(users, 'name', 'id');  // { 1: 'Alice', 2: 'Bob' }
   * ```
   */
  static pluck<T extends DataObject>(
    items: T[],
    value: string,
    key?: string,
  ): any[] | Record<string, any> {
    if (key) {
      const result: Record<string, any> = {};
      for (const item of items) {
        result[String(Arr.get(item, key))] = Arr.get(item, value);
      }
      return result;
    }

    return items.map((item) => Arr.get(item, value));
  }

  /**
   * Group an array of objects by a given key.
   *
   * @param items - Array of objects
   * @param key   - The field to group by
   * @returns An object where each key maps to an array of matching items
   *
   * @example
   * ```typescript
   * const items = [
   *   { type: 'fruit', name: 'apple' },
   *   { type: 'veggie', name: 'carrot' },
   *   { type: 'fruit', name: 'banana' },
   * ];
   * Arr.groupBy(items, 'type');
   * // → { fruit: [{...}, {...}], veggie: [{...}] }
   * ```
   */
  static groupBy<T extends DataObject>(items: T[], key: string): Record<string, T[]> {
    const result: Record<string, T[]> = {};

    for (const item of items) {
      const groupKey = String(Arr.get(item, key, ""));
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
    }

    return result;
  }

  /**
   * Key an array of objects by a given field.
   *
   * @param items - Array of objects
   * @param key   - The field to use as the key
   * @returns An object keyed by the specified field
   *
   * @example
   * ```typescript
   * const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
   * Arr.keyBy(users, 'id');
   * // → { 1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' } }
   * ```
   */
  static keyBy<T extends DataObject>(items: T[], key: string): Record<string, T> {
    const result: Record<string, T> = {};

    for (const item of items) {
      result[String(Arr.get(item, key))] = item;
    }

    return result;
  }

  // ── Array Helpers ───────────────────────────────────────────────────────

  /**
   * Return the first element that passes the given truth test.
   *
   * @typeParam T - The array element type
   * @param items    - The array to search
   * @param callback - Predicate function (optional — returns first element if omitted)
   * @param fallback - Value to return if no element passes
   * @returns The first matching element, or the fallback
   *
   * @example
   * ```typescript
   * Arr.first([1, 2, 3, 4], (n) => n > 2);  // 3
   * Arr.first([1, 2, 3]);                     // 1
   * Arr.first([], undefined, 'default');       // 'default'
   * ```
   */
  static first<T>(
    items: T[],
    callback?: (item: T, index: number) => boolean,
    fallback?: T,
  ): T | undefined {
    if (!callback) {
      return items.length > 0 ? items[0] : fallback;
    }

    for (let i = 0; i < items.length; i++) {
      if (callback(items[i]!, i)) {
        return items[i];
      }
    }

    return fallback;
  }

  /**
   * Return the last element that passes the given truth test.
   *
   * @typeParam T - The array element type
   * @param items    - The array to search
   * @param callback - Predicate function (optional — returns last element if omitted)
   * @param fallback - Value to return if no element passes
   * @returns The last matching element, or the fallback
   *
   * @example
   * ```typescript
   * Arr.last([1, 2, 3, 4], (n) => n < 3);  // 2
   * Arr.last([1, 2, 3]);                     // 3
   * ```
   */
  static last<T>(
    items: T[],
    callback?: (item: T, index: number) => boolean,
    fallback?: T,
  ): T | undefined {
    if (!callback) {
      return items.length > 0 ? items[items.length - 1] : fallback;
    }

    for (let i = items.length - 1; i >= 0; i--) {
      if (callback(items[i]!, i)) {
        return items[i];
      }
    }

    return fallback;
  }

  /**
   * Flatten a multi-dimensional array into a single level.
   *
   * @param items - The array to flatten
   * @param depth - Maximum recursion depth (default: `Infinity`)
   * @returns A new flat array
   *
   * @example
   * ```typescript
   * Arr.flatten([[1, 2], [3, [4, 5]]]);     // [1, 2, 3, 4, 5]
   * Arr.flatten([[1, [2]], [3, [4]]], 1);    // [1, 2, 3, [4]]
   * ```
   */
  static flatten<T = any>(items: any[], depth: number = Infinity): T[] {
    return items.flat(depth) as T[];
  }

  /**
   * Ensure the given value is an array.
   *
   * - Arrays are returned as-is
   * - `null` / `undefined` → empty array
   * - Everything else → wrapped in a single-element array
   *
   * @typeParam T - The element type
   * @param value - The value to wrap
   * @returns An array
   *
   * @example
   * ```typescript
   * Arr.wrap('hello');     // ['hello']
   * Arr.wrap([1, 2, 3]);  // [1, 2, 3]
   * Arr.wrap(null);        // []
   * Arr.wrap(undefined);   // []
   * ```
   */
  static wrap<T>(value: T | T[] | null | undefined): T[] {
    if (value === null || value === undefined) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  }

  /**
   * Return a random element from the array.
   *
   * @typeParam T - The element type
   * @param items  - The array to pick from
   * @param count  - Number of random elements to return (default: 1)
   * @returns A single element (when count=1) or an array of elements
   *
   * @example
   * ```typescript
   * Arr.random([1, 2, 3, 4, 5]);     // e.g., 3
   * Arr.random([1, 2, 3, 4, 5], 2);  // e.g., [1, 4]
   * ```
   */
  static random<T>(items: T[], count?: number): T | T[] {
    if (items.length === 0) {
      return count !== undefined ? [] : (undefined as unknown as T);
    }

    if (count !== undefined) {
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, items.length));
    }

    return items[Math.floor(Math.random() * items.length)]!;
  }

  /**
   * Shuffle the array using the Fisher-Yates algorithm.
   *
   * Returns a new array — the original is not mutated.
   *
   * @typeParam T - The element type
   * @param items - The array to shuffle
   * @returns A new shuffled array
   *
   * @example
   * ```typescript
   * Arr.shuffle([1, 2, 3, 4, 5]); // e.g., [3, 1, 5, 2, 4]
   * ```
   */
  static shuffle<T>(items: T[]): T[] {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j]!, result[i]!];
    }

    return result;
  }

  /**
   * Sort an array of objects by a given key.
   *
   * @param items     - Array of objects
   * @param key       - The field to sort by (supports dot notation)
   * @param direction - Sort direction: `'asc'` or `'desc'` (default: `'asc'`)
   * @returns A new sorted array
   *
   * @example
   * ```typescript
   * const users = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
   * Arr.sortBy(users, 'name');
   * // → [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]
   * ```
   */
  static sortBy<T extends DataObject>(
    items: T[],
    key: string,
    direction: "asc" | "desc" = "asc",
  ): T[] {
    const multiplier = direction === "asc" ? 1 : -1;

    return [...items].sort((a, b) => {
      const aVal = Arr.get(a, key);
      const bVal = Arr.get(b, key);

      if (aVal < bVal) return -1 * multiplier;
      if (aVal > bVal) return 1 * multiplier;
      return 0;
    });
  }

  /**
   * Remove duplicate values from an array.
   *
   * For arrays of objects, provide a key to deduplicate by.
   *
   * @param items - The array to deduplicate
   * @param key   - Optional field to compare objects by
   * @returns A new array with duplicates removed
   *
   * @example
   * ```typescript
   * Arr.unique([1, 2, 2, 3, 3, 3]);  // [1, 2, 3]
   *
   * const users = [{ id: 1, name: 'A' }, { id: 1, name: 'B' }];
   * Arr.unique(users, 'id');  // [{ id: 1, name: 'A' }]
   * ```
   */
  static unique<T>(items: T[], key?: string): T[] {
    if (!key) {
      return [...new Set(items)];
    }

    const seen = new Set<any>();
    return items.filter((item) => {
      const val = Arr.get(item as any, key);
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  }

  /**
   * Split an array into chunks of the given size.
   *
   * @param items - The array to chunk
   * @param size  - Maximum chunk size
   * @returns An array of chunks
   *
   * @example
   * ```typescript
   * Arr.chunk([1, 2, 3, 4, 5], 2);
   * // → [[1, 2], [3, 4], [5]]
   * ```
   */
  static chunk<T>(items: T[], size: number): T[][] {
    const result: T[][] = [];

    for (let i = 0; i < items.length; i += size) {
      result.push(items.slice(i, i + size));
    }

    return result;
  }

  /**
   * Create an object from separate arrays of keys and values.
   *
   * @param keys   - Array of keys
   * @param values - Array of values
   * @returns A new object mapping keys to values
   *
   * @example
   * ```typescript
   * Arr.combine(['name', 'age'], ['Alice', 30]);
   * // → { name: 'Alice', age: 30 }
   * ```
   */
  static combine<V>(keys: string[], values: V[]): Record<string, V> {
    const result: Record<string, V> = {};

    for (let i = 0; i < keys.length; i++) {
      result[keys[i]!] = values[i] as V;
    }

    return result;
  }

  /**
   * Determine if the given value is an array.
   *
   * @param value - The value to check
   * @returns `true` if the value is an array
   */
  static isArray(value: unknown): value is any[] {
    return Array.isArray(value);
  }

  /**
   * Determine if the given value is a plain object.
   *
   * @param value - The value to check
   * @returns `true` if the value is a plain object (not null, not array)
   */
  static isObject(value: unknown): value is DataObject {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  // ── Internal Utilities ──────────────────────────────────────────────────

  /**
   * Deep clone an object or array.
   *
   * Uses `structuredClone` when available, falls back to JSON
   * round-trip for environments that don't support it.
   *
   * @param value - The value to clone
   * @returns A deep copy of the value
   */
  private static deepClone<T>(value: T): T {
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
  }
}
