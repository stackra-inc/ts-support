/**
 * @fileoverview useDrawerStack — consumer hook for the drawer stack context.
 *
 * Provides access to the full stack state and mutation operations.
 * Must be called within a `<DrawerStackProvider>`.
 *
 * @module drawer-stack/hooks/use-drawer-stack
 */

import { useContext } from 'react';
import { DrawerStackContext } from '@/contexts/drawer-stack';
import type { DrawerStackContextValue } from '@/interfaces';

/**
 * Read the drawer stack context.
 *
 * Returns the full stack state (entries, isOpen, activeDrawer) and
 * mutation operations (push, pop, replace, update, clear, popTo).
 *
 * @template TId - String literal type for drawer identifiers.
 * @throws {Error} When called outside a `<DrawerStackProvider>`.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { operations: { push, pop }, isOpen, stack } = useDrawerStack();
 *
 *   return (
 *     <button onClick={() => push({ id: "detail" }, <DetailDrawer />)}>
 *       Open Detail
 *     </button>
 *   );
 * }
 * ```
 */
export function useDrawerStack<TId extends string = string>(): DrawerStackContextValue<TId> {
  const ctx = useContext(DrawerStackContext);

  if (ctx === null) {
    throw new Error(
      '[DrawerStack] useDrawerStack must be used within a <DrawerStackProvider>. ' +
        'Wrap your component tree with <DrawerStackProvider>.'
    );
  }

  return ctx as unknown as DrawerStackContextValue<TId>;
}
