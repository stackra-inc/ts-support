/**
 * @fileoverview Slot position constants for the command dock.
 *
 * Defines named slot positions that can be used with the Slot system
 * to inject custom content at strategic points in the dock.
 *
 * @module command-dock/constants/dock-slots
 */

/**
 * Named slot positions for the command dock.
 *
 * @example
 * ```tsx
 * <Slot name={DOCK_SLOTS.BAR.BEFORE_PRIMARY} />
 * ```
 */
export const DOCK_SLOTS = {
  /** Slots within the dock bar. */
  BAR: {
    /** Before the entire dock bar. */
    BEFORE: 'dock:bar:before',
    /** After the entire dock bar. */
    AFTER: 'dock:bar:after',
    /** Before the primary CTA button. */
    BEFORE_PRIMARY: 'dock:bar:before-primary',
    /** After the primary CTA button. */
    AFTER_PRIMARY: 'dock:bar:after-primary',
    /** Before the left quick actions. */
    BEFORE_LEFT: 'dock:bar:before-left',
    /** After the right quick actions. */
    AFTER_RIGHT: 'dock:bar:after-right',
  },
  /** Slots within the expanded action menu. */
  MENU: {
    /** Before the menu content. */
    BEFORE: 'dock:menu:before',
    /** After the menu content. */
    AFTER: 'dock:menu:after',
    /** Before a category group. */
    BEFORE_CATEGORY: 'dock:menu:before-category',
    /** After a category group. */
    AFTER_CATEGORY: 'dock:menu:after-category',
  },
} as const;
