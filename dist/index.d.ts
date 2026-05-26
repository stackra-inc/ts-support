export { Collection as CollectJsCollection } from 'collect.js';
import { IResolver, ITransformer } from '@stackra/contracts';
export { AsyncDebouncer, AsyncQueuer, AsyncRateLimiter, AsyncThrottler, Debouncer, Queuer, RateLimiter, Throttler, asyncDebounce, asyncQueue, asyncRateLimit, asyncThrottle, debounce, queue, rateLimit, throttle } from '@tanstack/pacer';

/**
 * @fileoverview Environment variable access — Laravel-style `env()` helper.
 *
 * Provides a type-safe, centralized way to read environment variables with
 * automatic type coercion, default values, and required-variable enforcement.
 *
 * Supports multiple runtime environments:
 *   - **Vite** — reads from `import.meta.env`
 *   - **Node.js** — reads from `process.env`
 *   - **Custom** — any `Record<string, string | undefined>` repository
 *
 * ## Laravel Parity
 *
 * | Laravel                        | Stackra                              |
 * |--------------------------------|--------------------------------------|
 * | `env('APP_DEBUG')`             | `Env.get('APP_DEBUG')`               |
 * | `env('APP_DEBUG', false)`      | `Env.get('APP_DEBUG', false)`        |
 * | `env('APP_KEY') ?? abort()`    | `Env.getOrFail('APP_KEY')`           |
 * | N/A                            | `Env.string('APP_NAME', 'Stackra')`  |
 * | N/A                            | `Env.boolean('APP_DEBUG', false)`    |
 * | N/A                            | `Env.number('APP_PORT', 3000)`       |
 *
 * @module env/env
 * @category Environment
 */
/**
 * Supported primitive types that `env()` can coerce values into.
 *
 * - `string`  — raw value, no coercion
 * - `number`  — parsed via `Number()`, NaN falls back to default
 * - `boolean` — `'true'`, `'1'`, `'yes'`, `'on'` → `true`; everything else → `false`
 */
type EnvValue$1 = string | number | boolean | undefined;
/**
 * A repository of environment variables.
 *
 * Can be `process.env`, `import.meta.env`, or any custom record.
 * The Env class reads from this repository when resolving values.
 */
type EnvRepository = Record<string, string | undefined>;
/**
 * Laravel-style environment variable accessor.
 *
 * Reads from a configurable repository (defaults to `process.env`) and
 * provides typed getters with automatic coercion and sensible defaults.
 *
 * The class is fully static — no instantiation needed. Call `Env.get()`,
 * `Env.string()`, `Env.boolean()`, or `Env.number()` directly.
 *
 * ## Custom Repository
 *
 * By default, `Env` reads from `process.env`. In Vite projects you may
 * want to point it at `import.meta.env` instead:
 *
 * ```typescript
 * Env.setRepository(import.meta.env);
 * ```
 *
 * Or provide a completely custom source:
 *
 * ```typescript
 * Env.setRepository({ APP_NAME: 'MyApp', APP_DEBUG: 'true' });
 * ```
 *
 * @example
 * ```typescript
 * import { Env } from '@stackra/ts-support';
 *
 * // Basic usage — returns string | undefined
 * const appName = Env.get('APP_NAME');
 *
 * // With default — returns string
 * const appName = Env.get('APP_NAME', 'Stackra');
 *
 * // Typed getters
 * const debug = Env.boolean('APP_DEBUG', false);
 * const port  = Env.number('APP_PORT', 3000);
 * const name  = Env.string('APP_NAME', 'Stackra');
 *
 * // Required — throws if missing
 * const secret = Env.getOrFail('APP_SECRET');
 * ```
 */
declare class Env {
    /**
     * The active environment variable repository.
     *
     * Defaults to `null` (lazy-initialized on first access).
     * Override via `Env.setRepository()` for custom sources.
     */
    private static _repository;
    /**
     * Get the current repository, initializing lazily on first access.
     */
    private static get repository();
    /**
     * Set the repository directly.
     */
    private static set repository(value);
    /**
     * Auto-detect the best available environment repository.
     *
     * Detection order:
     * 1. **Vite** — `import.meta.env` (browser and SSR builds)
     * 2. **Node.js / Bun / Deno** — `process.env`
     * 3. **Fallback** — empty object
     *
     * Vite is checked first because in SSR mode both `import.meta.env`
     * and `process.env` are available, but Vite's env contains the
     * `VITE_*` variables that application code expects.
     *
     * @returns The detected environment repository
     */
    private static detectRepository;
    /**
     * Replace the environment repository.
     *
     * Call this once during application bootstrap to point Env at the
     * correct source. Common use cases:
     *
     * - **Vite**: `Env.setRepository(import.meta.env)`
     * - **Testing**: `Env.setRepository({ APP_DEBUG: 'true' })`
     *
     * @param repo - The new environment variable source
     *
     * @example
     * ```typescript
     * // In your Vite app's main.ts
     * import { Env } from '@stackra/ts-support';
     * Env.setRepository(import.meta.env);
     * ```
     */
    static setRepository(repo: EnvRepository): void;
    /**
     * Get the current environment repository.
     *
     * Useful for debugging or passing the repository to other systems.
     *
     * @returns The active environment variable source
     */
    static getRepository(): EnvRepository;
    /**
     * Get an environment variable value with optional default.
     *
     * Returns the raw string value from the repository. If the variable
     * is not set (or is a null-like value such as `'(null)'`), returns
     * the provided default.
     *
     * @typeParam T - The type of the default value
     * @param key      - Environment variable name (e.g., `'APP_NAME'`)
     * @param fallback - Value to return if the variable is not set
     * @returns The environment value or the fallback
     *
     * @example
     * ```typescript
     * Env.get('APP_NAME');              // string | undefined
     * Env.get('APP_NAME', 'Stackra');   // string
     * Env.get('APP_DEBUG', false);      // string | false
     * ```
     */
    static get<T extends EnvValue$1 = undefined>(key: string, fallback?: T): string | T;
    /**
     * Get an environment variable or throw if it's missing.
     *
     * Use this for variables that are absolutely required for the
     * application to function (e.g., API keys, database URLs).
     *
     * @param key - Environment variable name
     * @returns The environment value as a string
     * @throws {Error} If the variable is not set or is a null-like value
     *
     * @example
     * ```typescript
     * const secret = Env.getOrFail('APP_SECRET');
     * // Throws: "Environment variable "APP_SECRET" is required but not set."
     * ```
     */
    static getOrFail(key: string): string;
    /**
     * Get an environment variable as a string.
     *
     * Identical to `Env.get()` but makes the intent explicit and
     * guarantees a string return type when a default is provided.
     *
     * @param key      - Environment variable name
     * @param fallback - Default string value
     * @returns The environment value as a string
     *
     * @example
     * ```typescript
     * const name = Env.string('APP_NAME', 'Stackra'); // always string
     * ```
     */
    static string(key: string, fallback: string): string;
    static string(key: string): string | undefined;
    /**
     * Get an environment variable as a boolean.
     *
     * Coercion rules:
     * - `'true'`, `'1'`, `'yes'`, `'on'` → `true`
     * - `'false'`, `'0'`, `'no'`, `'off'`, `''` → `false`
     * - Not set → `fallback`
     *
     * @param key      - Environment variable name
     * @param fallback - Default boolean value
     * @returns The coerced boolean value
     *
     * @example
     * ```typescript
     * const debug = Env.boolean('APP_DEBUG', false);
     * const verbose = Env.boolean('VERBOSE'); // boolean | undefined
     * ```
     */
    static boolean(key: string, fallback: boolean): boolean;
    static boolean(key: string): boolean | undefined;
    /**
     * Get an environment variable as a number.
     *
     * Parses the raw string via `Number()`. If the result is `NaN`,
     * returns the fallback instead.
     *
     * @param key      - Environment variable name
     * @param fallback - Default numeric value
     * @returns The parsed number or the fallback
     *
     * @example
     * ```typescript
     * const port = Env.number('APP_PORT', 3000);
     * const workers = Env.number('WORKERS'); // number | undefined
     * ```
     */
    static number(key: string, fallback: number): number;
    static number(key: string): number | undefined;
    /**
     * Get an environment variable as an array.
     *
     * Splits the raw string by the given separator (default: `','`).
     * Each element is trimmed of whitespace. Empty strings are removed.
     *
     * @param key       - Environment variable name
     * @param separator - Delimiter to split on (default: `','`)
     * @param fallback  - Default array value
     * @returns The parsed array or the fallback
     *
     * @example
     * ```typescript
     * // ALLOWED_ORIGINS=http://localhost:3000,https://example.com
     * const origins = Env.array('ALLOWED_ORIGINS');
     * // → ['http://localhost:3000', 'https://example.com']
     *
     * // With custom separator
     * // FEATURES=auth|cache|events
     * const features = Env.array('FEATURES', '|');
     * // → ['auth', 'cache', 'events']
     * ```
     */
    static array(key: string, separator?: string, fallback?: string[]): string[];
    static array(key: string, separator?: string): string[] | undefined;
    /**
     * Check whether an environment variable is set and non-empty.
     *
     * Returns `false` for undefined, empty string, and null-like values.
     *
     * @param key - Environment variable name
     * @returns `true` if the variable has a meaningful value
     *
     * @example
     * ```typescript
     * if (Env.has('DATABASE_URL')) {
     *   // safe to connect
     * }
     * ```
     */
    static has(key: string): boolean;
    /**
     * Check whether an environment variable is missing or empty.
     *
     * Inverse of `Env.has()`.
     *
     * @param key - Environment variable name
     * @returns `true` if the variable is not set or is a null-like value
     *
     * @example
     * ```typescript
     * if (Env.missing('REDIS_URL')) {
     *   logger.warn('Redis not configured — using memory cache');
     * }
     * ```
     */
    static missing(key: string): boolean;
    /**
     * Check if the current environment matches the given name.
     *
     * Reads from `APP_ENV` (or `NODE_ENV` as fallback). Comparison
     * is case-insensitive.
     *
     * @param name - Environment name to check (e.g., `'production'`)
     * @returns `true` if the current environment matches
     *
     * @example
     * ```typescript
     * if (Env.is('production')) {
     *   // enable caching, disable debug
     * }
     * ```
     */
    static is(name: string): boolean;
    /**
     * Check if the application is running in production.
     *
     * Shorthand for `Env.is('production')`.
     *
     * @returns `true` if `APP_ENV` or `NODE_ENV` is `'production'`
     */
    static isProduction(): boolean;
    /**
     * Check if the application is running in a local/development environment.
     *
     * Returns `true` for `'local'`, `'development'`, or `'dev'`.
     *
     * @returns `true` if the environment is local/development
     */
    static isLocal(): boolean;
    /**
     * Check if the application is running in a testing environment.
     *
     * Returns `true` for `'testing'` or `'test'`.
     *
     * @returns `true` if the environment is testing
     */
    static isTesting(): boolean;
    /**
     * Strip surrounding single or double quotes from a value.
     *
     * Many `.env` parsers leave quotes intact. This method removes them
     * so `'"my-value"'` becomes `'my-value'`.
     *
     * @param value - Raw environment variable value
     * @returns The value without surrounding quotes
     */
    private static stripQuotes;
}

