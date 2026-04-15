/**
 * @fileoverview DrawerIdContext — React context for the current drawer's config ID.
 *
 * Provides the drawer ID to child components so they can build
 * scoped slot names (e.g., `drawer.checkout.header.before`).
 *
 * @module drawer-stack/contexts/drawer-id
 */

import { createContext } from 'react';

/**
 * React context providing the current drawer's `config.id`.
 *
 * Provided by DesktopPanel and MobilePanel components.
 * Consumed via `useDrawerId()`.
 */
export const DrawerIdContext = createContext<string | null>(null);
