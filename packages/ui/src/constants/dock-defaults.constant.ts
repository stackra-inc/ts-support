/**
 * @fileoverview Default configuration values for the command dock.
 *
 * @module command-dock/constants/dock-defaults
 */

/**
 * Default configuration values for the command dock system.
 *
 * These are used as fallbacks when optional config properties
 * are not provided to the `CommandDockProvider`.
 */
export const DOCK_DEFAULTS = {
  /** Default bottom offset from viewport edge in pixels. */
  BOTTOM_OFFSET: 24,

  /** Maximum quick actions shown on each side of the primary CTA. */
  MAX_QUICK_ACTIONS: 4,

  /** Hover debounce delay in milliseconds before collapsing. */
  HOVER_DEBOUNCE_MS: 200,

  /** Default zone when none is specified. */
  ZONE: 'default' as const,

  /** Whether to auto-hide when a drawer is open. */
  HIDE_ON_DRAWER_OPEN: true,
} as const;
