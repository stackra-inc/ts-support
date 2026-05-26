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

// ============================================================================
// Types
// ============================================================================

/**
 * Supported primitive types that `env()` can coerce values into.
 *
 * - `string`  — raw value, no coercion
 * - `number`  — parsed via `Number()`, NaN falls back to default
 * - `boolean` — `'true'`, `'1'`, `'yes'`, `'on'` → `true`; everything else → `false`
 */
type EnvValue = string | number | boolean | undefined;

/**
 * A repository of environment variables.
 *
 * Can be `process.env`, `import.meta.env`, or any custom record.
 * The Env class reads from this repository when resolving values.
 */
type EnvRepository = Record<string, string | undefined>;

// ============================================================================
// Constants
// ============================================================================

/**
 * String values that are coerced to boolean `true`.
 * Case-insensitive comparison is used.
 */
const TRUTHY_VALUES = new Set(["true", "1", "yes", "on"]);

/**
 * String values that are coerced to boolean `false`.
 * Case-insensitive comparison is used.
 */
const FALSY_VALUES = new Set(["false", "0", "no", "off", ""]);

/**
 * String values that are coerced to `undefined` (treated as "not set").
 * Matches Laravel's `env()` behavior for `(null)` and `(empty)`.
 */
const NULL_VALUES = new Set(["null", "(null)", "none", "(empty)", "undefined"]);

// ============================================================================
// Env Class
// ============================================================================

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
export class Env {
  // ── Repository ──────────────────────────────────────────────────────────

  /**
   * The active environment variable repository.
   *
   * Defaults to `null` (lazy-initialized on first access).
   * Override via `Env.setRepository()` for custom sources.
   */
  private static _repository: EnvRepository | null = null;

  /**
   * Get the current repository, initializing lazily on first access.
   */
  private static get repository(): EnvRepository {
    if (Env._repository === null) {
      Env._repository = Env.detectRepository();
    }
    return Env._repository;
  }

  /**
   * Set the repository directly.
   */
  private static set repository(value: EnvRepository) {
    Env._repository = value;
  }

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
  private static detectRepository(): EnvRepository {
    /* Vite — import.meta.env is statically replaced at build time */
    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (typeof import.meta !== "undefined" && (import.meta as any).env) {
        return (import.meta as any).env as EnvRepository;
      }
    } catch {
      /* import.meta not available in this runtime — continue */
    }

    /* Node.js / Bun / Deno */
    if (typeof process !== "undefined" && process.env) {
      return process.env as EnvRepository;
    }

    /* Fallback — empty repository */
    return {};
  }

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
  static setRepository(repo: EnvRepository): void {
    Env.repository = repo;
  }

  /**
   * Get the current environment repository.
   *
   * Useful for debugging or passing the repository to other systems.
   *
   * @returns The active environment variable source
   */
  static getRepository(): EnvRepository {
    return Env.repository;
  }

  // ── Core Getters ────────────────────────────────────────────────────────

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
  static get<T extends EnvValue = undefined>(key: string, fallback?: T): string | T {
    const raw = Env.repository[key];

    /* Variable not set at all */
    if (raw === undefined) {
      return fallback as T;
    }

    /* Null-like sentinel values → treat as "not set" */
    if (NULL_VALUES.has(raw.toLowerCase())) {
      return fallback as T;
    }

    /* Strip surrounding quotes (common in .env files) */
    return Env.stripQuotes(raw);
  }

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
  static getOrFail(key: string): string {
    const value = Env.get(key);

    if (value === undefined) {
      throw new Error(`Environment variable "${key}" is required but not set.`);
    }

    return value;
  }

  // ── Typed Getters ───────────────────────────────────────────────────────

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
  static string(key: string, fallback?: string): string | undefined {
    return Env.get(key, fallback);
  }

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
  static boolean(key: string, fallback?: boolean): boolean | undefined {
    const raw = Env.get(key);

    if (raw === undefined) {
      return fallback;
    }

    const lower = raw.toLowerCase();

    if (TRUTHY_VALUES.has(lower)) return true;
    if (FALSY_VALUES.has(lower)) return false;

    /* Unrecognized value — fall back */
    return fallback;
  }

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
  static number(key: string, fallback?: number): number | undefined {
    const raw = Env.get(key);

    if (raw === undefined) {
      return fallback;
    }

    const parsed = Number(raw);

    return Number.isNaN(parsed) ? fallback : parsed;
  }

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
  static array(key: string, separator: string = ",", fallback?: string[]): string[] | undefined {
    const raw = Env.get(key);

    if (raw === undefined) {
      return fallback;
    }

    return raw
      .split(separator)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  // ── Inspection ──────────────────────────────────────────────────────────

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
  static has(key: string): boolean {
    return Env.get(key) !== undefined;
  }

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
  static missing(key: string): boolean {
    return !Env.has(key);
  }

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
  static is(name: string): boolean {
    const current = Env.get("APP_ENV") ?? Env.get("NODE_ENV") ?? "production";
    return current.toLowerCase() === name.toLowerCase();
  }

  /**
   * Check if the application is running in production.
   *
   * Shorthand for `Env.is('production')`.
   *
   * @returns `true` if `APP_ENV` or `NODE_ENV` is `'production'`
   */
  static isProduction(): boolean {
    return Env.is("production");
  }

  /**
   * Check if the application is running in a local/development environment.
   *
   * Returns `true` for `'local'`, `'development'`, or `'dev'`.
   *
   * @returns `true` if the environment is local/development
   */
  static isLocal(): boolean {
    const current = (Env.get("APP_ENV") ?? Env.get("NODE_ENV") ?? "").toLowerCase();
    return current === "local" || current === "development" || current === "dev";
  }

  /**
   * Check if the application is running in a testing environment.
   *
   * Returns `true` for `'testing'` or `'test'`.
   *
   * @returns `true` if the environment is testing
   */
  static isTesting(): boolean {
    const current = (Env.get("APP_ENV") ?? Env.get("NODE_ENV") ?? "").toLowerCase();
    return current === "testing" || current === "test";
  }

  // ── Utilities ───────────────────────────────────────────────────────────

  /**
   * Strip surrounding single or double quotes from a value.
   *
   * Many `.env` parsers leave quotes intact. This method removes them
   * so `'"my-value"'` becomes `'my-value'`.
   *
   * @param value - Raw environment variable value
   * @returns The value without surrounding quotes
   */
  private static stripQuotes(value: string): string {
    if (value.length >= 2) {
      const first = value[0];
      const last = value[value.length - 1];

      if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
        return value.slice(1, -1);
      }
    }

    return value;
  }
}
