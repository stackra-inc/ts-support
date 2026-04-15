/**
 * @fileoverview DrawerLoading interfaces.
 *
 * @module drawer-stack/interfaces/drawer-loading
 */

import type { ReactNode } from 'react';

/** Visual variant for the DrawerLoading component. */
export type DrawerLoadingVariant = 'spinner' | 'skeleton' | 'overlay';

export interface DrawerLoadingProps {
  /** Whether the loading state is active. */
  isLoading: boolean;
  /** Visual variant. @default "spinner" */
  variant?: DrawerLoadingVariant;
  /** Optional text label shown with spinner/overlay variants. */
  label?: string;
  /** Number of skeleton lines for the "skeleton" variant. @default 5 */
  lines?: number;
  /** Additional CSS class names. */
  className?: string;
  /** Content to render behind the overlay (only used with "overlay" variant). */
  children?: ReactNode;
}