/**
 * Standalone env() Helper
 *
 * A convenience function that wraps `Env.get()` for use with the
 * auto-import plugin. Provides the same API as the `Env.get()` static
 * method but as a standalone function call.
 *
 * @module env/env-helper
 *
 * @example
 * ```typescript
 * // Auto-imported — no explicit import needed
 * const appName = env("VITE_APP_NAME", "My App");
 * const timeout = env("VITE_TIMEOUT", 5000);
 * const debug = env("VITE_DEBUG", false);
 * ```
 */
/**
 * Allowed fallback value types for environment variable access.
 */
type EnvValue = string | number | boolean | undefined;
/**
 * Infer the return type based on the fallback value type.
 *
 * - If fallback is `number`, the env value is coerced to `number`
 * - If fallback is `boolean`, the env value is coerced to `boolean`
 * - If fallback is `string` or `undefined`, returns `string | T`
 */
type EnvReturn<T extends EnvValue> = T extends number ? number : T extends boolean ? boolean : string | T;
/**
 * Get an environment variable value with an optional fallback.
 *
 * Delegates to `Env.get()` — reads from the repository configured
 * via `Env.setRepository()` (typically `import.meta.env` in Vite apps).
 *
 * When the fallback is a `number`, the raw string value is automatically
 * coerced via `Number()`. When the fallback is a `boolean`, the value is
 * coerced using truthy/falsy string matching (`'true'`, `'1'`, `'yes'` → `true`).
 *
 * @typeParam T - The fallback value type (inferred from the default)
 * @param key - The environment variable name (e.g. `'VITE_APP_NAME'`)
 * @param fallback - Default value returned when the variable is not set
 * @returns The variable's value coerced to match the fallback type
 *
 * @example
 * ```typescript
 * env("VITE_API_URL", "https://api.example.com");  // string
 * env("VITE_PORT", 3000);                          // number
 * env("VITE_DEBUG", false);                        // boolean
 * env("VITE_SECRET");                              // string | undefined
 * ```
 */
declare function env<T extends EnvValue = undefined>(key: string, fallback?: T): EnvReturn<T>;

/**
 * @fileoverview Laravel-style string manipulation class.
 *
 * Provides 70+ static methods for common string operations including
 * case conversion, searching, padding, truncation, encoding, and more.
 *
 * All methods are pure — they return new strings without side effects.
 *
 * ## Laravel Parity
 *
 * | Laravel                          | Stackra                          |
 * |----------------------------------|----------------------------------|
 * | `Str::after($str, $search)`      | `Str.after(str, search)`         |
 * | `Str::camel($str)`               | `Str.camel(str)`                 |
 * | `Str::contains($str, $needle)`   | `Str.contains(str, needle)`      |
 * | `Str::kebab($str)`               | `Str.kebab(str)`                 |
 * | `Str::slug($str)`                | `Str.slug(str)`                  |
 * | `Str::snake($str)`               | `Str.snake(str)`                 |
 * | `Str::studly($str)`              | `Str.studly(str)`                |
 * | `Str::limit($str, $limit)`       | `Str.limit(str, limit)`          |
 *
 * @module str/str
 * @category Strings
 */
/**
 * Laravel-style string manipulation class.
 *
 * All methods are static and pure — no side effects, no mutations.
 * Use this class instead of native string methods throughout the monorepo.
 *
 * @example
 * ```typescript
 * import { Str } from '@stackra/ts-support';
 *
 * Str.camel('hello-world');       // 'helloWorld'
 * Str.kebab('helloWorld');        // 'hello-world'
 * Str.contains('hello', 'ell');   // true
 * Str.limit('long text...', 8);   // 'long tex...'
 * Str.slug('Hello World!');       // 'hello-world'
 * ```
 */
