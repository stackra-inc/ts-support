/**
 * @fileoverview useIsDrawerOpen — detects whether a drawer is currently open.
 *
 * Uses a MutationObserver on `document.body` to watch for the presence
 * of `[data-drawer-backdrop]` elements, which are rendered by the
 * drawer stack system when a drawer is visible.
 *
 * @module command-dock/hooks/use-is-drawer-open
 */

import { useState, useEffect } from 'react';

/**
 * Detects whether a drawer is currently open by observing the DOM
 * for `[data-drawer-backdrop]` elements.
 *
 * @returns `true` if a drawer backdrop is present in the DOM.
 *
 * @example
 * ```tsx
 * function MyDock() {
 *   const drawerOpen = useIsDrawerOpen();
 *   if (drawerOpen) return null; // hide dock
 *   return <DockBar />;
 * }
 * ```
 */
export function useIsDrawerOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    /** Check for drawer backdrop presence. */
    const check = () => {
      setOpen(!!document.querySelector('[data-drawer-backdrop], .drawer-backdrop'));
    };

    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial check
    check();

    return () => observer.disconnect();
  }, []);

  return open;
}
