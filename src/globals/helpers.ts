/**
 * @fileoverview Built-in global helper functions.
 *
 * These are the Laravel-style helper functions that `@stackra/ts-support`
 * registers by default when `bootGlobals()` is called:
 *
 * | Helper                  | Description                                      |
 * |-------------------------|--------------------------------------------------|
 * | `env(key, fallback?)`   | Get an environment variable                      |
 * | `collect(items)`        | Create a Collection from an array                |
 * | `collectMap(entries)`   | Create a MapCollection                           |
 * | `collectSet(items)`     | Create a SetCollection                           |
 * | `value(val)`            | Resolve a value or call it if it's a function     |
 * | `tap(val, callback)`    | Call a callback with the value, then return it    |
 * | `filled(val)`           | Check if a value is "filled" (not empty/null)     |
 * | `blank(val)`            | Check if a value is "blank" (empty/null/undef)    |
 * | `retry(times, cb, ms)`  | Retry a callback N times with optional delay      |
 * | `sleep(ms)`             | Promise-based sleep                               |
 *
 * ## Usage
 *
 * ```typescript
 * import { bootGlobals } from '@stackra/ts-support';
 *
 * bootGlobals();
 *
 * // Now available globally
 * const name = env('APP_NAME', 'Stackra');
 * const items = collect([1, 2, 3]);
 * ```
 *
 * @module globals/helpers
 * @category Globals
 */

import { Env } from '@/env';
import { Collection, MapCollection, SetCollection } from '@/collections';
import { Str } from '@/str';
import { Stringable } from '@/str/stringable';

// ============================================================================
// Environment
// ============================================================================

/**
 * Get an environment variable with an optional default.
 *
 * Delegates to `Env.get()`. Supports automatic type coercion
 * when the fallback is a boolean or number.
 *
 * @param key      - Environment variable name
 * @param fallback - Default value if the variable is not set
 * @returns The environment value or the fallback
 *
 * @example
 * ```typescript
 * env('APP_NAME');              // string | undefined
 * env('APP_NAME', 'Stackra');   // 'Stackra' if not set
 * env('APP_DEBUG', false);      // boolean (auto-coerced)
 * env('APP_PORT', 3000);        // number (auto-coerced)
 * ```
 */
export function env<T extends string | number | boolean | undefined = undefined>(
  key: string,
  fallback?: T
): T extends boolean ? boolean : T extends number ? number : string | T {
  /* Boolean fallback → delegate to Env.boolean() */
  if (typeof fallback === 'boolean') {
    return Env.boolean(key, fallback) as any;
  }

  /* Number fallback → delegate to Env.number() */
  if (typeof fallback === 'number') {
    return Env.number(key, fallback) as any;
  }

  /* String / undefined fallback → delegate to Env.get() */
  return Env.get(key, fallback) as any;
}

// ============================================================================
// Collections
// ============================================================================

/**
 * Create a new Collection instance from an array.
 *
 * Shorthand for `new Collection(items)`.
 *
 * @typeParam T - The element type
 * @param items - Array of items (default: empty array)
 * @returns A new Collection instance
 *
 * @example
 * ```typescript
 * const numbers = collect([1, 2, 3, 4, 5]);
 * numbers.sum();     // 15
 * numbers.avg();     // 3
 * numbers.filter((n) => n > 2).all(); // [3, 4, 5]
 * ```
 */
export function _collect<T>(items: T[] = []): Collection<T> {
  return new Collection(items);
}

/**
 * Create a new MapCollection from entries or a record.
 *
 * Shorthand for `new MapCollection(entries)`.
 *
 * @typeParam K - The key type
 * @typeParam V - The value type
 * @param entries - Iterable of [key, value] pairs or a plain object
 * @returns A new MapCollection instance
 *
 * @example
 * ```typescript
 * const map = collectMap({ name: 'Alice', age: '30' });
 * map.get('name'); // 'Alice'
 * ```
 */
export function _collectMap<K, V>(
  entries?: Iterable<[K, V]> | Record<string, V>
): MapCollection<K, V> {
  return new MapCollection(entries);
}

/**
 * Create a new SetCollection from an iterable.
 *
 * Shorthand for `new SetCollection(items)`.
 *
 * @typeParam T - The element type
 * @param items - Iterable of items
 * @returns A new SetCollection instance
 *
 * @example
 * ```typescript
 * const set = collectSet([1, 2, 2, 3]);
 * set.count(); // 3 (duplicates removed)
 * ```
 */
export function _collectSet<T>(items?: Iterable<T>): SetCollection<T> {
  return new SetCollection(items);
}

// ============================================================================
// Value Helpers
// ============================================================================

/**
 * Resolve a value — if it's a function, call it and return the result.
 *
 * Useful for lazy evaluation of defaults and config values.
 *
 * @typeParam T - The resolved value type
 * @param val  - A value or a function that returns a value
 * @param args - Arguments to pass if `val` is a function
 * @returns The resolved value
 *
 * @example
 * ```typescript
 * value('hello');           // 'hello'
 * value(() => 'hello');     // 'hello'
 * value((x) => x * 2, 5);  // 10
 * ```
 */