declare class Str {
    /**
     * Return the remainder of a string after the first occurrence of a given value.
     *
     * @param subject - The string to search in
     * @param search  - The value to search for
     * @returns The portion of the string after the first occurrence of search
     *
     * @example
     * ```typescript
     * Str.after('hello world', 'hello '); // 'world'
     * Str.after('a.b.c', '.');            // 'b.c'
     * ```
     */
    static after(subject: string, search: string): string;
    /**
     * Return the remainder of a string after the last occurrence of a given value
     */
    static afterLast(subject: string, search: string): string;
    /**
     * Convert a string to title case following APA guidelines
     */
    static apa(value: string): string;
    /**
     * Transliterate a UTF-8 value to ASCII
     */
    static ascii(value: string): string;
    /**
     * Get the portion of a string before the first occurrence of a given value
     */
    static before(subject: string, search: string): string;
    /**
     * Get the portion of a string before the last occurrence of a given value
     */
    static beforeLast(subject: string, search: string): string;
    /**
     * Get the portion of a string between two values
     */
    static between(subject: string, from: string, to: string): string;
    /**
     * Get the smallest possible portion of a string between two values
     */
    static betweenFirst(subject: string, from: string, to: string): string;
    /**
     * Convert a string to camelCase.
     *
     * Handles word boundaries from separators (`-`, `_`, space) and from
     * consecutive uppercase runs (e.g. `XML_HTTP_REQUEST` → `xmlHttpRequest`).
     *
     * @param value - The input string
     * @returns The camelCase string
     *
     * @example
     * ```typescript
     * Str.camel('foo_bar');           // 'fooBar'
     * Str.camel('foo-bar baz');        // 'fooBarBaz'
     * Str.camel('XML_HTTP_REQUEST');  // 'xmlHttpRequest'
     * ```
     */
    static camel(value: string): string;
    /**
     * Get the character at the specified index
     */
    static charAt(subject: string, index: number): string | false;
    /**
     * Remove the first occurrence of the given value from the start of the string
     */
    static chopStart(subject: string, search: string | string[]): string;
    /**
     * Remove the last occurrence of the given value from the end of the string
     */
    static chopEnd(subject: string, search: string | string[]): string;
    /**
     * Determine if a given string contains a given substring
     */
    static contains(haystack: string, needles: string | string[], ignoreCase?: boolean): boolean;
    /**
     * Determine if a given string contains all array values
     */
    static containsAll(haystack: string, needles: string[], ignoreCase?: boolean): boolean;
    /**
     * Determine if a given string doesn't contain a given substring
     */
    static doesntContain(haystack: string, needles: string | string[], ignoreCase?: boolean): boolean;
    /**
     * Replace consecutive instances of a character with a single instance
     */
    static deduplicate(value: string, character?: string): string;
    /**
     * Determine if a given string ends with a given substring
     */
    static endsWith(haystack: string, needles: string | string[]): boolean;
    /**
     * Extract an excerpt from text that matches the first instance of a phrase
     */
    static excerpt(text: string, phrase: string, options?: {
        radius?: number;
        omission?: string;
    }): string;
    /**
     * Cap a string with a single instance of a given value
     */
    static finish(value: string, cap: string): string;
    /**
     * Convert a string to headline case
     */
    static headline(value: string): string;
    /**
     * Determine if a given string matches a given pattern
     */
    static is(pattern: string, value: string, ignoreCase?: boolean): boolean;
    /**
     * Determine if a given string is 7-bit ASCII
     */
    static isAscii(value: string): boolean;
    /**
     * Determine if a given string is valid JSON
     */
    static isJson(value: string): boolean;
    /**
     * Determine if a given string is a valid URL
     */
    static isUrl(value: string, protocols?: string[]): boolean;
    /**
     * Determine if a given string is a valid ULID
     */
    static isUlid(value: string): boolean;
    /**
     * Determine if a given string is a valid UUID
     */
    static isUuid(value: string): boolean;
    /**
     * Convert a string to kebab-case
     */
    static kebab(value: string): string;
    /**
     * Return the given string with the first character lowercased
     */
    static lcfirst(value: string): string;
    /**
     * Return the length of the given string
     */
    static len(value: string): number;
    /**
     * Limit the number of characters in a string
     */
    static limit(value: string, limit?: number, end?: string, preserveWords?: boolean): string;
    /**
     * Convert the given string to lowercase
     */
    static lower(value: string): string;
    /**
     * Masks a portion of a string with a repeated character
     */
    static mask(value: string, character: string, index: number, length?: number): string;
    /**
     * Pad both sides of a string with another
     */
    static padBoth(value: string, length: number, pad?: string): string;
    /**
     * Pad the left side of a string with another
     */
    static padLeft(value: string, length: number, pad?: string): string;
    /**
     * Pad the right side of a string with another
     */
    static padRight(value: string, length: number, pad?: string): string;
    /**
     * Get the plural form of an English word
     */
    static plural(value: string, count?: number): string;
    /**
     * Pluralize the last word of an English, studly caps case string
     */
    static pluralStudly(value: string, count?: number): string;
    /**
     * Find the position of the first occurrence of a substring
     */
    static position(haystack: string, needle: string): number | false;
    /**
     * Generate a random string
     */
    static random(length?: number): string;
    /**
     * Remove the given value from the string
     */
    static remove(search: string | string[], subject: string, caseSensitive?: boolean): string;
    /**
     * Repeat the given string
     */
    static repeat(value: string, times: number): string;
    /**
     * Replace the given value in the given string
     */
    static replace(search: string, replace: string, subject: string, caseSensitive?: boolean): string;
    /**
     * Replace a given value in the string sequentially with an array
     */
    static replaceArray(search: string, replacements: string[], subject: string): string;
    /**
     * Replace the first occurrence of a given value in the string
     */
    static replaceFirst(search: string, replace: string, subject: string): string;
    /**
     * Replace the last occurrence of a given value in the string
     */
    static replaceLast(search: string, replace: string, subject: string): string;
    /**
     * Replace the first occurrence only if it appears at the start
     */
    static replaceStart(search: string, replace: string, subject: string): string;
    /**
     * Replace the last occurrence only if it appears at the end
     */
    static replaceEnd(search: string, replace: string, subject: string): string;
    /**
     * Reverse the given string
     */
    static reverse(value: string): string;
    /**
     * Get the singular form of an English word
     */
    static singular(value: string): string;
    /**
     * Generate a URL friendly slug
     */
    static slug(value: string, separator?: string): string;
    /**
     * Convert a string to snake_case.
     *
     * Handles word boundaries from separators (`-`, `_`, space) and from
     * uppercase boundaries (camelCase or consecutive-uppercase runs).
     *
     * @param value     - The input string
     * @param delimiter - Word delimiter (default: `'_'`)
     * @returns The snake_case string
     *
     * @example
     * ```typescript
     * Str.snake('camelCase');     // 'camel_case'
     * Str.snake('HTMLParser');    // 'html_parser'
     * Str.snake('foo bar baz');    // 'foo_bar_baz'
     * ```
     */
    static snake(value: string, delimiter?: string): string;
    /**
     * Remove all extraneous whitespace
     */
    static squish(value: string): string;
    /**
     * Begin a string with a single instance of a given value
     */
    static start(value: string, prefix: string): string;
    /**
     * Determine if a given string starts with a given substring
     */
    static startsWith(haystack: string, needles: string | string[]): boolean;
    /**
     * Convert a value to StudlyCase (a.k.a. PascalCase).
     *
     * Splits the input into words on separators (`-`, `_`, space) and on
     * uppercase boundaries (camelCase or consecutive-uppercase runs), then
     * joins each word with its first letter capitalized and the rest
     * lowercased.
     *
     * @param value - The input string
     * @returns The StudlyCase string
     *
     * @example
     * ```typescript
     * Str.studly('hello_world');           // 'HelloWorld'
     * Str.studly('hello-world foo bar');    // 'HelloWorldFooBar'
     * Str.studly('XML_HTTP_REQUEST');      // 'XmlHttpRequest'
     * Str.studly('camelCase');              // 'CamelCase'
     * ```
     */
    static studly(value: string): string;
    /**
     * Split a string into word tokens.
     *
     * Splits on `-`, `_`, whitespace, and on uppercase boundaries. Treats
     * consecutive uppercase letters followed by a lowercase letter as the
     * end of an uppercase run (so `XMLHttp` → `['XML', 'Http']`).
     *
     * @param value - The input string
     * @returns Array of word tokens (lowercased boundaries preserved)
     *
     * @internal Used by `camel`, `studly`, `kebab`, `snake`, etc.
     */
    static splitWords(value: string): string[];
    /**
     * Returns the portion of string specified by the start and length parameters
     */
    static substr(value: string, start: number, length?: number): string;
    /**
     * Returns the number of substring occurrences
     */
    static substrCount(haystack: string, needle: string): number;
    /**
     * Replace text within a portion of a string
     */
    static substrReplace(value: string, replace: string, start: number, length?: number): string;
    /**
     * Swap multiple keywords in a string with other keywords.
     *
     * Performs an atomic single-pass swap — replacements are applied
     * simultaneously so the output of one swap is never re-swapped.
     *
     * @param map     - Map of search → replace pairs
     * @param subject - The string to perform swaps on
     * @returns The string with all swaps applied
     *
     * @example
     * ```typescript
     * Str.swap({ foo: 'bar', bar: 'baz' }, 'foo bar');
     * // → 'bar baz' (not 'baz baz' — atomic, no re-swapping)
     * ```
     */
    static swap(map: Record<string, string>, subject: string): string;
    /**
     * Take the first or last {limit} characters
     */
    static take(value: string, limit: number): string;
    /**
     * Convert the given string to title case
     */
    static title(value: string): string;
    /**
     * Convert the given string to Base64
     */
    static toBase64(value: string): string;
    /**
     * Transliterate a string to its closest ASCII representation
     */
    static transliterate(value: string): string;
    /**
     * Trim whitespace from both ends of the string
     */
    static trim(value: string, characters?: string): string;
    /**
     * Trim whitespace from the beginning of the string
     */
    static ltrim(value: string, characters?: string): string;
    /**
     * Trim whitespace from the end of the string
     */
    static rtrim(value: string, characters?: string): string;
    /**
     * Make a string's first character uppercase
     */
    static ucfirst(value: string): string;
    /**
     * Split a string by uppercase characters
     */
    static ucsplit(value: string): string[];
    /**
     * Convert the given string to uppercase
     */
    static upper(value: string): string;
    /**
     * Remove the specified strings from the beginning and end
     */
    static unwrap(value: string, before: string, after?: string): string;
    /**
     * Get the number of words a string contains
     */
    static wordCount(value: string): number;
    /**
     * Wrap a string to a given number of characters
     */
    static wordWrap(value: string, characters?: number, breakStr?: string): string;
    /**
     * Limit the number of words in a string
     */
    static words(value: string, words?: number, end?: string): string;
    /**
     * Wrap the string with the given strings
     */
    static wrap(value: string, before: string, after?: string): string;
}

/**
 * Fluent string wrapper for chainable string operations.
 *
 * Wraps a string value and exposes all {@link Str} methods as instance
 * methods that return new `Stringable` instances for chaining.
 *
 * Methods that produce non-string results (booleans, numbers) are
 * terminal — they return the primitive value directly.
 *
 * @example
 * ```typescript
 * const result = new Stringable('user_name')
 *   .camel()
 *   .ucfirst()
 *   .finish('!')
 *   .toString(); // 'UserName!'
 * ```
 */
