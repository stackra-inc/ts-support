/**
 * @fileoverview DrawerSubHeader — secondary info bar below the main header.
 *
 * Slot positions:
 * - `drawer.sub-header.before`
 * - `drawer.sub-header.after`
 *
 * @module drawer-stack/components/drawer-sub-header
 */

import React from 'react';
import { Slot } from '@/components/slot';
import { DRAWER_SLOTS } from '@/constants';

export interface DrawerSubHeaderProps {
  children: React.ReactNode;
  className?: string;
  /** @default "default" */
  variant?: 'default' | 'tabs' | 'info';
}

export function DrawerSubHeader({
  children,
  className,
  variant = 'default',
}: DrawerSubHeaderProps): React.JSX.Element {
  const base = 'shrink-0 px-4 md:px-5';
  const variants = {
    default: 'py-2 border-b border-separator bg-surface/50',
    tabs: 'border-b border-separator',
    info: 'py-2 border-b border-accent/20 bg-accent/5',
  };

  return (
    <>
      <Slot name={DRAWER_SLOTS.SUB_HEADER.BEFORE} />
      <div className={`${base} ${variants[variant]} ${className ?? ''}`}>{children}</div>
      <Slot name={DRAWER_SLOTS.SUB_HEADER.AFTER} />
    </>
  );
}
