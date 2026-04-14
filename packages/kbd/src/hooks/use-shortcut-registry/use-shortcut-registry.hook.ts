/**
 * @fileoverview Hook for accessing the keyboard shortcut registry in components.
 *
 * This hook provides access to the ShortcutRegistry for querying, registering,
 * and managing shortcuts from within React components.
 *
 * @module @abdokouta/kbd
 * @category Hooks
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  KeyboardShortcut,
  ShortcutCategory,
  ShortcutContext,
  ShortcutQueryOptions,
} from '@/interfaces';
import { shortcutRegistry } from '@/registries/shortcut.registry';

/**
 * Return type for the useShortcutRegistry hook.
 *
 * @category Hooks
 * @public
 */
export interface UseShortcutRegistryReturn {
  /**
   * Get a shortcut by ID.
   */
  get: (id: string) => KeyboardShortcut | undefined;

  /**
   * Check if a shortcut exists.
   */
  has: (id: string) => boolean;

  /**
   * Get all registered shortcuts.
   */
  getAll: () => KeyboardShortcut[];

  /**
   * Get shortcuts by category.
   */
  getByCategory: (category: ShortcutCategory) => KeyboardShortcut[];

  /**
   * Get shortcuts by context.
   */
  getByContext: (context: ShortcutContext) => KeyboardShortcut[];

  /**
   * Query shortcuts with filters.
   */
  query: (options: ShortcutQueryOptions) => KeyboardShortcut[];

  /**
   * Register a new shortcut.
   */
  register: (shortcut: KeyboardShortcut) => void;

  /**
   * Unregister a shortcut.
   */
  unregister: (id: string) => void;

  /**
   * Enable a shortcut.
   */
  enable: (id: string) => void;

  /**
   * Disable a shortcut.
   */
  disable: (id: string) => void;

  /**
   * Toggle a shortcut's enabled state.
   */
  toggle: (id: string) => void;

  /**
   * Subscribe to registry changes.
   */
  subscribe: (callback: () => void) => () => void;
}

/**
 * Custom hook for accessing the keyboard shortcut registry.
 *
 * This hook provides a React-friendly interface to the ShortcutRegistry,
 * with automatic re-rendering when the registry changes.
 *
 * @example
 * Basic usage:
 * ```tsx
 * function ShortcutList() {
 *   const registry = useShortcutRegistry();
 *   const shortcuts = registry.getAll();
 *
 *   return (
 *     <ul>
 *       {shortcuts.map(shortcut => (
 *         <li key={shortcut.id}>{shortcut.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 *
 * @example
 * With filtering:
 * ```tsx
 * function NavigationShortcuts() {
 *   const registry = useShortcutRegistry();
 *   const navShortcuts = registry.getByCategory("navigation");
 *
 *   return (
 *     <div>
 *       {navShortcuts.map(shortcut => (
 *         <ShortcutItem key={shortcut.id} shortcut={shortcut} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * With dynamic registration:
 * ```tsx
 * function CustomShortcut() {
 *   const registry = useShortcutRegistry();
 *
 *   const handleRegister = () => {
 *     registry.register({
 *       id: "custom.action",
 *       name: "Custom Action",
 *       keys: ["ctrl", "shift", "X"],
 *       callback: () => console.log("Custom action!"),
 *       category: "custom",
 *       context: "global",
 *     });
 *   };
 *
 *   return <button onClick={handleRegister}>Register Shortcut</button>;
 * }
 * ```
 *
 * @returns Registry interface with methods for managing shortcuts
 *
 * @category Hooks
 * @public
 */
export const useShortcutRegistry = (): UseShortcutRegistryReturn => {
  const [, setUpdateTrigger] = useState(0);

  // Force re-render when registry changes
  const forceUpdate = useCallback(() => {
    setUpdateTrigger((prev) => prev + 1);
  }, []);

  // Subscribe to registry changes
  useEffect(() => {
    const unsubscribe = shortcutRegistry.subscribe(forceUpdate);
    return unsubscribe;
  }, [forceUpdate]);

  return {
    get: shortcutRegistry.get.bind(shortcutRegistry),
    has: shortcutRegistry.has.bind(shortcutRegistry),
    getAll: shortcutRegistry.getAll.bind(shortcutRegistry),
    getByCategory: shortcutRegistry.getByCategory.bind(shortcutRegistry),
    getByContext: shortcutRegistry.getByContext.bind(shortcutRegistry),
    query: shortcutRegistry.query.bind(shortcutRegistry),
    register: shortcutRegistry.register.bind(shortcutRegistry),
    unregister: shortcutRegistry.unregister.bind(shortcutRegistry),
    enable: shortcutRegistry.enable.bind(shortcutRegistry),
    disable: shortcutRegistry.disable.bind(shortcutRegistry),
    toggle: shortcutRegistry.toggle.bind(shortcutRegistry),
    subscribe: shortcutRegistry.subscribe.bind(shortcutRegistry),
  };
};