declare class Stringable {
    private value;
    constructor(value?: string);
    /**
     * Get the underlying string value.
     */
    toString(): string;
    /**
     * Get the underlying string value.
     * Alias for toString().
     */
    valueOf(): string;
    after(search: string): Stringable;
    afterLast(search: string): Stringable;
    apa(): Stringable;
    ascii(): Stringable;
    before(search: string): Stringable;
    beforeLast(search: string): Stringable;
    between(from: string, to: string): Stringable;
    betweenFirst(from: string, to: string): Stringable;
    camel(): Stringable;
    charAt(index: number): string | false;
    chopStart(search: string | string[]): Stringable;
    chopEnd(search: string | string[]): Stringable;
    contains(needles: string | string[], ignoreCase?: boolean): boolean;
    containsAll(needles: string[], ignoreCase?: boolean): boolean;
    doesntContain(needles: string | string[], ignoreCase?: boolean): boolean;
    deduplicate(character?: string): Stringable;
    endsWith(needles: string | string[]): boolean;
    excerpt(phrase: string, options?: {
        radius?: number;
        omission?: string;
    }): string;
    finish(cap: string): Stringable;
    headline(): Stringable;
    is(pattern: string, ignoreCase?: boolean): boolean;
    isAscii(): boolean;
    isJson(): boolean;
    isUrl(protocols?: string[]): boolean;
    isUlid(): boolean;
    isUuid(): boolean;
    kebab(): Stringable;
    lcfirst(): Stringable;
    length(): number;
    limit(limit?: number, end?: string, preserveWords?: boolean): Stringable;
    lower(): Stringable;
    mask(character: string, index: number, length?: number): Stringable;
    padBoth(length: number, pad?: string): Stringable;
    padLeft(length: number, pad?: string): Stringable;
    padRight(length: number, pad?: string): Stringable;
    plural(count?: number): Stringable;
    pluralStudly(count?: number): Stringable;
    position(needle: string): number | false;
    remove(search: string | string[], caseSensitive?: boolean): Stringable;
    repeat(times: number): Stringable;
    replace(search: string, replace: string, caseSensitive?: boolean): Stringable;
    replaceArray(search: string, replacements: string[]): Stringable;
    replaceFirst(search: string, replace: string): Stringable;
    replaceLast(search: string, replace: string): Stringable;
    replaceStart(search: string, replace: string): Stringable;
    replaceEnd(search: string, replace: string): Stringable;
    reverse(): Stringable;
    singular(): Stringable;
    slug(separator?: string): Stringable;
    snake(delimiter?: string): Stringable;
    squish(): Stringable;
    start(prefix: string): Stringable;
    startsWith(needles: string | string[]): boolean;
    studly(): Stringable;
    substr(start: number, length?: number): Stringable;
    substrCount(needle: string): number;
    substrReplace(replace: string, start: number, length?: number): Stringable;
    swap(map: Record<string, string>): Stringable;
    take(limit: number): Stringable;
    title(): Stringable;
    toBase64(): string;
    transliterate(): Stringable;
    trim(characters?: string): Stringable;
    ltrim(characters?: string): Stringable;
    rtrim(characters?: string): Stringable;
    ucfirst(): Stringable;
    ucsplit(): string[];
    upper(): Stringable;
    unwrap(before: string, after?: string): Stringable;
    wordCount(): number;
    wordWrap(characters?: number, breakStr?: string): Stringable;
    words(words?: number, end?: string): Stringable;
    wrap(before: string, after?: string): Stringable;
}

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
/**
 * Any plain object with string keys.
 * Used as the input type for dot-notation accessors.
 */
type DataObject = Record<string, any>;
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
declare class Arr {
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
    static get<T = any>(target: DataObject, key: string | null, fallback?: T): T;
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
    static set<T extends DataObject>(target: T, key: string, value: any): T;
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
    static has(target: DataObject, keys: string | string[]): boolean;
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
    static forget<T extends DataObject>(target: T, keys: string | string[]): T;
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
    static only<T extends DataObject>(target: T, keys: string[]): Partial<T>;
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
    static except<T extends DataObject>(target: T, keys: string[]): Partial<T>;
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
    static pluck<T extends DataObject>(items: T[], value: string, key?: string): any[] | Record<string, any>;
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
    static groupBy<T extends DataObject>(items: T[], key: string): Record<string, T[]>;
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
    static keyBy<T extends DataObject>(items: T[], key: string): Record<string, T>;
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
    static first<T>(items: T[], callback?: (item: T, index: number) => boolean, fallback?: T): T | undefined;
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
    static last<T>(items: T[], callback?: (item: T, index: number) => boolean, fallback?: T): T | undefined;
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
    static flatten<T = any>(items: any[], depth?: number): T[];
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
    static wrap<T>(value: T | T[] | null | undefined): T[];
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
    static random<T>(items: T[], count?: number): T | T[];
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
    static shuffle<T>(items: T[]): T[];
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
    static sortBy<T extends DataObject>(items: T[], key: string, direction?: "asc" | "desc"): T[];
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
    static unique<T>(items: T[], key?: string): T[];
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
    static chunk<T>(items: T[], size: number): T[][];
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
    static combine<V>(keys: string[], values: V[]): Record<string, V>;
    /**
     * Determine if the given value is an array.
     *
     * @param value - The value to check
     * @returns `true` if the value is an array
     */
    static isArray(value: unknown): value is any[];
    /**
     * Determine if the given value is a plain object.
     *
     * @param value - The value to check
     * @returns `true` if the value is a plain object (not null, not array)
     */
    static isObject(value: unknown): value is DataObject;
    /**
     * Deep clone an object or array.
     *
     * Uses `structuredClone` when available, falls back to JSON
     * round-trip for environments that don't support it.
     *
     * @param value - The value to clone
     * @returns A deep copy of the value
     */
    private static deepClone;
}

/**
 * @fileoverview Laravel-style number utility class.
 *
 * Provides static methods for common number operations: formatting,
 * clamping, abbreviation, ordinals, percentages, and more.
 *
 * ## Laravel Parity
 *
 * | Laravel                                  | Stackra                                  |
 * |------------------------------------------|------------------------------------------|
 * | `Number::format(1234567.89)`             | `Num.format(1234567.89)`                 |
 * | `Number::abbreviate(1_000_000)`          | `Num.abbreviate(1_000_000)`              |
 * | `Number::ordinal(1)`                     | `Num.ordinal(1)`                         |
 * | `Number::percentage(75.5)`               | `Num.percentage(75.5)`                   |
 * | `Number::currency(1234.56, 'USD')`       | `Num.currency(1234.56, 'USD')`           |
 * | `Number::fileSize(1024)`                 | `Num.fileSize(1024)`                     |
 * | `Number::forHumans(1234567)`             | `Num.forHumans(1234567)`                 |
 * | `Number::clamp(5, 1, 10)`               | `Num.clamp(5, 1, 10)`                   |
 *
 * @module num/num
 * @category Numbers
 */
/**
 * Laravel-style number utility class.
 *
 * All methods are static and pure — no side effects, no mutations.
 *
 * @example
 * ```typescript
 * import { Num } from '@stackra/ts-support';
 *
 * Num.format(1234567.89);           // '1,234,567.89'
 * Num.abbreviate(1_500_000);        // '1.5M'
 * Num.ordinal(3);                   // '3rd'
 * Num.percentage(75.5);             // '75.50%'
 * Num.currency(49.99, 'USD');       // '$49.99'
 * Num.fileSize(1536);               // '1.50 KB'
 * Num.clamp(15, 1, 10);            // 10
 * ```
 */
