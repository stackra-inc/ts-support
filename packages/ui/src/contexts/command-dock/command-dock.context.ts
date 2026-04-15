/**
 * @fileoverview CommandDockContext — React context for the command dock state.
 *
 * @module command-dock/contexts/command-dock
 */

import { createContext } from 'react';
import type { DockContextValue } from '@/interfaces';

/**
 * React context holding the command dock state and operations.
 *
 * Initialized to `null` — the `useCommandDock` hook throws if
 * consumed outside of a `CommandDockProvider`.
 */
export const CommandDockContext = createContext<DockContextValue | null>(null);

CommandDockContext.displayName = 'CommandDockContext';
