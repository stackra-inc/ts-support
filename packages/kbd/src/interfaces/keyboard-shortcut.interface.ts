/**
 * @fileoverview Keyboard shortcut interface
 *
 * Complete interface for keyboard shortcuts with metadata,
 * categories, contexts, and platform-specific variations.
 *
 * @module interfaces/KeyboardShortcut
 */

import type { KeyValue } from '@/types';
import type { PlatformKeys } from './platform-keys.interface';
import type { ShortcutCategory } from './shortcut-category.type';
import type { ShortcutContext } from './shortcut-context.type';
import type { ShortcutPriority } from './shortcut-priority.type';

/**
 * Keyboard shortcut configuration
 *
 * Complete configuration for a keyboard shortcut including
 * keys, metadata, behavior, and platform-specific variations.
 *
 * @example
 * ```typescript
 * const searchShortcut: KeyboardShortcut = {
 *   id: 'search',
 *   name: 'Open Search',
 *   description: 'Open the global search dialog',
 *   category: 'search',
 *   context: 'global',
 *   keys: {
 *     mac: ['command', 'K'],
 *     windows: ['ctrl', 'K'],
 *     linux: ['ctrl', 'K'],
 *     default: ['ctrl', 'K'],
 *   },
 *   callback: () => openSearch(),
 *   enabled: true,
 *   preventDefault: true,
 *   priority: 'high',
 * };
 * ```
 */
export interface KeyboardShortcut {
  // ============================================================================
  // Identification
  // ============================================================================

  /**
   * Unique identifier for the shortcut
   * Used for registration and lookup
   *
   * @example "search", "save", "undo"
   */
  id: string;

  /**
   * Human-readable name
   * Displayed in UI and help documentation
   *
   * @example "Open Search", "Save Document", "Undo"
   */
  name: string;

  /**
   * Detailed description of what the shortcut does
   * Used in help documentation and tooltips
   *
   * @example "Opens the global search dialog to find content"
   */
  description?: string;

  // ============================================================================
  // Categorization
  // ============================================================================

  /**
   * Category for grouping related shortcuts
   * Used in help documentation and settings
   *
   * @default "custom"
   */
  category: ShortcutCategory;

  /**
   * Context where the shortcut is active
   * Determines when the shortcut can be triggered
   *
   * @default "global"
   */
  context: ShortcutContext;

  /**
   * Tags for additional categorization
   * Used for filtering and searching
   *
   * @example ["productivity", "quick-access"]
   */
  tags?: string[];

  // ============================================================================
  // Key Configuration
  // ============================================================================

  /**
   * Key combination(s) for the shortcut
   * Can be platform-specific or universal
   *
   * Simple format (same keys for all platforms):
   * @example keys: ['command', 'K']
   *
   * Platform-specific format:
   * @example
   * keys: {
   *   mac: ['command', 'K'],
   *   windows: ['ctrl', 'K'],
   *   linux: ['ctrl', 'K'],
   *   default: ['ctrl', 'K'],
   * }
   */
  keys: (KeyValue | string)[] | PlatformKeys;

  /**
   * Alternative key combinations
   * Provides multiple ways to trigger the same action
   *
   * @example
   * alternativeKeys: [
   *   ['ctrl', 'F'],
   *   ['command', 'F'],
   * ]
   */
  alternativeKeys?: ((KeyValue | string)[] | PlatformKeys)[];

  // ============================================================================
  // Behavior
  // ============================================================================

  /**
   * Callback function to execute when shortcut is triggered
   *
   * @param event - The keyboard event that triggered the shortcut
   */
  callback: (event?: KeyboardEvent) => void | Promise<void>;

  /**
   * Whether the shortcut is currently enabled
   * Can be toggled dynamically
   *
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to prevent default browser behavior
   *
   * @default true
   */
  preventDefault?: boolean;

  /**
   * Whether to stop event propagation
   *
   * @default false
   */
  stopPropagation?: boolean;

  /**
   * Priority level for conflict resolution
   * Higher priority shortcuts override lower priority ones
   *
   * @default "normal"
   */
  priority?: ShortcutPriority;

  /**
   * Whether the shortcut can be triggered repeatedly while keys are held
   *
   * @default false
   */
  allowRepeat?: boolean;

  // ============================================================================
  // Conditions
  // ============================================================================

  /**
   * Condition function to determine if shortcut should be active
   * Evaluated before triggering the callback
   *
   * @returns True if shortcut should be active
   *
   * @example
   * condition: () => isEditing && !isModalOpen
   */
  condition?: () => boolean;

  /**
   * Element selector where shortcut should be active
   * If specified, shortcut only works when focus is within matching elements
   *
   * @example ".editor-container"
   */
  scope?: string;

  /**
   * Whether shortcut should work in input elements
   *
   * @default false
   */
  allowInInput?: boolean;

  // ============================================================================
  // Metadata
  // ============================================================================

  /**
   * Icon to display with the shortcut
   * Can be an icon name, emoji, or React component type
   *
   * @example "search", "🔍", Search (from lucide-react)
   */
  icon?: string | React.ComponentType<any>;

  /**
   * Whether to show this shortcut in help documentation
   *
   * @default true
   */
  showInHelp?: boolean;

  /**
   * Whether this shortcut can be customized by users
   *
   * @default true
   */
  customizable?: boolean;

  /**
   * Group name for organizing shortcuts in UI
   * Used in settings and help documentation
   *
   * @example "Text Editing", "Navigation"
   */
  group?: string;

  /**
   * Order/position within the group
   * Lower numbers appear first
   *
   * @default 0
   */
  order?: number;

  /**
   * Additional metadata
   * Can store any custom data
   */
  metadata?: Record<string, any>;
}
