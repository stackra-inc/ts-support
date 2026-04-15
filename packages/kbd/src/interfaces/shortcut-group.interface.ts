/**
 * @fileoverview Shortcut group configuration interface
 *
 * @module interfaces/ShortcutGroup
 */

import type { KeyboardShortcut } from './keyboard-shortcut.interface';

/**
 * Shortcut group configuration
 * Used to organize shortcuts in UI
 */
export interface ShortcutGroup {
  /**
   * Unique identifier for the group
   */
  id: string;

  /**
   * Display name for the group
   */
  name: string;

  /**
   * Description of the group
   */
  description?: string;

  /**
   * Icon for the group
   * Can be a string (emoji) or a React component type (like Lucide icons)
   */
  icon?: string | React.ComponentType<any>;

  /**
   * Order/position of the group
   */
  order?: number;

  /**
   * Shortcuts in this group
   */
  shortcuts: KeyboardShortcut[];
}