export function value<T>(val: T | ((...args: any[]) => T), ...args: any[]): T {
  return typeof val === 'function' ? (val as (...a: any[]) => T)(...args) : val;
}

/**
 * String manipulation helper with dual interface.
 *
 * **Without arguments**: Returns the Str utility class for static methods
 * ```typescript
 * str().camel('hello-world')  // 'helloWorld'
 * str().snake('HelloWorld')   // 'hello_world'
 * ```
 *
 * **With a string argument**: Returns a fluent Stringable wrapper for chaining
 * ```typescript
 * str('hello-world').camel().ucfirst().toString()  // 'HelloWorld'
 * str('foo_bar').studly().lower().toString()       // 'foobar'
 * ```
 *
 * @param value - Optional string to wrap in a Stringable instance
 * @returns The Str class (no args) or a Stringable instance (with args)
 *
 * @example
 * ```typescript
 * // Static usage
 * str().camel('hello-world');      // 'helloWorld'
 * str().kebab('HelloWorld');       // 'hello-world'
 *
 * // Fluent usage
 * str('hello-world').camel();      // Stringable('helloWorld')
 * str('hello').upper().toString(); // 'HELLO'
 * ```
 */
export function str(): typeof Str;
export function str(value: string): Stringable;
export function str(value?: string): typeof Str | Stringable {
  if (value === undefined) {
    return Str;
  }
  return new Stringable(value);
}

/**
 * Call a callback with the given value, then return the value.
 *
 * Useful for performing side effects in a pipeline without
 * breaking the chain.
 *
 * @typeParam T - The value type
 * @param val      - The value to pass to the callback
 * @param callback - Function to call with the value
 * @returns The original value (unchanged)
 *
 * @example
 * ```typescript
 * const user = tap(createUser(), (user) => {
 *   sendWelcomeEmail(user);
 *   logActivity('user.created', user.id);
 * });
 * // user is the return value of createUser(), not the callback
 * ```
 */
export function tap<T>(val: T, callback: (val: T) => void): T {
  callback(val);
  return val;
}

// ============================================================================
// Inspection Helpers
// ============================================================================

/**
 * Determine if a value is "filled" (not blank).
 *
 * A value is considered filled if it is not:
 * - `null` or `undefined`
 * - An empty string or whitespace-only string
 * - An empty array
 * - An empty object `{}`
 *
 * @param val - The value to check
 * @returns `true` if the value is filled
 *
 * @example
 * ```typescript
 * filled('hello');   // true
 * filled(0);         // true (0 is a valid value)
 * filled(false);     // true (false is a valid value)
 * filled('');        // false
 * filled(null);      // false
 * filled([]);        // false
 * filled({});        // false
 * ```
 */
export function filled(val: unknown): boolean {
  return !blank(val);
}

/**
 * Determine if a value is "blank" (empty, null, or undefined).
 *
 * A value is considered blank if it is:
 * - `null` or `undefined`
 * - An empty string or whitespace-only string
 * - An empty array
 * - An empty object `{}`
 *
 * Note: `0`, `false`, and `NaN` are **not** blank — they are valid values.
 *
 * @param val - The value to check
 * @returns `true` if the value is blank
 *
 * @example
 * ```typescript
 * blank(null);       // true
 * blank(undefined);  // true
 * blank('');         // true
 * blank('   ');      // true
 * blank([]);         // true
 * blank({});         // true
 * blank(0);          // false
 * blank(false);      // false
 * ```
 */
export function blank(val: unknown): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string') return val.trim().length === 0;
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === 'object') return Object.keys(val).length === 0;
  return false;
}

// ============================================================================
// Async Helpers
// ============================================================================

/**
 * Retry a callback a given number of times.
 *
 * If the callback throws, it is retried up to `times` attempts.
 * An optional delay (in milliseconds) is applied between retries.
 * Supports both sync and async callbacks.
 *
 * @typeParam T - The return type of the callback
 * @param times    - Maximum number of attempts
 * @param callback - The function to retry (receives the attempt number, 1-indexed)
 * @param delayMs  - Milliseconds to wait between retries (default: `0`)
 * @returns The callback's return value on success
 * @throws The last error if all attempts fail
 *
 * @example
 * ```typescript
 * // Retry an API call up to 3 times with 1s delay
 * const data = await retry(3, async (attempt) => {
 *   console.log(`Attempt ${attempt}...`);
 *   return await fetchData();
 * }, 1000);
 * ```
 */
export async function retry<T>(
  times: number,
  callback: (attempt: number) => T | Promise<T>,
  delayMs: number = 0
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= times; attempt++) {
    try {
      return await callback(attempt);
    } catch (error) {
      lastError = error;

      if (attempt < times && delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}

/**
 * Promise-based sleep / delay.
 *
 * @param ms - Milliseconds to sleep
 * @returns A promise that resolves after the specified delay
 *
 * @example
 * ```typescript
 * await sleep(1000); // wait 1 second
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
