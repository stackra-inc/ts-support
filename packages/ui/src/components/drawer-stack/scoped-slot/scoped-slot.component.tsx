/**
 * @fileoverview ScopedSlot — renders both global and drawer-ID-scoped Slot components.
 *
 * @module drawer-stack/components/scoped-slot
 */

import React from 'react';
import { Slot } from '@/components/slot';
import { useDrawerId } from '@/hooks';
import { buildScopedSlotName } from '@/utils';

export interface ScopedSlotProps {
  /** The global slot name (e.g., "drawer.header.before"). */
  name: string;
}

/**
 * Renders the global `<Slot>` always, plus a scoped `<Slot>` when a drawer ID is present.
 */
export function ScopedSlot({ name }: ScopedSlotProps): React.JSX.Element {
  const drawerId = useDrawerId();

  return (
    <>
      <Slot name={name} />
      {drawerId && <Slot name={buildScopedSlotName(name, drawerId)} />}
    </>
  );
}