declare class Num {
    /**
     * Format a number with grouped thousands and decimal places.
     *
     * Uses `Intl.NumberFormat` for locale-aware formatting.
     *
     * @param value    - The number to format
     * @param decimals - Number of decimal places (default: `0`)
     * @param locale   - BCP 47 locale string (default: `'en-US'`)
     * @returns The formatted number string
     *
     * @example
     * ```typescript
     * Num.format(1234567.89);        // '1,234,568'
     * Num.format(1234567.89, 2);     // '1,234,567.89'
     * Num.format(1234.5, 2, 'de');   // '1.234,50'
     * ```
     */
    static format(value: number, decimals?: number, locale?: string): string;
    /**
     * Abbreviate a number with a suffix (K, M, B, T, Q).
     *
     * @param value     - The number to abbreviate
     * @param precision - Decimal places in the abbreviated form (default: `0`)
     * @returns The abbreviated string
     *
     * @example
     * ```typescript
     * Num.abbreviate(1_000);         // '1K'
     * Num.abbreviate(1_500_000, 1);  // '1.5M'
     * Num.abbreviate(999);           // '999'
     * ```
     */
    static abbreviate(value: number, precision?: number): string;
    /**
     * Format a number as a human-readable string with word suffixes.
     *
     * Similar to `abbreviate()` but uses full words: thousand, million, etc.
     *
     * @param value     - The number to format
     * @param precision - Decimal places (default: `0`)
     * @returns The human-readable string
     *
     * @example
     * ```typescript
     * Num.forHumans(1_000);         // '1 thousand'
     * Num.forHumans(1_500_000, 1);  // '1.5 million'
     * Num.forHumans(2_300_000_000); // '2 billion'
     * ```
     */
    static forHumans(value: number, precision?: number): string;
    /**
     * Get the ordinal suffix for a number (1st, 2nd, 3rd, 4th, ...).
     *
     * @param value - The number
     * @returns The number with its ordinal suffix
     *
     * @example
     * ```typescript
     * Num.ordinal(1);   // '1st'
     * Num.ordinal(2);   // '2nd'
     * Num.ordinal(3);   // '3rd'
     * Num.ordinal(11);  // '11th'
     * Num.ordinal(21);  // '21st'
     * ```
     */
    static ordinal(value: number): string;
    /**
     * Format a number as a percentage.
     *
     * @param value     - The number (e.g., `75.5` for 75.50%)
     * @param precision - Decimal places (default: `2`)
     * @param locale    - BCP 47 locale string (default: `'en-US'`)
     * @returns The formatted percentage string
     *
     * @example
     * ```typescript
     * Num.percentage(75.5);       // '75.50%'
     * Num.percentage(100, 0);     // '100%'
     * Num.percentage(0.5, 1);     // '0.5%'
     * ```
     */
    static percentage(value: number, precision?: number, locale?: string): string;
    /**
     * Format a number as currency.
     *
     * Uses `Intl.NumberFormat` with `style: 'currency'` for locale-aware
     * currency formatting.
     *
     * @param value    - The amount
     * @param currency - ISO 4217 currency code (default: `'USD'`)
     * @param locale   - BCP 47 locale string (default: `'en-US'`)
     * @returns The formatted currency string
     *
     * @example
     * ```typescript
     * Num.currency(49.99);                // '$49.99'
     * Num.currency(1234.56, 'EUR', 'de'); // '1.234,56 €'
     * Num.currency(99, 'GBP');            // '£99.00'
     * ```
     */
    static currency(value: number, currency?: string, locale?: string): string;
    /**
     * Format a byte count as a human-readable file size.
     *
     * @param bytes     - The byte count
     * @param precision - Decimal places (default: `2`)
     * @returns The formatted file size string
     *
     * @example
     * ```typescript
     * Num.fileSize(0);            // '0 B'
     * Num.fileSize(1024);         // '1.00 KB'
     * Num.fileSize(1536);         // '1.50 KB'
     * Num.fileSize(1_073_741_824); // '1.00 GB'
     * ```
     */
    static fileSize(bytes: number, precision?: number): string;
    /**
     * Clamp a number between a minimum and maximum value.
     *
     * @param value - The number to clamp
     * @param min   - Minimum allowed value
     * @param max   - Maximum allowed value
     * @returns The clamped value
     *
     * @example
     * ```typescript
     * Num.clamp(5, 1, 10);   // 5
     * Num.clamp(-5, 1, 10);  // 1
     * Num.clamp(15, 1, 10);  // 10
     * ```
     */
    static clamp(value: number, min: number, max: number): number;
    /**
     * Generate a random integer between min and max (inclusive).
     *
     * @param min - Minimum value (default: `0`)
     * @param max - Maximum value (default: `100`)
     * @returns A random integer in the range [min, max]
     *
     * @example
     * ```typescript
     * Num.random(1, 10);  // e.g., 7
     * Num.random();       // e.g., 42 (0–100)
     * ```
     */
    static random(min?: number, max?: number): number;
    /**
     * Determine if a value is a valid, finite number.
     *
     * Returns `false` for `NaN`, `Infinity`, `-Infinity`, and non-number types.
     *
     * @param value - The value to check
     * @returns `true` if the value is a finite number
     *
     * @example
     * ```typescript
     * Num.isNumber(42);        // true
     * Num.isNumber(3.14);      // true
     * Num.isNumber(NaN);       // false
     * Num.isNumber(Infinity);  // false
     * Num.isNumber('42');      // false
     * ```
     */
    static isNumber(value: unknown): value is number;
    /**
     * Determine if a value is an integer.
     *
     * @param value - The value to check
     * @returns `true` if the value is an integer
     *
     * @example
     * ```typescript
     * Num.isInteger(42);    // true
     * Num.isInteger(3.14);  // false
     * ```
     */
    static isInteger(value: unknown): value is number;
    /**
     * Determine if a number is even.
     *
     * @param value - The number to check
     * @returns `true` if the number is even
     */
    static isEven(value: number): boolean;
    /**
     * Determine if a number is odd.
     *
     * @param value - The number to check
     * @returns `true` if the number is odd
     */
    static isOdd(value: number): boolean;
    /**
     * Determine if a number is positive (greater than zero).
     *
     * @param value - The number to check
     * @returns `true` if the number is positive
     */
    static isPositive(value: number): boolean;
    /**
     * Determine if a number is negative (less than zero).
     *
     * @param value - The number to check
     * @returns `true` if the number is negative
     */
    static isNegative(value: number): boolean;
    /**
     * Determine if a number falls within a range (inclusive).
     *
     * @param value - The number to check
     * @param min   - Range minimum
     * @param max   - Range maximum
     * @returns `true` if min ≤ value ≤ max
     *
     * @example
     * ```typescript
     * Num.between(5, 1, 10);   // true
     * Num.between(0, 1, 10);   // false
     * Num.between(10, 1, 10);  // true
     * ```
     */
    static between(value: number, min: number, max: number): boolean;
}

/**
 * Laravel-style Collection class for arrays.
 *
 * Provides a fluent, chainable API for filtering, mapping, reducing,
 * sorting, and transforming arrays. Backed by `collect.js`.
 *
 * @typeParam T - The type of items in the collection
 *
 * @example
 * ```typescript
 * import { collect } from '@stackra/ts-support';
 *
 * const users = collect([
 *   { name: 'Alice', age: 30 },
 *   { name: 'Bob', age: 25 },
 *   { name: 'Charlie', age: 35 },
 * ]);
 *
 * const names = users
 *   .filter((u) => u.age >= 30)
 *   .map((u) => u.name)
 *   .all(); // ['Alice', 'Charlie']
 * ```
 */
declare class Collection$1<T = any> {
    private collection;
    constructor(items?: T[]);
    /**
     * Create a new collection instance
     */
    static make<T>(items?: T[]): Collection$1<T>;
    /**
     * Get all items in the collection
     */
    all(): T[];
    /**
     * Get the average value of a given key
     */
    avg(key?: keyof T | ((item: T) => number)): number;
    /**
     * Chunk the collection into chunks of the given size
     */
    chunk(size: number): Collection$1<T[]>;
    /**
     * Collapse a collection of arrays into a single, flat collection
     */
    collapse(): Collection$1<any>;
    /**
     * Determine if an item exists in the collection
     */
    contains(key: keyof T | ((item: T) => boolean), value?: any): boolean;
    /**
     * Get the total number of items in the collection
     */
    count(): number;
    /**
     * Get the items in the collection that are not present in the given items
     */
    diff(items: T[]): Collection$1<T>;
    /**
     * Execute a callback over each item
     */
    each(callback: (item: T, key: number) => void | false): this;
    /**
     * Determine if all items pass the given test
     */
    every(callback: (item: T, key: number) => boolean): boolean;
    /**
     * Get all items except for those with the specified keys
     */
    except(keys: (keyof T)[]): Collection$1<T>;
    /**
     * Run a filter over each of the items
     */
    filter(callback?: (item: T, key: number) => boolean): Collection$1<T>;
    /**
     * Get the first item from the collection
     */
    first(callback?: (item: T, key: number) => boolean): T | undefined;
    /**
     * Get a flattened array of the items in the collection
     */
    flatten(depth?: number): Collection$1<any>;
    /**
     * Flip the items in the collection
     */
    flip(): Collection$1<any>;
    /**
     * Remove an item from the collection by key
     */
    forget(key: number): this;
    /**
     * Get an item from the collection by key
     */
    get(key: number, defaultValue?: T): T | undefined;
    /**
     * Group the collection's items by a given key
     */
    groupBy(key: keyof T | ((item: T) => any)): Collection$1<Collection$1<T>>;
    /**
     * Determine if a given key exists in the collection
     */
    has(key: number): boolean;
    /**
     * Concatenate values of a given key as a string
     */
    implode(key: keyof T | string, glue?: string): string;
    /**
     * Intersect the collection with the given items
     */
    intersect(items: T[]): Collection$1<T>;
    /**
     * Determine if the collection is empty
     */
    isEmpty(): boolean;
    /**
     * Determine if the collection is not empty
     */
    isNotEmpty(): boolean;
    /**
     * Join all items from the collection using a string
     */
    join(glue: string, finalGlue?: string): string;
    /**
     * Key the collection by the given key
     */
    keyBy(key: keyof T | ((item: T) => any)): Collection$1<T>;
    /**
     * Get the keys of the collection items
     */
    keys(): Collection$1<string | number>;
    /**
     * Get the last item from the collection
     */
    last(callback?: (item: T, key: number) => boolean): T | undefined;
    /**
     * Run a map over each of the items
     */
    map<U>(callback: (item: T, key: number) => U): Collection$1<U>;
    /**
     * Get the max value of a given key
     */
    max(key?: keyof T): number;
    /**
     * Merge the collection with the given items
     */
    merge(items: T[]): Collection$1<T>;
    /**
     * Get the min value of a given key
     */
    min(key?: keyof T): number;
    /**
     * Get the items with the specified keys
     */
    only(keys: (keyof T)[]): Collection$1<T>;
    /**
     * Get and remove the last item from the collection
     */
    pop(): T | undefined;
    /**
     * Push an item onto the beginning of the collection
     */
    prepend(value: T): this;
    /**
     * Get and remove an item from the collection
     */
    pull(key: number): T | undefined;
    /**
     * Push an item onto the end of the collection
     */
    push(value: T): this;
    /**
     * Put an item in the collection by key
     */
    put(key: number, value: T): this;
    /**
     * Get one or a specified number of items randomly from the collection
     */
    random(count?: number): T | Collection$1<T>;
    /**
     * Reduce the collection to a single value
     */
    reduce<U>(callback: (carry: U, item: T) => U, initial: U): U;
    /**
     * Filter items by the given key value pair
     */
    reject(callback: (item: T, key: number) => boolean): Collection$1<T>;
    /**
     * Reverse items order
     */
    reverse(): Collection$1<T>;
    /**
     * Search the collection for a given value
     */
    search(value: T | ((item: T) => boolean)): number | false;
    /**
     * Get and remove the first item from the collection
     */
    shift(): T | undefined;
    /**
     * Shuffle the items in the collection
     */
    shuffle(): Collection$1<T>;
    /**
     * Slice the underlying collection array
     */
    slice(start: number, length?: number): Collection$1<T>;
    /**
     * Sort through each item with a callback
     */
    sort(callback?: (a: T, b: T) => number): Collection$1<T>;
    /**
     * Sort the collection by the given key
     */
    sortBy(key: keyof T | ((item: T) => any)): Collection$1<T>;
    /**
     * Sort the collection in descending order by the given key
     */
    sortByDesc(key: keyof T | ((item: T) => any)): Collection$1<T>;
    /**
     * Splice a portion of the underlying collection array
     */
    splice(start: number, length?: number, ...items: T[]): Collection$1<T>;
    /**
     * Get the sum of the given values
     */
    sum(key?: keyof T | ((item: T) => number)): number;
    /**
     * Take the first or last {limit} items
     */
    take(limit: number): Collection$1<T>;
    /**
     * Pass the collection to the given callback and return the result
     */
    pipe<U>(callback: (collection: Collection$1<T>) => U): U;
    /**
     * Pass the collection to the given callback and then return it
     */
    tap(callback: (collection: Collection$1<T>) => void): this;
    /**
     * Transform each item in the collection using a callback
     */
    transform(callback: (item: T, key: number) => T): this;
    /**
     * Return only unique items from the collection array
     */
    unique(key?: keyof T): Collection$1<T>;
    /**
     * Reset the keys on the underlying array
     */
    values(): Collection$1<T>;
    /**
     * Filter items by the given key value pair
     */
    where(key: keyof T, value: any): Collection$1<T>;
    where(key: keyof T, operator: string, value: any): Collection$1<T>;
    /**
     * Filter items by the given key value pair using loose comparison
     */
    whereIn(key: keyof T, values: any[]): Collection$1<T>;
    /**
     * Filter items by the given key value pair using loose comparison
     */
    whereNotIn(key: keyof T, values: any[]): Collection$1<T>;
    /**
     * Zip the collection together with one or more arrays
     */
    zip<U>(...arrays: U[][]): Collection$1<any[]>;
    /**
     * Convert the collection to a plain array
     */
    toArray(): T[];
    /**
     * Convert the collection to JSON
     */
    toJson(): string;
    /**
     * Get the collection as a string
     */
    toString(): string;
}
/**
 * Helper function to create a new collection
 */
