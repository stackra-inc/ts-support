/**
 * @fileoverview DrawerDivider — visual separator for drawer content.
 *
 * A horizontal rule with optional label text.
 * Use between `Drawer.Section` blocks or anywhere in `Drawer.Content`.
 *
 * @module drawer-stack/components/drawer-divider
 */

import React from 'react';
import { ScopedSlot } from '@/components/drawer-stack/scoped-slot';
import { DRAWER_SLOTS } from '@/constants';

export interface DrawerDividerProps {
  /** Optional label text centered on the divider line. */
  label?: string;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Horizontal divider for separating drawer content sections.
 *
 * @example
 * ```tsx
 * <Drawer.Divider />
 * <Drawer.Divider label="or" />
 * ```
 */
export function DrawerDivider({ label, className }: DrawerDividerProps): React.JSX.Element {
  if (label) {
    return (
      <>
        <ScopedSlot name={DRAWER_SLOTS.DIVIDER.BEFORE} />
        <div className={`flex items-center gap-3 my-2 ${className ?? ''}`}>
          <div className="flex-1 h-px bg-separator" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted shrink-0">
            {label}
          </span>
          <div className="flex-1 h-px bg-separator" />
        </div>
        <ScopedSlot name={DRAWER_SLOTS.DIVIDER.AFTER} />
      </>
    );
  }

  return (
    <>
      <ScopedSlot name={DRAWER_SLOTS.DIVIDER.BEFORE} />
      <div className={`h-px bg-separator my-2 ${className ?? ''}`} role="separator" />
      <ScopedSlot name={DRAWER_SLOTS.DIVIDER.AFTER} />
    </>
  );
}
