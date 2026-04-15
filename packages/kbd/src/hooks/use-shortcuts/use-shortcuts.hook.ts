/**
 * @fileoverview Hook for registering and using multiple keyboard shortcuts at once.
 *
 * This hook provides a declarative way to register multiple shortcuts with automatic cleanup.
 * It's useful when a component needs to handle several keyboard shortcuts simultaneously.
 *
 * @module @abdokouta/kbd
 * @category Hooks
 */

import { useEffect } from 'react';
import { useShortcut, type UseShortcutOptions } from '@/hooks/use-shortcut';

/**
 * Options for the useShortcuts hook.
 *
 * @category Hooks
 * @public
 */
export interface UseShortcutsOptions {
  /**
   * Array of shortcut configurations to register.
   * Each entry can be either a shortcut ID string or a full UseShortcutOptions object.
   *
   * @example
   * ```tsx
   * shortcuts: [
   *   "search.open",
   *   "navigation.back",
   *   { id: "editing.save", callback: handleSave }
   * ]
   * ```
   */
  shortcuts: (string | UseShortcutOptions)[];

  /**
   * Whether all shortcuts are enabled.
   * Individual shortcut enabled states take precedence.
   *
   * @defaultValue true
   */
  enabled?: boolean;
}

/**
 * Custom hook for using multiple keyboard shortcuts from the registry.
 *
 * This hook registers multiple shortcuts and automatically handles cleanup.
 * It's more efficient than calling useShortcut multiple times.
 *
 * @example
 * Basic usage with shortcut IDs:
 * ```tsx
 * useShortcuts({
 *   shortcuts: [
 *     "search.open",
 *     "navigation.back",
 *     "navigation.forward",
 *   ],
 * });
 * ```
 *
 * @example
 * With custom callbacks:
 * ```tsx
 * useShortcuts({
 *   shortcuts: [
 *     { id: "search.open", callback: () => setSearchOpen(true) },
 *     { id: "editing.save", callback: handleSave, enabled: hasChanges },
 *     { id: "editing.undo", callback: handleUndo },
 *   ],
 * });
 * ```
 *
 * @example
 * With conditional enabling:
 * ```tsx
 * useShortcuts({
 *   shortcuts: ["editing.save", "editing.undo", "editing.redo"],
 *   enabled: isEditing,
 * });
 * ```
 *
 * @param options - Hook options
 *
 * @category Hooks
 * @public
 */
export const useShortcuts = ({ shortcuts, enabled = true }: UseShortcutsOptions): void => {
  // Register each shortcut
  shortcuts.forEach((shortcut) => {
    const options: UseShortcutOptions =
      typeof shortcut === 'string'
        ? { id: shortcut, enabled }
        : { ...shortcut, enabled: shortcut.enabled ?? enabled };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useShortcut(options);
  });
};