declare function collect<T>(items?: T[]): Collection$1<T>;

/**
 * @fileoverview Laravel-style Map Collection class.
 *
 * Provides O(1) key-value operations with a fluent, chainable API.
 * Used internally by {@link BaseRegistry} and available for direct use.
 *
 * @module collections/map-collection
 * @category Collections
 */
/**
 * Laravel-style Map Collection class.
 *
 * Wraps a native `Map` with a fluent API for filtering, mapping,
 * reducing, merging, and transforming key-value pairs.
 *
 * @typeParam K - The key type
 * @typeParam V - The value type
 *
 * @example
 * ```typescript
 * import { collectMap } from '@stackra/ts-support';
 *
 * const config = collectMap({ host: 'localhost', port: '3000' });
 * config.set('debug', 'true');
 * config.has('host');           // true
 * config.get('port');           // '3000'
 * config.filter((v) => v !== 'true').keys(); // ['host', 'port']
 * ```
 */
declare class MapCollection<K = any, V = any> {
    private internalMap;
    constructor(entries?: Iterable<[K, V]> | Record<string, V>);
    /**
     * Create a new map collection instance
     */
    static make<K, V>(entries?: Iterable<[K, V]> | Record<string, V>): MapCollection<K, V>;
    /**
     * Get all entries as an array of [key, value] pairs
     */
    all(): [K, V][];
    /**
     * Get the number of items in the map
     */
    count(): number;
    /**
     * Get the number of items in the map (alias for count)
     */
    size(): number;
    /**
     * Determine if the map is empty
     */
    isEmpty(): boolean;
    /**
     * Determine if the map is not empty
     */
    isNotEmpty(): boolean;
    /**
     * Determine if a key exists in the map
     */
    has(key: K): boolean;
    /**
     * Get a value from the map by key
     */
    get(key: K, defaultValue?: V): V | undefined;
    /**
     * Set a value in the map
     */
    set(key: K, value: V): this;
    /**
     * Put a value in the map (alias for set)
     */
    put(key: K, value: V): this;
    /**
     * Remove a key from the map
     */
    delete(key: K): boolean;
    /**
     * Remove a key from the map (alias for delete)
     */
    forget(key: K): boolean;
    /**
     * Remove all items from the map
     */
    clear(): this;
    /**
     * Get all keys from the map
     */
    keys(): K[];
    /**
     * Get all values from the map
     */
    values(): V[];
    /**
     * Execute a callback over each item
     */
    each(callback: (value: V, key: K) => void | false): this;
    /**
     * Run a map over each of the items
     */
    mapValues<U>(callback: (value: V, key: K) => U): MapCollection<K, U>;
    /**
     * Run a filter over each of the items
     */
    filter(callback: (value: V, key: K) => boolean): MapCollection<K, V>;
    /**
     * Determine if all items pass the given test
     */
    every(callback: (value: V, key: K) => boolean): boolean;
    /**
     * Determine if any item passes the given test
     */
    some(callback: (value: V, key: K) => boolean): boolean;
    /**
     * Get the first value that passes the given test
     */
    first(callback?: (value: V, key: K) => boolean): V | undefined;
    /**
     * Get the last value that passes the given test
     */
    last(callback?: (value: V, key: K) => boolean): V | undefined;
    /**
     * Reduce the map to a single value
     */
    reduce<U>(callback: (carry: U, value: V, key: K) => U, initial: U): U;
    /**
     * Merge another map into this one
     */
    merge(other: MapCollection<K, V> | Map<K, V> | Record<string, V>): this;
    /**
     * Get only the specified keys
     */
    only(keys: K[]): MapCollection<K, V>;
    /**
     * Get all items except the specified keys
     */
    except(keys: K[]): MapCollection<K, V>;
    /**
     * Flip the keys and values
     */
    flip(): MapCollection<V, K>;
    /**
     * Pass the map to the given callback and return the result
     */
    pipe<U>(callback: (map: MapCollection<K, V>) => U): U;
    /**
     * Pass the map to the given callback and then return it
     */
    tap(callback: (map: MapCollection<K, V>) => void): this;
    /**
     * Convert the map to a plain object
     */
    toObject(): Record<string, V>;
    /**
     * Convert the map to an array of [key, value] pairs
     */
    toArray(): [K, V][];
    /**
     * Convert the map to JSON
     */
    toJson(): string;
    /**
     * Get the map as a string
     */
    toString(): string;
    /**
     * Get the underlying Map instance
     */
    toMap(): Map<K, V>;
}
/**
 * Helper function to create a new map collection
 */
declare function collectMap<K, V>(entries?: Iterable<[K, V]> | Record<string, V>): MapCollection<K, V>;

/**
 * @fileoverview Laravel-style Set Collection class.
 *
 * Provides set-theoretic operations (union, intersect, diff, symmetric diff)
 * with a fluent, chainable API on top of native `Set`.
 *
 * @module collections/set-collection
 * @category Collections
 */
/**
 * Laravel-style Set Collection class.
 *
 * Wraps a native `Set` with a fluent API for set-theoretic operations,
 * iteration, filtering, and transformation. Guarantees uniqueness of items.
 *
 * @typeParam T - The type of items in the set
 *
 * @example
 * ```typescript
 * import { collectSet } from '@stackra/ts-support';
 *
 * const a = collectSet([1, 2, 3, 4]);
 * const b = collectSet([3, 4, 5, 6]);
 *
 * a.intersect(b).all();      // [3, 4]
 * a.diff(b).all();           // [1, 2]
 * a.union(b).all();          // [1, 2, 3, 4, 5, 6]
 * a.symmetricDiff(b).all();  // [1, 2, 5, 6]
 * ```
 */
