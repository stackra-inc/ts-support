/**
 * @fileoverview useCommandDock — consumer hook for the command dock context.
 *
 * Provides access to the dock state, actions, and imperative methods.
 * Must be used within a `CommandDockProvider`.
 *
 * @module command-dock/hooks/use-command-dock
 */

import { useContext } from 'react';
import { CommandDockContext } from '@/contexts/command-dock';
import type { DockContextValue } from '@/interfaces';

/**
 * Access the command dock context.
 *
 * @throws {Error} If called outside of a `CommandDockProvider`.
 *
 * @returns The dock context value with actions, state, and methods.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { primaryAction, isMenuOpen, toggleMenu } = useCommandDock();
 *   return <button onClick={toggleMenu}>Menu</button>;
 * }
 * ```
 */
export function useCommandDock(): DockContextValue {
  const ctx = useContext(CommandDockContext);
  if (!ctx) {
    throw new Error('[CommandDock] useCommandDock must be used within a <CommandDockProvider>.');
  }
  return ctx;
}
