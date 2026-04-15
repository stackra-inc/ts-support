/**
 * @fileoverview DrawerPositionContext — React context for a drawer's stack position.
 *
 * Each drawer panel wraps its content in this context so that child
 * components (e.g. DrawerHeader) can read their position in the stack.
 *
 * @module drawer-stack/contexts/drawer-position
 */

import { createContext } from 'react';
import type { DrawerPositionValue } from '@/interfaces';

/**
 * Default position value — used when no provider is present.
 * Represents a single, active drawer (index 0, stack size 1).
 */
const DEFAULT_POSITION: DrawerPositionValue = {
  index: 0,
  stackSize: 1,
  isActive: true,
};

/**
 * React context providing the current drawer's position in the stack.
 *
 * Provided by DesktopPanel and MobilePanel components.
 * Consumed by DrawerHeader via `useDrawerPosition()`.
 */
export const DrawerPositionContext = createContext<DrawerPositionValue>(DEFAULT_POSITION);