declare class SetCollection<T = any> {
    private set;
    constructor(items?: Iterable<T>);
    /**
     * Create a new set collection instance
     */
    static make<T>(items?: Iterable<T>): SetCollection<T>;
    /**
     * Get all items as an array
     */
    all(): T[];
    /**
     * Get the number of items in the set
     */
    count(): number;
    /**
     * Get the number of items in the set (alias for count)
     */
    size(): number;
    /**
     * Determine if the set is empty
     */
    isEmpty(): boolean;
    /**
     * Determine if the set is not empty
     */
    isNotEmpty(): boolean;
    /**
     * Determine if an item exists in the set
     */
    has(item: T): boolean;
    /**
     * Determine if an item exists in the set (alias for has)
     */
    contains(item: T): boolean;
    /**
     * Add an item to the set
     */
    add(item: T): this;
    /**
     * Add an item to the set (alias for add)
     */
    push(item: T): this;
    /**
     * Remove an item from the set
     */
    delete(item: T): boolean;
    /**
     * Remove an item from the set (alias for delete)
     */
    forget(item: T): boolean;
    /**
     * Remove all items from the set
     */
    clear(): this;
    /**
     * Execute a callback over each item
     */
    each(callback: (item: T, index: number) => void | false): this;
    /**
     * Run a map over each of the items
     */
    map<U>(callback: (item: T, index: number) => U): SetCollection<U>;
    /**
     * Run a filter over each of the items
     */
    filter(callback: (item: T, index: number) => boolean): SetCollection<T>;
    /**
     * Determine if all items pass the given test
     */
    every(callback: (item: T, index: number) => boolean): boolean;
    /**
     * Determine if any item passes the given test
     */
    some(callback: (item: T, index: number) => boolean): boolean;
    /**
     * Get the first item that passes the given test
     */
    first(callback?: (item: T, index: number) => boolean): T | undefined;
    /**
     * Get the last item that passes the given test
     */
    last(callback?: (item: T, index: number) => boolean): T | undefined;
    /**
     * Reduce the set to a single value
     */
    reduce<U>(callback: (carry: U, item: T, index: number) => U, initial: U): U;
    /**
     * Merge another set into this one
     */
    merge(other: SetCollection<T> | Set<T> | T[]): this;
    /**
     * Get the union of this set and another
     */
    union(other: SetCollection<T> | Set<T> | T[]): SetCollection<T>;
    /**
     * Get the intersection of this set and another
     */
    intersect(other: SetCollection<T> | Set<T> | T[]): SetCollection<T>;
    /**
     * Get the difference between this set and another
     */
    diff(other: SetCollection<T> | Set<T> | T[]): SetCollection<T>;
    /**
     * Get items that are in either set but not in both
     */
    symmetricDiff(other: SetCollection<T> | Set<T> | T[]): SetCollection<T>;
    /**
     * Determine if this set is a subset of another
     */
    isSubsetOf(other: SetCollection<T> | Set<T> | T[]): boolean;
    /**
     * Determine if this set is a superset of another
     */
    isSupersetOf(other: SetCollection<T> | Set<T> | T[]): boolean;
    /**
     * Pass the set to the given callback and return the result
     */
    pipe<U>(callback: (set: SetCollection<T>) => U): U;
    /**
     * Pass the set to the given callback and then return it
     */
    tap(callback: (set: SetCollection<T>) => void): this;
    /**
     * Convert the set to an array
     */
    toArray(): T[];
    /**
     * Convert the set to JSON
     */
    toJson(): string;
    /**
     * Get the set as a string
     */
    toString(): string;
    /**
     * Get the underlying Set instance
     */
    toSet(): Set<T>;
}
/**
 * Helper function to create a new set collection
 */
declare function collectSet<T>(items?: Iterable<T>): SetCollection<T>;

/**
 * @fileoverview Validation result interface for registry operations.
 *
 * @module @stackra/ts-support
 * @category Interfaces
 */
/**
 * Validation result for registry operations
 *
 * @example
 * ```typescript
 * const result: ValidationResult = {
 *   valid: false,
 *   error: 'Item name cannot be empty'
 * };
 * ```
 */
interface ValidationResult {
    /**
     * Whether the validation passed
     */
    valid: boolean;
    /**
     * Error message if validation failed
     */
    error?: string;
}

/**
 * @fileoverview Base registry options interface.
 *
 * Configuration options for creating a registry instance.
 * Allows customization of default item behavior and validation.
 *
 * @module @stackra/ts-support
 * @category Interfaces
 */

/**
 * Base registry options
 *
 * Configuration options for creating a registry instance.
 * Allows customization of default item behavior and validation.
 *
 * @template T - The type of items stored in the registry
 */
