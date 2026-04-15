/**
 * @fileoverview StackOperations interface — mutation operations for the drawer stack.
 *
 * Defines all the operations that consumers can perform on the drawer stack
 * via the `useDrawerStack().operations` object.
 *
 * @module drawer-stack/interfaces/stack-operations
 */

import type { ReactNode } from 'react';
import type { DrawerConfig } from './drawer-config.interface';

/**
 * Stack mutation operations exposed via the drawer stack context.
 *
 * All operations are stable `useCallback` references — safe to use
 * in dependency arrays without causing re-renders.
 *
 * @template TId - String literal type for drawer identifiers.
 *
 * @example
 * ```tsx
 * const { operations } = useDrawerStack();
 * operations.push({ id: "checkout", width: 680 }, <CheckoutDrawer />);
 * operations.pop();
 * operations.clear();
 * ```
 */
export interface StackOperations<TId extends string = string> {
  /**
   * Push a new drawer onto the top of the stack.
   *
   * If the drawer's config has `singleton: true` and a drawer with the
   * same `id` already exists, the existing one is brought to the top
   * instead of creating a duplicate.
   *
   * @param config - Drawer configuration (id, width, behavior).
   * @param component - React node to render inside the drawer.
   */
  push: (config: DrawerConfig<TId>, component: ReactNode) => void | Promise<void>;

  /**
   * Remove the topmost drawer from the stack.
   *
   * If the active drawer has an `onBeforeClose` guard, it is called first.
   * Returns `true` if the pop succeeded, `false` if the stack was empty
   * or the guard blocked the dismissal.
   *
   * @returns Whether the pop was executed.
   */
  pop: () => Promise<boolean> | boolean;

  /**
   * Replace the topmost drawer with a new one.
   * If the stack is empty, the new drawer becomes the only entry.
   *
   * @param config - Drawer configuration for the replacement.
   * @param component - React node to render inside the replacement drawer.
   */
  replace: (config: DrawerConfig<TId>, component: ReactNode) => void;

  /**
   * Update the component of an existing drawer without changing its position.
   * Useful for refreshing drawer content (e.g. after a time slot selection).
   *
   * @param id - The drawer id to update.
   * @param component - New React node to render.
   */
  update: (id: TId, component: ReactNode) => void;

  /**
   * Remove all drawers from the stack.
   * Triggers exit animations for all panels.
   */
  clear: () => void;

  /**
   * Pop all drawers above the specified id, making it the topmost.
   * No-op if the id is not found in the stack.
   *
   * @param id - The drawer id to pop to.
   */
  popTo: (id: TId) => void;

  /**
   * Force-pop the topmost drawer without checking `onBeforeClose`.
   * Use when the user has explicitly confirmed dismissal (e.g. from a toast action).
   */
  forcePop: () => void;

  /**
   * Bring an existing drawer to the top of the stack without removing others.
   * Useful for switching between open drawers (forward/backward navigation).
   * No-op if the id is not found in the stack.
   *
   * @param id - The drawer id to bring to top.
   */
  bringToTop: (id: TId) => void;
}

/**
 * Full context value for the drawer stack.
 *
 * Combines read-only stack state with mutation operations.
 *
 * @template TId - String literal type for drawer identifiers.
 */
export interface DrawerStackContextValue<TId extends string = string> {
  /** The current stack of drawer entries (read-only). Bottom = index 0. */
  stack: ReadonlyArray<import('./drawer-entry.interface').DrawerEntry<TId>>;

  /** Whether any drawers are currently open. */
  isOpen: boolean;

  /** The topmost (active) drawer entry, or undefined if stack is empty. */
  activeDrawer: import('./drawer-entry.interface').DrawerEntry<TId> | undefined;

  /** Mutation operations for the stack. */
  operations: StackOperations<TId>;

  /** Whether keyboard navigation between drawers is enabled. */
  enableKeyboardNavigation: boolean;
}
