/**
 * @fileoverview DrawerStackContext — React context for the drawer stack state.
 *
 * Holds the full stack state and mutation operations. Consumed by
 * `useDrawerStack()` hook. Provided by `DrawerStackProvider`.
 *
 * @module drawer-stack/contexts/drawer-stack
 */

import { createContext } from 'react';
import type { DrawerStackContextValue } from '@/interfaces';

/**
 * React context for the drawer stack.
 *
 * `null` when no provider is present — the `useDrawerStack()` hook
 * throws a descriptive error in this case.
 */
export const DrawerStackContext = createContext<DrawerStackContextValue | null>(null);
