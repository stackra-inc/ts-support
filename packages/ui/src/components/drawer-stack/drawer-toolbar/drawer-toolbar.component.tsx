/**
 * @fileoverview DrawerToolbar — horizontal action bar between Header and Content.
 *
 * Renders a toolbar strip with configurable visual variants.
 * Place between `Drawer.Header` and `Drawer.Content` for contextual actions.
 *
 * @module drawer-stack/components/drawer-toolbar
 */

import React from 'react';
import { ScopedSlot } from '@/components/drawer-stack/scoped-slot';
import { DRAWER_SLOTS } from '@/constants';

export interface DrawerToolbarProps {
  children: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
  /**
   * Visual variant.
   * - `"default"`: border-bottom, standard padding, surface background.
   * - `"compact"`: smaller padding, no background.
   * - `"transparent"`: no border, no background.
   *
   * @default "default"
   */
  variant?: 'default' | 'compact' | 'transparent';
}

const VARIANT_CLASSES: Record<NonNullable<DrawerToolbarProps['variant']>, string> = {
  default: 'px-4 py-2 border-b border-border bg-surface',
  compact: 'px-3 py-1',
  transparent: '',
};

/**
 * Horizontal action bar rendered between the drawer header and content.
 *
 * @example
 * ```tsx
 * <Drawer.Header title="Orders" />
 * <Drawer.Toolbar>
 *   <Button size="sm">Filter</Button>
 *   <Button size="sm">Sort</Button>
 * </Drawer.Toolbar>
 * <Drawer.Content>...</Drawer.Content>
 * ```
 */
export function DrawerToolbar({
  children,
  className,
  variant = 'default',
}: DrawerToolbarProps): React.JSX.Element {
  return (
    <>
      <ScopedSlot name={DRAWER_SLOTS.TOOLBAR.BEFORE} />
      <div
        className={`flex items-center gap-2 ${VARIANT_CLASSES[variant]} ${className ?? ''}`}
        role="toolbar"
      >
        {children}
      </div>
      <ScopedSlot name={DRAWER_SLOTS.TOOLBAR.AFTER} />
    </>
  );
}
