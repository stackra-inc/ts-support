/**
 * @fileoverview Drawer default constants — shared configuration values.
 *
 * These values are used across the drawer stack system for consistent
 * sizing, z-indexing, animation timing, and behavior defaults.
 *
 * @module drawer-stack/constants/drawer-defaults
 */

/**
 * Default configuration values for the drawer stack system.
 *
 * All values are `as const` for type narrowing and immutability.
 */
export const DRAWER_DEFAULTS = {
  /** Default drawer width in pixels when no width is specified. */
  WIDTH: 480,

  /** Base z-index for the first drawer in the stack. */
  BASE_Z_INDEX: 50,

  /** Z-index increment per stacked drawer (ensures proper layering). */
  Z_INDEX_STEP: 10,

  /** Animation duration in milliseconds for enter/exit transitions. */
  ANIMATION_DURATION_MS: 250,

  /** Opacity for non-active (dimmed) drawers behind the topmost one. */
  DIMMED_OPACITY: 0.4,

  /** Whether the Escape key closes drawers by default. */
  CLOSE_ON_ESCAPE: true,

  /** Max dots before StackDots switches to counter mode. */
  MAX_DOTS: 5,

  /** Maximum recommended stack depth before z-index clamping kicks in. */
  MAX_STACK_DEPTH: 100,
} as const;
