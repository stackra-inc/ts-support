/**
 * @fileoverview useDrawerId — reads the current drawer's config ID from context.
 *
 * @module drawer-stack/hooks/use-drawer-id
 */

import { useContext } from 'react';
import { DrawerIdContext } from '@/contexts/drawer-stack';

/**
 * Returns the current drawer's `config.id`, or `null` if no provider is present.
 */
export function useDrawerId(): string | null {
  return useContext(DrawerIdContext);
}
