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
 * - **GlobalRegistry + bootGlobals()** — Extensible global helper system
 * - **Facade** — Laravel-style static proxies to DI services
 * - **BaseRegistry** — Generic key-value registry with validation hooks
 * - **MultipleInstanceManager** — Multi-driver instance management
 *
 * @module @stackra/ts-support
 */

// ============================================================================
// Environment
// ============================================================================
export { Env } from '@/env';

// ============================================================================
// String Utilities
// ============================================================================
export { Str } from '@/str';
export { Stringable } from '@/str/stringable';

// ============================================================================
// Array Utilities
// ============================================================================
export { Arr } from '@/arr';

// ============================================================================
// Number Utilities
// ============================================================================
export { Num } from '@/num';

// ============================================================================
// Collection Utilities
// ============================================================================
export { Collection, collect } from '@/collections';
export { MapCollection, collectMap } from '@/collections';
export { SetCollection, collectSet } from '@/collections';

// Re-export types from collect.js for convenience
export type { Collection as CollectJsCollection } from 'collect.js';

// ============================================================================
// Globals — Extensible Global Helper System
// ============================================================================
export { GlobalRegistry, bootGlobals } from '@/globals';
export type { GlobalHelper, RegisterOptions } from '@/globals';
export { env, value, str, tap, filled, blank, retry, sleep } from '@/globals';

// ============================================================================
// Registries
// ============================================================================
export { BaseRegistry } from '@/registry';

// ============================================================================
// Managers
// ============================================================================
export { MultipleInstanceManager } from '@/managers';

// ============================================================================
// Mixins
// ============================================================================
export { withMultipleInstanceManager } from '@/mixins';

// ============================================================================
// Types
// ============================================================================
export type { DriverCreator } from '@/types';

// ============================================================================
// Interfaces
// ============================================================================
export type {
  BaseRegistryOptions,
  Collection as RegistryCollection,
  ValidationResult,
} from '@/interfaces';

// ============================================================================
// Facades
// ============================================================================
export { Facade } from './facades/facade';
