/**
 * @fileoverview Keyboard shortcut context constants
 *
 * Defines all available shortcut contexts used throughout the application.
 *
 * @module @abdokouta/kbd
 * @category Constants
 */

import type { ShortcutContext } from '@/interfaces/shortcut-context.type';

/**
 * Available shortcut contexts
 *
 * @constant
 * @public
 */
export const SHORTCUT_CONTEXTS = {
  GLOBAL: 'global' as const,
  EDITOR: 'editor' as const,
  LIST: 'list' as const,
  MODAL: 'modal' as const,
  FORM: 'form' as const,
  CUSTOM: 'custom' as const,
} satisfies Record<string, ShortcutContext>;

/**
 * Array of all shortcut contexts
 *
 * @constant
 * @public
 */
export const ALL_SHORTCUT_CONTEXTS = Object.values(SHORTCUT_CONTEXTS);

/**
 * Context display names
 *
 * @constant
 * @public
 */
export const SHORTCUT_CONTEXT_NAMES: Record<ShortcutContext, string> = {
  global: 'Global',
  editor: 'Editor',
  list: 'List',
  modal: 'Modal',
  form: 'Form',
  custom: 'Custom',
};

/**
 * Context descriptions
 *
 * @constant
 * @public
 */
export const SHORTCUT_CONTEXT_DESCRIPTIONS: Record<ShortcutContext, string> = {
  global: 'Available everywhere in the application',
  editor: 'Available in editor contexts',
  list: 'Available in list/table contexts',
  modal: 'Available in modal/dialog contexts',
  form: 'Available in form contexts',
  custom: 'Custom context',
};
