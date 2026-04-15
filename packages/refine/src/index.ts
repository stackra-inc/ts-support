/**
 * @repo/refine - Refine Framework Wrapper
 *
 * Central re-export point for all Refine.dev core functionality.
 * This package serves as the single point of contact with the
 * Refine ecosystem across the monorepo.
 *
 * By routing all Refine imports through this package, we gain:
 * - A single place to add custom data providers, auth providers, etc.
 * - Version pinning and upgrade control in one location
 * - The ability to extend or override Refine behaviour globally
 *
 * @example
 * ```tsx
 * // Instead of importing from @refinedev/core directly:
 * // import { useList } from '@refinedev/core';
 *
 * // Import from our wrapper:
 * import { useList, Refine } from '@repo/refine';
 * ```
 *
 * @module @repo/refine
 */
export * from '@refinedev/core';
