/**
 * @fileoverview SubViewContext — React context for the sub-view navigator.
 *
 * Allows child components within a SubViewNavigator to read the
 * current view state and navigate between views.
 *
 * @module drawer-stack/contexts/sub-view
 */

import { createContext } from 'react';
import type { SubViewContextValue } from '@/interfaces';

/**
 * React context for the sub-view navigator.
 *
 * `null` when no SubViewNavigator is present — the `useSubView()` hook
 * throws a descriptive error in this case.
 */
export const SubViewContext = createContext<SubViewContextValue | null>(null);
