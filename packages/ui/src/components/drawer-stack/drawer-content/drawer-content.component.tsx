/**
 * @fileoverview DrawerContent — scrollable content area for drawers.
 *
 * Renamed from DrawerBody. Includes scoped slot positions for injecting
 * content before/after the body.
 *
 * @module drawer-stack/components/drawer-content
 */

import React from 'react';
import { ScopedSlot } from '@/components/drawer-stack/scoped-slot';
import { DRAWER_SLOTS } from '@/constants';

export interface DrawerContentProps {
  children: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
  /** Padding preset. @default "default" */
  padding?: 'none' | 'compact' | 'default' | 'spacious';
}

const PADDING_MAP = {
  none: '',
  compact: 'px-4 py-3',
  default: 'px-6 py-4',
  spacious: 'px-8 py-6',
} as const;

/**
 * Scrollable content area for drawer content.
 * Fills remaining space between header and footer.
 *
 * Slot positions:
 * - `drawer.content.before` — top of scrollable area, before children
 * - `drawer.content.after` — bottom of scrollable area, after children
 */
export function DrawerContent({
  children,
  className,
  padding = 'default',
}: DrawerContentProps): React.JSX.Element {
  return (
    <div className={`flex-1 min-h-0 overflow-y-auto ${PADDING_MAP[padding]} ${className ?? ''}`}>
      <ScopedSlot name={DRAWER_SLOTS.CONTENT.BEFORE} />
      {children}
      <ScopedSlot name={DRAWER_SLOTS.CONTENT.AFTER} />
    </div>
  );
}
