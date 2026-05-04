/**
 * @fileoverview Global type declarations for @stackra/ts-support.
 *
 * Provides TypeScript declarations for all global helper functions
 * registered by `bootGlobals()`. Add this to your `tsconfig.json`
 * to get full IntelliSense for global helpers:
 *
 * ```json
 * {
 *   "compilerOptions": {
 *     "types": ["@stackra/ts-support/@types"]
 *   }
 * }
 * ```
 *
 * ## How It Works
 *
 * These declarations augment the global scope via `declare global`.
 * They only provide **types** — the actual functions are installed
 * at runtime by `bootGlobals()`.
 *
 * ## Extending
 *
 * Other `@stackra/*` packages can add their own global declarations
 * by creating a similar `@types/index.d.ts` file that augments the
 * global scope. For example:
 *
 * ```typescript
 * // In @stackra/ts-cache/@types/index.d.ts
 * import type { CacheStore } from '@stackra/ts-cache';
 *
 * declare global {
 *   function cache(store?: string): CacheStore;
 * }
 * ```
 *
 * @module @stackra/ts-support/@types
 */

import type { Collection, MapCollection, SetCollection, Str, Stringable } from '@stackra/ts-support';

declare global {
  // ════════════════════════════════════════════════════════════════════════
  // Environment
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Get an environment variable with optional default and type coercion.
   *
   * - String fallback → returns `string`
   * - Boolean fallback → auto-coerces to `boolean`
   * - Number fallback → auto-coerces to `number`
   * - No fallback → returns `string | undefined`
   *
   * @param key      - Environment variable name (e.g., `'APP_NAME'`)
   * @param fallback - Default value if the variable is not set
   * @returns The environment value, coerced to match the fallback type
   *
   * @example
   * ```typescript
   * env('APP_NAME');              // string | undefined
   * env('APP_NAME', 'Stackra');   // string
   * env('APP_DEBUG', false);      // boolean
   * env('APP_PORT', 3000);        // number
   * ```
   */
  function env<T extends string | number | boolean | undefined = undefined>(
    key: string,
    fallback?: T
  ): T extends boolean ? boolean : T extends number ? number : string | T;

  // ════════════════════════════════════════════════════════════════════════
  // Collections
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Create a new Collection instance from an array.
   *
   * @typeParam T - The element type
   * @param items - Array of items (default: empty array)
   * @returns A new Collection instance with chainable methods
   *
   * @example
   * ```typescript
   * collect([1, 2, 3, 4, 5]).sum();           // 15
   * collect(users).pluck('name').all();        // ['Alice', 'Bob']
   * collect([3, 1, 2]).sort().all();           // [1, 2, 3]
   * ```
   */
  function collect<T>(items?: T[]): Collection<T>;

  /**
   * Create a new MapCollection from entries or a plain object.
   *
   * @typeParam K - The key type
   * @typeParam V - The value type
   * @param entries - Iterable of [key, value] pairs or a Record
   * @returns A new MapCollection instance
   *
   * @example
   * ```typescript
   * collectMap({ name: 'Alice', role: 'admin' }).get('name'); // 'Alice'
   * collectMap([['a', 1], ['b', 2]]).count();                 // 2
   * ```
   */
  function collectMap<K, V>(entries?: Iterable<[K, V]> | Record<string, V>): MapCollection<K, V>;

  /**
   * Create a new SetCollection from an iterable.
   *
   * @typeParam T - The element type
   * @param items - Iterable of items
   * @returns A new SetCollection instance (duplicates removed)
   *
   * @example
   * ```typescript
   * collectSet([1, 2, 2, 3]).count(); // 3
   * collectSet(['a', 'b']).has('a');  // true
   * ```
   */
  function collectSet<T>(items?: Iterable<T>): SetCollection<T>;

  // ════════════════════════════════════════════════════════════════════════
  // Value Helpers
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Resolve a value — if it's a function, call it and return the result.
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
  function value<T>(val: T | ((...args: any[]) => T), ...args: any[]): T;

  /**
   * Convert any value to a string representation.
   *
   * Handles various types intelligently:
   * - Primitives → string conversion
   * - Objects/Arrays → JSON.stringify
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
  function str(): typeof Str;
  function str(value: string): Stringable;

  /**
   * Call a callback with the given value for side effects, then return the value.
   *
   * @typeParam T - The value type
   * @param val      - The value to pass to the callback
   * @param callback - Function to call with the value
   * @returns The original value (unchanged)
   *
   * @example
   * ```typescript
   * const user = tap(createUser(), (u) => sendWelcomeEmail(u));
   * ```
   */
  function tap<T>(val: T, callback: (val: T) => void): T;

  // ════════════════════════════════════════════════════════════════════════
  // Inspection Helpers
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Check if a value is "filled" (not blank).
   *
   * Returns `true` for any value that is not null, undefined,
   * empty string, whitespace-only string, empty array, or empty object.
   * Note: `0` and `false` are considered filled.
   *
   * @param val - The value to check
   * @returns `true` if the value is filled
   *
   * @example
   * ```typescript
   * filled('hello');  // true
   * filled(0);        // true
   * filled('');       // false
   * filled(null);     // false
   * ```
   */
  function filled(val: unknown): boolean;

  /**
   * Check if a value is "blank" (empty, null, or undefined).
   *
   * Returns `true` for null, undefined, empty/whitespace strings,
   * empty arrays, and empty objects. `0` and `false` are NOT blank.
   *
   * @param val - The value to check
   * @returns `true` if the value is blank
   *
   * @example
   * ```typescript
   * blank(null);   // true
   * blank('');     // true
   * blank([]);     // true
   * blank(0);      // false
   * ```
   */
  function blank(val: unknown): boolean;

  // ════════════════════════════════════════════════════════════════════════
  // Async Helpers
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Retry a callback a given number of times with optional delay.
   *
   * @typeParam T - The return type of the callback
   * @param times    - Maximum number of attempts
   * @param callback - The function to retry (receives attempt number, 1-indexed)
   * @param delayMs  - Milliseconds to wait between retries (default: 0)
   * @returns The callback's return value on success
   * @throws The last error if all attempts fail
   *
   * @example
   * ```typescript
   * const data = await retry(3, () => fetchData(), 1000);
   * ```
   */
  function retry<T>(
    times: number,
    callback: (attempt: number) => T | Promise<T>,
    delayMs?: number
  ): Promise<T>;

  /**
   * Promise-based sleep / delay.
   *
   * @param ms - Milliseconds to sleep
   * @returns A promise that resolves after the delay
   *
   * @example
   * ```typescript
   * await sleep(1000); // wait 1 second
   * ```
   */
  function sleep(ms: number): Promise<void>;
}

export {};
