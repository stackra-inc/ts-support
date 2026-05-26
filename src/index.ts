/**
 * @fileoverview @stackra/ts-support
 *
 * Laravel-style utilities for JavaScript/TypeScript.
 *
 * Provides:
 * - **Str** — 70+ string manipulation methods
 * - **Arr** — Dot-notation access, pluck, groupBy, and array helpers
 * - **Num** — Formatting, abbreviation, ordinals, currency, file sizes
 * - **Env** — Type-safe environment variable access with coercion
 * - **Collection / MapCollection / SetCollection** — Chainable collections
 * - **Facade** — Laravel-style static proxies to DI services
 * - **BaseRegistry** — Generic key-value registry with validation hooks
 * - **MultipleInstanceManager** — Multi-driver instance management
 *
 * @module @stackra/ts-support
 */

// ============================================================================
// Environment
// ============================================================================
export { Env, env } from "@/env";

// ============================================================================
// String Utilities
// ============================================================================
export { Str } from "@/str";
export { Stringable } from "@/services/stringable.service";

// ============================================================================
// Array Utilities
// ============================================================================
export { Arr } from "@/arr";

// ============================================================================
// Number Utilities
// ============================================================================
export { Num } from "@/num";

// ============================================================================
// Collection Utilities
// ============================================================================
export { Collection, collect } from "@/collections";
export { MapCollection, collectMap } from "@/collections";
export { SetCollection, collectSet } from "@/collections";

// Re-export types from collect.js for convenience
export type { Collection as CollectJsCollection } from "collect.js";

// ============================================================================
// Registries
// ============================================================================
export { BaseRegistry } from "@/registry";

// ============================================================================
// Chains — Resolver & Transformer Execution
// ============================================================================
export { ResolverChain, TransformerChain } from "@/chains";

// ============================================================================
// Managers
// ============================================================================
export { MultipleInstanceManager } from "@/managers";

// ============================================================================
// Pacer — Timing Control (Debounce, Throttle, Rate Limit, Queue)
// ============================================================================
export {
  Throttler,
  Debouncer,
  RateLimiter,
  Queuer,
  AsyncThrottler,
  AsyncDebouncer,
  AsyncRateLimiter,
  AsyncQueuer,
  throttle,
  debounce,
  rateLimit,
  queue,
  asyncThrottle,
  asyncDebounce,
  asyncRateLimit,
  asyncQueue,
} from "@/pacer";
