/**
 * @fileoverview DrawerStackProvider — context provider with stack state management.
 *
 * Holds the `DrawerEntry[]` state via `useReducer` and exposes
 * `StackOperations` and read-only stack state via React context.
 *
 * @module drawer-stack/providers/drawer-stack
 */

import React, { useReducer, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { DrawerStackContext } from '@/contexts/drawer-stack';
import { DRAWER_DEFAULTS } from '@/constants';
import type { DrawerConfig } from '@/interfaces';
import type { DrawerEntry } from '@/interfaces';
import type { DrawerStackContextValue } from '@/interfaces';
import type { StackAction } from '@/types';

// ─── Reducer ───────────────────────────────────────────────────────

/**
 * Pure reducer for the drawer stack state.
 *
 * Handles all stack mutations: push, pop, replace, update, clear,
 * popTo, and bringToTop. Singleton detection is handled in PUSH.
 *
 * @param state - Current stack of drawer entries.
 * @param action - The action to apply.
 * @returns New stack state.
 */
function stackReducer<TId extends string = string>(
  state: DrawerEntry<TId>[],
  action: StackAction<TId>
): DrawerEntry<TId>[] {
  switch (action.type) {
    case 'PUSH':
      // Singleton: if a drawer with this id already exists, bring it to top
      if (action.entry.config.singleton) {
        const idx = state.findIndex((e) => e.config.id === action.entry.config.id);
        if (idx !== -1) {
          const existing = state[idx]!;
          return [...state.slice(0, idx), ...state.slice(idx + 1), existing];
        }
      }
      return [...state, action.entry];

    case 'POP':
      return state.length === 0 ? state : state.slice(0, -1);

    case 'REPLACE':
      if (state.length === 0) return [action.entry];
      return [...state.slice(0, -1), action.entry];

    case 'CLEAR':
      return state.length === 0 ? state : [];

    case 'POP_TO': {
      const idx = state.findIndex((e) => e.config.id === action.id);
      if (idx === -1) return state;
      return state.slice(0, idx + 1);
    }

    case 'BRING_TO_TOP': {
      const idx = state.findIndex((e) => e.config.id === action.id);
      if (idx === -1) return state;
      const entry = state[idx]!;
      return [...state.slice(0, idx), ...state.slice(idx + 1), entry];
    }

    case 'UPDATE': {
      const idx = state.findIndex((e) => e.config.id === action.id);
      if (idx === -1) return state;
      return [
        ...state.slice(0, idx),
        { ...state[idx]!, component: action.component },
        ...state.slice(idx + 1),
      ];
    }

    default:
      return state;
  }
}

// ─── Props ─────────────────────────────────────────────────────────

/**
 * Serializable subset of DrawerConfig for localStorage persistence.
 * Excludes `component` and callback functions.
 */
export interface PersistedDrawerState {
  id: string;
  width?: number | string;
  closeOnEscape?: boolean;
  singleton?: boolean;
  metadata?: Record<string, unknown>;
  observeResize?: boolean;
}

/**
 * Props for the DrawerStackProvider component.
 */
export interface DrawerStackProviderProps {
  /** Child components that can access the drawer stack via hooks. */
  children: ReactNode;

  /** Key for localStorage persistence. Omit to disable persistence. */
  persistKey?: string;

  /** Called on mount with persisted drawer IDs. Consumer re-pushes drawers. */
  onRestore?: (ids: string[]) => void;

  /** Enable Ctrl+Tab keyboard navigation between drawers. Defaults to false. */
  enableKeyboardNavigation?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────

/**
 * Provides the drawer stack context to the component tree.
 *
 * Wrap your application (or the section that uses drawers) with this provider.
 * All `useDrawerStack()` calls must be within this provider's subtree.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <DrawerStackProvider>
 *       <Layout />
 *       <DrawerContainer />
 *     </DrawerStackProvider>
 *   );
 * }
 * ```
 */
export function DrawerStackProvider({
  children,
  persistKey,
  onRestore,
  enableKeyboardNavigation,
}: DrawerStackProviderProps): React.JSX.Element {
  const [stack, dispatch] = useReducer(stackReducer, []);

  /** Ref to current stack — allows pop() to read onBeforeClose without stale closures. */
  const stackRef = React.useRef(stack);
  stackRef.current = stack;

  /** Push a new drawer onto the stack. Invokes onBeforeOpen guard if provided. */
  const push = useCallback(async (config: DrawerConfig, component: ReactNode) => {
    // Check onBeforeOpen guard
    if (config.onBeforeOpen) {
      try {
        const allowed = await config.onBeforeOpen();
        if (!allowed) return;
      } catch {
        // If the guard throws, treat as "don't open"
        return;
      }
    }

    if (stackRef.current.length >= DRAWER_DEFAULTS.MAX_STACK_DEPTH) {
      try {
        console.warn(
          `[DrawerStack] Stack depth (${stackRef.current.length + 1}) exceeds MAX_STACK_DEPTH (${DRAWER_DEFAULTS.MAX_STACK_DEPTH}). ` +
            `Z-index values will be clamped. Consider reducing stack depth.`
        );
      } catch {}
    }
    const entry: DrawerEntry = {
      instanceId: crypto.randomUUID(),
      config,
      component,
      triggerElement: document.activeElement,
    };
    dispatch({ type: 'PUSH', entry });
  }, []);

  /**
   * Pop the topmost drawer.
   * If the active drawer has `onBeforeClose`, it is called first.
   * If it returns `false`, the pop is cancelled.
   *
   * @returns `true` if the pop succeeded, `false` if empty or blocked.
   */
  const pop = useCallback((): Promise<boolean> | boolean => {
    const current = stackRef.current;
    if (current.length === 0) return false;

    const top = current[current.length - 1]!;
    const guard = top.config.onBeforeClose;

    if (guard) {
      try {
        const result = guard();

        // Async guard — return a promise
        if (result instanceof Promise) {
          return result
            .then((allowed) => {
              if (!allowed) return false;
              dispatch({ type: 'POP' });
              return true;
            })
            .catch(() => false);
        }

        // Sync guard — no microtask deferral
        if (!result) return false;
      } catch {
        return false;
      }
    }

    dispatch({ type: 'POP' });
    return true;
  }, []);

  /** Remove all drawers. */
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  /** Replace the topmost drawer. */
  const replace = useCallback((config: DrawerConfig, component: ReactNode) => {
    const entry: DrawerEntry = {
      instanceId: crypto.randomUUID(),
      config,
      component,
      triggerElement: document.activeElement,
    };
    dispatch({ type: 'REPLACE', entry });
  }, []);

  /** Pop all drawers above the specified id. */
  const popTo = useCallback((id: string) => dispatch({ type: 'POP_TO', id }), []);

  /** Update the component of an existing drawer. */
  const update = useCallback(
    <TId extends string>(id: TId, component: ReactNode) =>
      dispatch({ type: 'UPDATE', id, component }),
    []
  );

  /**
   * Force-pop without checking onBeforeClose.
   * Used when the user explicitly confirms dismissal (e.g. from a toast action).
   */
  const forcePop = useCallback(() => dispatch({ type: 'POP' }), []);

  /** Bring an existing drawer to the top of the stack. */
  const bringToTop = useCallback((id: string) => dispatch({ type: 'BRING_TO_TOP', id }), []);

  // ── Persistence: write stack to localStorage on every change ──
  React.useEffect(() => {
    if (!persistKey) return;
    try {
      const serializable: PersistedDrawerState[] = stack.map((entry) => ({
        id: entry.config.id,
        width: entry.config.width,
        closeOnEscape: entry.config.closeOnEscape,
        singleton: entry.config.singleton,
        metadata: entry.config.metadata,
        observeResize: entry.config.observeResize,
      }));
      localStorage.setItem(persistKey, JSON.stringify(serializable));
    } catch (err) {
      try {
        console.warn('[DrawerStack] Failed to persist stack state:', err);
      } catch {}
    }
  }, [stack, persistKey]);

  // ── Persistence: restore from localStorage on mount ──
  React.useEffect(() => {
    if (!persistKey) return;
    try {
      const raw = localStorage.getItem(persistKey);
      if (!raw) return;
      const persisted: PersistedDrawerState[] = JSON.parse(raw);
      const ids = persisted.map((p) => p.id);
      if (ids.length > 0 && onRestore) {
        onRestore(ids);
      }
    } catch (err) {
      try {
        console.warn('[DrawerStack] Failed to restore persisted state:', err);
      } catch {}
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Memoized context value — only changes when the stack changes. */
  const value = useMemo<DrawerStackContextValue>(
    () => ({
      stack,
      isOpen: stack.length > 0,
      activeDrawer: stack.length > 0 ? stack[stack.length - 1] : undefined,
      operations: {
        push,
        pop,
        replace,
        update,
        clear,
        popTo,
        forcePop,
        bringToTop,
      },
      enableKeyboardNavigation: enableKeyboardNavigation ?? false,
    }),
    [
      stack,
      push,
      pop,
      replace,
      update,
      clear,
      popTo,
      forcePop,
      bringToTop,
      enableKeyboardNavigation,
    ]
  );

  return <DrawerStackContext.Provider value={value}>{children}</DrawerStackContext.Provider>;
}