interface BaseRegistryOptions<T> {
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
interface Collection<T> {
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

/**
 * @fileoverview Base registry implementation
 *
 * A generic key-value registry backed by {@link MapCollection}.
 * Provides O(1) lookups, optional default values, and validation hooks.
 *
 * @module @stackra/support
 * @category Registries
 */

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
declare class BaseRegistry<T> implements Collection<T> {
    /**
     * Internal map-based storage.
     */
    protected readonly storage: MapCollection<string, T>;
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
    constructor(options?: BaseRegistryOptions<T>);
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
    register(key: string, item: T): void;
    /**
     * @inheritdoc — delegates to {@link register} so hooks still fire.
     */
    add(key: string, value: T): void;
    /**
     * Retrieve an item by key.
     *
     * Falls back to {@link defaultItem} when the key is not found.
     *
     * @param key - Item identifier
     * @returns The stored value, the default item, or `undefined`
     */
    get(key: string): T | undefined;
    /**
     * Return every stored value in insertion order.
     */
    getAll(): T[];
    /**
     * Return every registered key in insertion order.
     */
    getKeys(): string[];
    /**
     * Convert the registry to a plain `Record<string, T>`.
     */
    getAsRecord(): Record<string, T>;
    /**
     * Check whether a key exists.
     */
    has(key: string): boolean;
    /**
     * Remove an item by key.
     *
     * @returns `true` if the key existed and was removed
     */
    remove(key: string): boolean;
    /**
     * Remove all items from the registry.
     */
    clear(): void;
    /**
     * Return the number of registered items.
     */
    size(): number;
    /**
     * Return `true` when the registry is empty.
     */
    isEmpty(): boolean;
    /**
     * Iterate over every entry in insertion order.
     */
    forEach(callback: (value: T, key: string) => void): void;
    /**
     * Map every entry to a new value and return the results as an array.
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

/**
 * @fileoverview ResolverChain — executes resolvers in priority order.
 *
 * A lightweight utility that stores resolvers and runs them in priority
 * order, returning the first non-undefined result (short-circuit).
 *
 * This is NOT a DI-managed service — it's a plain utility class meant
 * to be composed inside DI-managed registries.
 *
 * @module @stackra/ts-support
 * @category Chains
 *
 * @example
 * ```typescript
 * import { ResolverChain } from "@stackra/ts-support";
 * import type { IResolver } from "@stackra/contracts";
 *
 * const chain = new ResolverChain<string, ReactNode>();
 *
 * chain.register({
 *   id: "lucide",
 *   priority: 10,
 *   resolve(name) {
 *     if (!name.startsWith("lucide:")) return undefined;
 *     return createElement(lucideIcons[name.slice(7)]);
 *   },
 * });
 *
 * chain.register({
 *   id: "emoji",
 *   priority: 50,
 *   resolve(name) {
 *     if (!name.startsWith("emoji:")) return undefined;
 *     return name.slice(6);
 *   },
 * });
 *
 * const icon = chain.resolve("lucide:home"); // → ReactNode
 * const emoji = chain.resolve("emoji:🛍");   // → "🛍"
 * const miss = chain.resolve("unknown");      // → undefined
 * ```
 */

/**
 * Executes resolvers in priority order, short-circuiting on first match.
 *
 * Supports both plain `IResolver` and `IGuardedResolver` (with `match()`).
 * When a resolver has a `match()` method, it's called first — if it returns
 * `false`, `resolve()` is skipped entirely.
 *
 * @typeParam TInput - The input type passed to resolvers
 * @typeParam TOutput - The output type returned by resolvers
 */
declare class ResolverChain<TInput = void, TOutput = unknown> {
    /** Internal storage keyed by id for O(1) dedup. */
    private readonly items;
    /** Cached sorted array — invalidated on register/remove. */
    private sorted;
    /**
     * Register a resolver. Re-registering the same `id` replaces the
     * existing entry (allows apps to shadow built-in resolvers).
     *
     * @param resolver - The resolver to register
     */
    register(resolver: IResolver<TInput, TOutput>): void;
    /**
     * Register multiple resolvers at once.
     *
     * @param resolvers - Array of resolvers to register
     */
    registerMany(resolvers: IResolver<TInput, TOutput>[]): void;
    /**
     * Remove a resolver by id.
     *
     * @param id - The resolver id to remove
     * @returns `true` if the resolver existed and was removed
     */
    remove(id: string): boolean;
    /**
     * Check whether a resolver with the given id exists.
     *
     * @param id - The resolver id to check
     * @returns `true` if registered
     */
    has(id: string): boolean;
    /**
     * Run the resolver chain. Returns the first non-undefined result.
     *
     * For `IGuardedResolver` entries, `match()` is called first — if it
     * returns `false`, `resolve()` is skipped.
     *
     * @param input - The input to resolve
     * @returns The first resolved value, or `undefined` if no resolver matched
     */
    resolve(input: TInput): TOutput | undefined;
    /**
     * Get all resolvers sorted by priority ascending.
     *
     * @returns Sorted array of resolvers
     */
    getOrdered(): IResolver<TInput, TOutput>[];
    /**
     * Get the number of registered resolvers.
     *
     * @returns The count
     */
    size(): number;
    /**
     * Remove all resolvers.
     */
    clear(): void;
}

/**
 * @fileoverview TransformerChain — executes transformers in priority order.
 *
 * A lightweight utility that stores transformers and runs ALL of them
 * in priority order, piping each transformer's output as the next one's
 * input (sequential composition).
 *
 * This is NOT a DI-managed service — it's a plain utility class meant
 * to be composed inside DI-managed registries or pipelines.
 *
 * @module @stackra/ts-support
 * @category Chains
 *
 * @example
 * ```typescript
 * import { TransformerChain } from "@stackra/ts-support";
 * import type { ITransformer } from "@stackra/contracts";
 *
 * interface Context { permissions: string[] }
 *
 * const chain = new TransformerChain<MenuItem[], Context>();
 *
 * chain.register({
 *   id: "permission",
 *   priority: 15,
 *   transform(items, ctx) {
 *     return items.filter((item) => {
 *       const required = item.meta?.permissions ?? [];
 *       return required.every((p) => ctx.permissions.includes(p));
 *     });
 *   },
 * });
 *
 * chain.register({
 *   id: "sort-alpha",
 *   priority: 50,
 *   transform(items) {
 *     return [...items].sort((a, b) => a.label.localeCompare(b.label));
 *   },
 * });
 *
 * const result = chain.run(menuItems, { permissions: ["admin"] });
 * ```
 */

/**
 * Executes all transformers in priority order, composing sequentially.
 *
 * Every registered transformer runs — there is no short-circuiting.
 * Each transformer receives the output of the previous one.
 *
 * @typeParam TData - The data type being transformed (same for input and output)
 * @typeParam TContext - Additional context passed to every transformer
 */
declare class TransformerChain<TData, TContext = void> {
    /** Internal storage keyed by id for O(1) dedup. */
    private readonly items;
    /** Cached sorted array — invalidated on register/remove. */
    private sorted;
    /**
     * Register a transformer. Re-registering the same `id` replaces the
     * existing entry (allows apps to shadow built-in transformers).
     *
     * @param transformer - The transformer to register
     */
    register(transformer: ITransformer<TData, TContext>): void;
    /**
     * Register multiple transformers at once.
     *
     * @param transformers - Array of transformers to register
     */
    registerMany(transformers: ITransformer<TData, TContext>[]): void;
    /**
     * Remove a transformer by id.
     *
     * @param id - The transformer id to remove
     * @returns `true` if the transformer existed and was removed
     */
    remove(id: string): boolean;
    /**
     * Check whether a transformer with the given id exists.
     *
     * @param id - The transformer id to check
     * @returns `true` if registered
     */
    has(id: string): boolean;
    /**
     * Run all transformers in priority order.
     *
     * Each transformer receives the output of the previous one.
     * If no transformers are registered, returns the input unchanged.
     *
     * @param data - The initial data to transform
     * @param context - Context passed to every transformer
     * @returns The final transformed data
     */
    run(data: TData, context: TContext): TData;
    /**
     * Get all transformers sorted by priority ascending.
     *
     * @returns Sorted array of transformers
     */
    getOrdered(): ITransformer<TData, TContext>[];
    /**
     * Get the number of registered transformers.
     *
     * @returns The count
     */
    size(): number;
    /**
     * Remove all transformers.
     */
    clear(): void;
}

/**
 * Custom driver creator function.
 *
 * Receives the raw instance config and returns a driver instance.
 */
type DriverCreator<T> = (config: Record<string, any>) => T;

/**
 * Multiple Instance Manager
 *
 * Abstract base class for managing multiple named instances backed by
 * different drivers. TypeScript adaptation of Laravel's
 * `MultipleInstanceManager` pattern.
 *
 * Supports both sync and async driver creation:
 * - `instance(name)` — sync resolution via `createDriver()`
 * - `instanceAsync(name)` — async resolution via `createDriverAsync()`
 *   with built-in deduplication of in-flight resolutions
 *
 * Concrete managers extend this class and implement:
 * - `getDefaultInstance()` — which instance name to use by default
 * - `setDefaultInstance(name)` — change the default at runtime
 * - `getInstanceConfig(name)` — read config for a named instance
 * - `createDriver(driver, config)` — create an instance synchronously
 *
 * For async drivers (Redis, DB connections), also implement:
 * - `createDriverAsync(driver, config)` — create an instance asynchronously
 *
 * Optionally override:
 * - `onInstanceCreated(name, instance)` — hook to configure newly created instances
 *
 * @typeParam T - The type of instance this manager creates
 *
 * @module managers/multiple-instance-manager
 */

/**
 * Abstract base manager for multi-instance, multi-driver services.
 *
 * @typeParam T - The type of instance managed (e.g., IStore, RedisConnection)
 */
declare abstract class MultipleInstanceManager<T> {
    /**
     * Resolved instances, keyed by instance name.
     * Instances are created once and reused on subsequent calls.
     */
    private readonly instances;
    /**
     * In-flight async resolutions, keyed by instance name.
     * Prevents duplicate async driver creation when `instanceAsync()`
     * is called multiple times before the first one resolves.
     */
    private readonly pending;
    /**
     * Custom driver creators registered via `extend()`.
     * Keyed by driver name.
     */
    private readonly customCreators;
    /**
     * The config key that identifies the driver in instance config.
     * Override in subclasses if your config uses a different field name.
     *
     * @default 'driver'
     */
    protected readonly driverKey: string;
    /**
     * Get the default instance name.
     */
    abstract getDefaultInstance(): string;
    /**
     * Set the default instance name at runtime.
     */
    abstract setDefaultInstance(name: string): void;
    /**
     * Get the configuration for a named instance.
     */
    abstract getInstanceConfig(name: string): Record<string, any> | undefined;
    /**
     * Create a driver instance synchronously.
     * Called by `instance()` when no custom creator is registered.
     *
     * For async-only drivers (e.g., Redis), throw an error here
     * and implement `createDriverAsync()` instead.
     */
    protected abstract createDriver(driver: string, config: Record<string, any>): T;
    /**
     * Create a driver instance asynchronously.
     * Called by `instanceAsync()` when no custom creator is registered.
     *
     * Override this for drivers that require async initialization
     * (e.g., establishing connections, loading remote config).
     *
     * By default, falls back to the sync `createDriver()`.
     *
     * @param driver - The driver name from config
     * @param config - The raw instance config
     * @returns A promise that resolves to the driver instance
     */
    protected createDriverAsync(driver: string, config: Record<string, any>): Promise<T>;
    /**
     * Called after a new instance is created and before it's cached.
     * Override to configure instances (e.g., set names, event dispatchers).
     *
     * @param name - The instance name
     * @param instance - The newly created instance
     * @returns The instance (possibly modified)
     */
    protected onInstanceCreated(_name: string, instance: T): T;
    /**
     * Get an instance by name (sync).
     *
     * Returns a cached instance if available, otherwise resolves
     * via `createDriver()` and caches it.
     *
     * @param name - Instance name (uses default if omitted)
     */
    instance(name?: string): T;
    /**
     * Get an instance by name (async).
     *
     * Returns a cached instance if available, otherwise resolves
     * via `createDriverAsync()` and caches it.
     *
     * Deduplicates in-flight resolutions — if two callers request
     * the same instance simultaneously, they share one Promise.
     *
     * @param name - Instance name (uses default if omitted)
     *
     * @example
     * ```typescript
     * // In RedisManager:
     * async connection(name?: string): Promise<RedisConnection> {
     *   return this.instanceAsync(name);
     * }
     * ```
     */
    instanceAsync(name?: string): Promise<T>;
    /**
     * Register a custom driver creator.
     * Custom creators take priority over built-in drivers.
     */
    extend(driver: string, creator: DriverCreator<T>): this;
    /**
     * Remove a cached instance, forcing re-creation on next access.
     *
     * @param name - Instance name(s). Uses default if omitted.
     */
    forgetInstance(name?: string | string[]): this;
    /**
     * Remove all cached instances.
     */
    purge(): void;
    /**
     * Check if an instance has been resolved and cached.
     */
    hasInstance(name: string): boolean;
    /**
     * Get all resolved instance names.
     */
    getResolvedInstances(): string[];
    /**
     * Manually set a resolved instance in the cache.
     * Useful when instance creation happens outside the normal
     * `instance()` / `instanceAsync()` flow.
     */
    protected setInstance(name: string, instance: T): void;
    /**
     * @deprecated Use `hasInstance()` instead.
     */
    hasResolvedInstance(name: string): boolean;
    private resolve;
    private resolveAsync;
}

export { Arr, BaseRegistry, Collection$1 as Collection, Env, MapCollection, MultipleInstanceManager, Num, ResolverChain, SetCollection, Str, Stringable, TransformerChain, collect, collectMap, collectSet, env };
