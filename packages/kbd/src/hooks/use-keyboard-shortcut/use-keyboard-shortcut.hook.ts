import { useEffect, useCallback } from 'react';
import type { KeyValue } from '@/types';

/**
 * Options for the useKeyboardShortcut hook.
 *
 * @category Hooks
 * @public
 */
export interface UseKeyboardShortcutOptions {
  /**
   * Array of keys that must be pressed to trigger the callback.
   * Can include modifier keys and regular keys.
   *
   * @example
   * ```tsx
   * keys: ["command", "K"]
   * keys: ["ctrl", "shift", "P"]
   * ```
   */
  keys: (KeyValue | string)[];

  /**
   * Callback function to execute when the keyboard shortcut is triggered.
   */
  callback: () => void;

  /**
   * Whether the shortcut is enabled.
   *
   * @defaultValue true
   */
  enabled?: boolean;

  /**
   * Whether to prevent the default browser behavior for this shortcut.
   *
   * @defaultValue true
   */
  preventDefault?: boolean;
}

/**
 * Custom hook for handling keyboard shortcuts in refine applications.
 *
 * This hook provides a declarative way to register keyboard shortcuts
 * and execute callbacks when they are triggered.
 *
 * @example
 * Basic usage:
 * ```tsx
 * useKeyboardShortcut({
 *   keys: ["command", "K"],
 *   callback: () => {
 *     console.log("Command+K pressed");
 *   },
 * });
 * ```
 *
 * @example
 * With conditional enabling:
 * ```tsx
 * useKeyboardShortcut({
 *   keys: ["ctrl", "S"],
 *   callback: handleSave,
 *   enabled: isEditing,
 *   preventDefault: true,
 * });
 * ```
 *
 * @param options - Hook options
 *
 * @category Hooks
 * @public
 */
export const useKeyboardShortcut = ({
  keys,
  callback,
  enabled = true,
  preventDefault = true,
}: UseKeyboardShortcutOptions): void => {
  /**
   * Memoized callback to avoid unnecessary re-renders
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if all required keys are pressed
      const modifierKeys = {
        command: event.metaKey,
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        option: event.altKey,
        win: event.metaKey,
      };

      let allKeysPressed = true;

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
          if (event.key.toLowerCase() !== lowerKey) {
            allKeysPressed = false;
            break;
          }
        }
      }

      if (allKeysPressed) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    },
    [keys, callback, enabled, preventDefault]
  );

  /**
   * Register and cleanup keyboard event listener
   */
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
};
