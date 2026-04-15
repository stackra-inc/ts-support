/**
 * @fileoverview Keyboard shortcut category constants
 *
 * Defines all available shortcut categories used throughout the application.
 *
 * @module @abdokouta/kbd
 * @category Constants
 */

import type { ShortcutCategory } from '@/interfaces/shortcut-category.type';

/**
 * Available shortcut categories
 *
 * @constant
 * @public
 */
export const SHORTCUT_CATEGORIES = {
  NAVIGATION: 'navigation' as const,
  EDITING: 'editing' as const,
  SEARCH: 'search' as const,
  VIEW: 'view' as const,
  FILE: 'file' as const,
  HELP: 'help' as const,
  CUSTOM: 'custom' as const,
} satisfies Record<string, ShortcutCategory>;

/**
 * Array of all shortcut categories
 *
 * @constant
 * @public
 */
export const ALL_SHORTCUT_CATEGORIES = Object.values(SHORTCUT_CATEGORIES);

/**
 * Category display names
 *
 * @constant
 * @public
 */
export const SHORTCUT_CATEGORY_NAMES: Record<ShortcutCategory, string> = {
  navigation: 'Navigation',
  editing: 'Editing',
  search: 'Search',
  view: 'View',
  file: 'File',
  help: 'Help',
  custom: 'Custom',
};

/**
 * Category descriptions
 *
 * @constant
 * @public
 */
export const SHORTCUT_CATEGORY_DESCRIPTIONS: Record<ShortcutCategory, string> = {
  navigation: 'Navigate through the application',
  editing: 'Edit and modify content',
  search: 'Search and find content',
  view: 'Control the view and layout',
  file: 'File operations',
  help: 'Get help and documentation',
  custom: 'Custom shortcuts',
};
