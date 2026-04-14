/**
 * @fileoverview Hook for registering and using keyboard shortcuts from the registry.
 *
 * This hook provides a declarative way to register shortcuts by ID with automatic cleanup.
 * It integrates with the ShortcutRegistry to enable/disable shortcuts and handle their lifecycle.
 *
 * @module @abdokouta/kbd
 * @category Hooks
 */

import { useEffect, useCallback } from 'react';
import { shortcutRegistry } from '@/registries/shortcut.registry';
import type { KeyboardShortcut } from '@/interfaces/keyboard-shortcut.interface';

/**
 * Options for the useShortcut hook.
 *
 * @category Hooks
 * @public
 */
export interface UseShortcutOptions {
  /**
   * The ID of the shortcut to register/use from the registry.
   *
   * @example
   * ```tsx
   * id: "search.open"
   * id: "navigation.back"
   * ```
   */
  id: string;

  /**
   * Callback function to execute when the keyboard shortcut is triggered.
   * If not provided, uses the callback from the registered shortcut.
   */
  callback?: () => void;

  /**
   * Whether the shortcut is enabled.
   *
   * @defaultValue true
   */
  enabled?: boolean;

  /**
   * Whether to prevent the default browser behavior for this shortcut.
   * If not provided, uses the value from the registered shortcut.
   */
  preventDefault?: boolean;

  /**
   * Whether to stop event propagation.
   * If not provided, uses the value from the registered shortcut.
   */
  stopPropagation?: boolean;
}

/**
 * Custom hook for using keyboard shortcuts from the registry.
 *
 * This hook registers a shortcut by ID and automatically handles cleanup.
 * It enables the shortcut when the component mounts and disables it when unmounted.
 *
 * @example
 * Basic usage with registered shortcut:
 * ```tsx
 * useShortcut({
 *   id: "search.open",
 *   callback: () => {
 *     setSearchOpen(true);
 *   },
 * });
 * ```
 *
 * @example
 * With conditional enabling:
 * ```tsx
 * useShortcut({
 *   id: "editing.save",
 *   callback: handleSave,
 *   enabled: isEditing && hasChanges,
 * });
 * ```
 *
 * @param options - Hook options
 *
 * @category Hooks
 * @public
 */
export const useShortcut = ({
  id,
  callback,
  enabled = true,
  preventDefault,
  stopPropagation,
}: UseShortcutOptions): void => {
  /**
   * Memoized callback to avoid unnecessary re-renders
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const shortcut = shortcutRegistry.get(id);
      if (!shortcut || !shortcut.enabled) return;

      // Check if shortcut condition is met
      if (shortcut.condition && !shortcut.condition()) {
        return;
      }

      // Check if we're in an input and shortcut doesn't allow it
      if (!shortcut.allowInInput) {
        const target = event.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      // Get platform-specific keys
      const keys = shortcutRegistry.resolveKeys(shortcut.keys);
      if (!keys || keys.length === 0) return;

      // Check if all required keys are pressed
      const modifierKeys = {
        command: event.metaKey,
        cmd: event.metaKey,
        meta: event.metaKey,
        ctrl: event.ctrlKey,
        control: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        option: event.altKey,
        win: event.metaKey,
      };

      let allKeysPressed = true;
      let hasNonModifier = false;

      for (const key of keys) {
        const lowerKey = key.toLowerCase();

        // Check modifier keys
        if (lowerKey in modifierKeys) {
          if (!modifierKeys[lowerKey as keyof typeof modifierKeys]) {
            allKeysPressed = false;
            break;
          }
        } else {
          // Check regular keys
          hasNonModifier = true;
          if (
            event.key.toLowerCase() !== lowerKey &&
            event.code.toLowerCase() !== lowerKey.toLowerCase()
          ) {
            allKeysPressed = false;
            break;
          }
        }
      }

      // Must have at least one non-modifier key
      if (!hasNonModifier) {
        allKeysPressed = false;
      }

      if (allKeysPressed) {
        const shouldPreventDefault = preventDefault ?? shortcut.preventDefault ?? true;
        const shouldStopPropagation = stopPropagation ?? shortcut.stopPropagation ?? false;

        if (shouldPreventDefault) {
          event.preventDefault();
        }
        if (shouldStopPropagation) {
          event.stopPropagation();
        }

        // Execute callback
        if (callback) {
          callback();
        } else if (shortcut.callback) {
          shortcut.callback();
        }
      }
    },
    [id, callback, enabled, preventDefault, stopPropagation]
  );

  /**
   * Register and cleanup keyboard event listener
   */
  useEffect(() => {
    if (!enabled) return;

    // Check if shortcut exists
    if (!shortcutRegistry.has(id)) {
      console.warn(`[useShortcut] Shortcut with id "${id}" not found in registry`);
      return;
    }

    // Enable the shortcut
    shortcutRegistry.enable(id);

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      // Disable the shortcut
      shortcutRegistry.disable(id);

      // Remove event listener
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [id, handleKeyDown, enabled]);
};
