/**
 * @fileoverview Shortcut registration options interface
 *
 * @module interfaces/ShortcutRegistrationOptions
 */

/**
 * Shortcut registration options
 */
export interface ShortcutRegistrationOptions {
  /**
   * Whether to override existing shortcuts with the same ID
   *
   * @default false
   */
  override?: boolean;

  /**
   * Whether to check for key conflicts
   *
   * @default true
   */
  checkConflicts?: boolean;

  /**
   * How to handle conflicts
   * - 'error': Throw an error
   * - 'warn': Log a warning and skip
   * - 'override': Override the existing shortcut
   * - 'skip': Skip registration silently
   *
   * @default "warn"
   */
  onConflict?: 'error' | 'warn' | 'override' | 'skip';

  /**
   * Whether to enable the shortcut immediately
   *
   * @default true
   */
  enabled?: boolean;
}
