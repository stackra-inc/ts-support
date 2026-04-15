/**
 * @fileoverview useSubView — consumer hook for the sub-view navigator context.
 *
 * @module drawer-stack/hooks/use-sub-view
 */

import { useContext } from 'react';
import { SubViewContext } from '@/contexts/drawer-stack';
import type { SubViewContextValue } from '@/interfaces';

/**
 * Read the sub-view navigator context.
 *
 * @template TView - String literal union of view identifiers.
 * @throws {Error} When called outside a `<SubViewNavigator>`.
 *
 * @example
 * ```tsx
 * function DetailContent() {
 *   const { currentView, goTo, goBack, canGoBack } = useSubView<"list" | "detail">();
 *   return <button onClick={() => goTo("detail")}>View Detail</button>;
 * }
 * ```
 */
export function useSubView<TView extends string = string>(): SubViewContextValue<TView> {
  const ctx = useContext(SubViewContext);

  if (ctx === null) {
    throw new Error(
      '[DrawerStack] useSubView must be used within a <SubViewNavigator>. ' +
        'Wrap your drawer content with <SubViewNavigator>.'
    );
  }

  return ctx as unknown as SubViewContextValue<TView>;
}
