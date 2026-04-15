/**
 * @fileoverview Shortcut priority constants
 *
 * Defines priority levels for keyboard shortcuts.
 *
 * @module @abdokouta/kbd
 * @category Constants
 */

/**
 * Shortcut priority levels
 *
 * @constant
 * @public
 */
export const SHORTCUT_PRIORITIES = {
  LOW: 'low' as const,
  NORMAL: 'normal' as const,
  HIGH: 'high' as const,
  CRITICAL: 'critical' as const,
} as const;

/**
 * Type for shortcut priority
 *
 * @public
 */
export type ShortcutPriority = (typeof SHORTCUT_PRIORITIES)[keyof typeof SHORTCUT_PRIORITIES];

/**
 * Array of all priority levels
 *
 * @constant
 * @public
 */
export const ALL_SHORTCUT_PRIORITIES = Object.values(SHORTCUT_PRIORITIES);

/**
 * Priority numeric values for sorting
 *
 * @constant
 * @public
 */
export const PRIORITY_VALUES: Record<ShortcutPriority, number> = {
  low: 0,
  normal: 1,
  high: 2,
  critical: 3,
};

/**
 * Priority display names
 *
 * @constant
 * @public
 */
export const PRIORITY_NAMES: Record<ShortcutPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  critical: 'Critical',
};
