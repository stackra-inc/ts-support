/**
 * @fileoverview useDrawerPosition — reads the current drawer's position in the stack.
 *
 * Used by DrawerHeader to decide whether to show a back arrow
 * (stacked) or a close button (root), and by StackDots to
 * render position indicators.
 *
 * @module drawer-stack/hooks/use-drawer-position
 */

import { useContext } from 'react';
import { DrawerPositionContext } from '@/contexts/drawer-stack';
import type { DrawerPositionValue } from '@/interfaces';

/**
 * Returns the current drawer's position in the stack.
 *
 * @returns Position data with computed convenience properties.
 *
 * | Property    | Description                                    |
 * |-------------|------------------------------------------------|
 * | `index`     | 0-based position (0 = bottom of stack)         |
 * | `stackSize` | Total drawers in the stack                     |
 * | `isActive`  | Whether this is the topmost drawer             |
 * | `isStacked` | Whether there are drawers below this one       |
 * | `isRoot`    | Whether this is the first/only drawer          |
 *
 * @example
 * ```tsx
 * function MyHeader() {
 *   const { isStacked, isRoot } = useDrawerPosition();
 *   return isStacked ? <BackButton /> : <CloseButton />;
 * }
 * ```
 */
export function useDrawerPosition() {
  const pos = useContext(DrawerPositionContext);

  return {
    ...pos,
    /** Whether there are drawers below this one (index > 0). */
    isStacked: pos.index > 0,
    /** Whether this is the first/only drawer (index === 0). */
    isRoot: pos.index === 0,
  };
}

export type { DrawerPositionValue };
