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

import { Env } from "@/services/env.service";

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
type EnvReturn<T extends EnvValue> = T extends number
  ? number
  : T extends boolean
    ? boolean
    : string | T;

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
export function env<T extends EnvValue = undefined>(key: string, fallback?: T): EnvReturn<T> {
  if (typeof fallback === "number") {
    return Env.number(key, fallback) as EnvReturn<T>;
  }

  if (typeof fallback === "boolean") {
    return Env.boolean(key, fallback) as EnvReturn<T>;
  }

  return Env.get(key, fallback) as EnvReturn<T>;
}
