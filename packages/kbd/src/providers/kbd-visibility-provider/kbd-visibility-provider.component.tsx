/**
 * @fileoverview KbdVisibilityProvider
 *
 * Wraps the app to control whether shortcut hints are visible.
 * Persists the preference to localStorage.
 *
 * @module components/kbd-visibility-provider
 *
 * @example
 * ```tsx
 * <KbdVisibilityProvider defaultVisible={true} storageKey="kbd:visible">
 *   <App />
 * </KbdVisibilityProvider>
 * ```
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { KbdVisibilityContext } from '@/contexts/kbd-visibility.context';

export interface KbdVisibilityProviderProps {
  children: React.ReactNode;
  /** Initial visibility state. @default true */
  defaultVisible?: boolean;
  /** localStorage key for persistence. Set to null to disable persistence. */
  storageKey?: string | null;
}

/**
 * Provider that controls shortcut hint visibility app-wide.
 *
 * Reads initial state from localStorage (if storageKey is set),
 * and persists changes back. All `<ShortcutHint>` components
 * read from this context.
 */
export function KbdVisibilityProvider({
  children,
  defaultVisible = true,
  storageKey = 'kbd:hints-visible',
}: KbdVisibilityProviderProps) {
  const [visible, setVisibleState] = useState<boolean>(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored !== null) return stored === 'true';
      } catch {
        /* ignore */
      }
    }
    return defaultVisible;
  });

  /** Persist to localStorage on change */
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, String(visible));
      } catch {
        /* ignore */
      }
    }
  }, [visible, storageKey]);

  const toggle = useCallback(() => setVisibleState((v) => !v), []);
  const setVisible = useCallback((v: boolean) => setVisibleState(v), []);

  const value = useMemo(() => ({ visible, toggle, setVisible }), [visible, toggle, setVisible]);

  return <KbdVisibilityContext.Provider value={value}>{children}</KbdVisibilityContext.Provider>;
}
