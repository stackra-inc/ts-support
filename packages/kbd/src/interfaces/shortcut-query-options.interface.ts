/**
 * @fileoverview Shortcut query options interface
 *
 * @module interfaces/ShortcutQueryOptions
 */

import type { ShortcutCategory } from './shortcut-category.type';
import type { ShortcutContext } from './shortcut-context.type';

/**
 * Shortcut query options
 * Used for filtering and searching shortcuts
 */
export interface ShortcutQueryOptions {
  /**
   * Filter by category
   */
  category?: ShortcutCategory | ShortcutCategory[];

  /**
   * Filter by context
   */
  context?: ShortcutContext | ShortcutContext[];

  /**
   * Filter by enabled state
   */
  enabled?: boolean;

  /**
   * Filter by tags
   */
  tags?: string[];

  /**
   * Filter by group
   */
  group?: string;

  /**
   * Search query for name/description
   */
  search?: string;

  /**
   * Filter by customizable state
   */
  customizable?: boolean;
}
