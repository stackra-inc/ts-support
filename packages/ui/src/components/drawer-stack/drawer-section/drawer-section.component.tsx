/**
 * @fileoverview DrawerSection — labeled content group within a drawer body.
 *
 * Groups related content with an optional title and description.
 * Use inside `Drawer.Content` to structure form fields, lists, or info blocks.
 *
 * @module drawer-stack/components/drawer-section
 */

import React from 'react';
import { ScopedSlot } from '@/components/drawer-stack/scoped-slot';
import { DRAWER_SLOTS } from '@/constants';

export interface DrawerSectionProps {
  children: React.ReactNode;
  /** Section title. */
  title?: string;
  /** Optional description below the title. */
  description?: string;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Labeled content section for structuring drawer body content.
 *
 * @example
 * ```tsx
 * <Drawer.Content>
 *   <Drawer.Section title="Personal Info">
 *     <input ... />
 *   </Drawer.Section>
 *   <Drawer.Divider />
 *   <Drawer.Section title="Preferences">
 *     <select ... />
 *   </Drawer.Section>
 * </Drawer.Content>
 * ```
 */
export function DrawerSection({
  children,
  title,
  description,
  className,
}: DrawerSectionProps): React.JSX.Element {
  return (
    <>
      <ScopedSlot name={DRAWER_SLOTS.SECTION.BEFORE} />
      <div className={`py-3 ${className ?? ''}`}>
        {title && (
          <div className="mb-3">
            <ScopedSlot name={DRAWER_SLOTS.SECTION.BEFORE_TITLE} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{title}</h3>
            {description && <p className="text-[11px] text-muted/70 mt-0.5">{description}</p>}
            <ScopedSlot name={DRAWER_SLOTS.SECTION.AFTER_TITLE} />
          </div>
        )}
        {children}
      </div>
      <ScopedSlot name={DRAWER_SLOTS.SECTION.AFTER} />
    </>
  );
}
