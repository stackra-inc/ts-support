/**
 * useSlot Hook
 *
 * |--------------------------------------------------------------------------
 * | Reactive hook for reading slot entries from the registry.
 * |--------------------------------------------------------------------------
 * |
 * | Subscribes to the slotRegistry and re-renders when entries change.
 * | Used internally by the `<Slot>` component, but also available
 * | for custom slot rendering logic.
 * |
 * | Usage:
 * |   const entries = useSlot("login.after.header");
 * |   const hasFooter = useHasSlot("dashboard.footer");
 * |
 * @module hooks/use-slot
 */

import { useSyncExternalStore, useCallback } from 'react';
import { slotRegistry } from '@/registries/slot.registry';
import type { SlotEntry } from '@/interfaces/slot-entry.interface';

/**
 * Returns all entries registered at the given slot name, sorted by priority.
 * Re-renders when the registry changes.
 */
export function useSlot(name: string): SlotEntry[] {
  /*
  |--------------------------------------------------------------------------
  | useSyncExternalStore ensures the component re-renders when
  | the registry notifies listeners of a change.
  |--------------------------------------------------------------------------
  */
  const subscribe = useCallback(
    (onStoreChange: () => void) => slotRegistry.subscribe(onStoreChange),
    []
  );

  const getSnapshot = useCallback(() => slotRegistry.getEntries(name), [name]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Returns true if the given slot has any registered entries.
 * Re-renders when the registry changes.
 */
export function useHasSlot(name: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => slotRegistry.subscribe(onStoreChange),
    []
  );

  const getSnapshot = useCallback(() => slotRegistry.hasEntries(name), [name]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
