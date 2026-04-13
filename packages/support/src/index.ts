/**
 * @fileoverview @abdokouta/react-support
 *
 * Laravel-style utilities for JavaScript/TypeScript.
 *
 * @module @abdokouta/support
 */

// ============================================================================
// String Utilities
// ============================================================================
export { Str } from "@/str";

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
// Managers
// ============================================================================
export { MultipleInstanceManager } from "@/managers";

// ============================================================================
// Mixins
// ============================================================================
export { withMultipleInstanceManager } from "@/mixins";

// ============================================================================
// Types & Interfaces
// ============================================================================
export type {
  BaseRegistryOptions,
  Collection as RegistryCollection,
  ValidationResult,
  DriverCreator,
} from "@/types";
