/**
 * @fileoverview Shortcut conflict information interface
 *
 * @module interfaces/ShortcutConflict
 */

import type { KeyValue } from '@/types';
import type { KeyboardShortcut } from './keyboard-shortcut.interface';

/**
 * Shortcut conflict information
 * Returned when a shortcut conflicts with an existing one
 */
export interface ShortcutConflict {
  /**
   * The new shortcut being registered
   */
  newShortcut: KeyboardShortcut;

  /**
   * The existing shortcut that conflicts
   */
  existingShortcut: KeyboardShortcut;

  /**
   * The conflicting key combination
   */
  conflictingKeys: (KeyValue | string)[];

  /**
   * Whether the conflict can be resolved automatically
   */
  canResolve: boolean;

  /**
   * Suggested resolution
   */
  resolution?: 'override' | 'skip' | 'alternative';
}
