/**
 * Slot Component
 *
 * |--------------------------------------------------------------------------
 * | Renders all content registered to a named slot via the slotRegistry.
 * |--------------------------------------------------------------------------
 * |
 * | Place `<Slot name="..." />` in your component where you want
 * | extensibility. Modules register content via `slotRegistry.registerEntry()`.
 * |
 * | No provider needed — reads directly from the global singleton registry.
 * |
 * | Usage:
 * |   <Slot name="login.before" />
 * |   <Header />
 * |   <Slot name="login.after.header" />
 * |   <Form />
 * |   <Slot name="login.after" fallback={<DefaultFooter />} />
 * |
 * @module components/slot
 */

'use client';

import React, { Fragment, createElement } from 'react';
import { useSlot } from '@/hooks/use-slot/use-slot.hook';

export interface SlotProps {
  /** The slot name to render content for. */
  name: string;
  /** Wrapper element/component for the slot content. */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  /** CSS class for the wrapper div (if no custom wrapper). */
  className?: string;
  /** Fallback content if no entries are registered. */
  fallback?: React.ReactNode;
  /** Additional content to render before slot entries. */
  before?: React.ReactNode;
  /** Additional content to render after slot entries. */
  after?: React.ReactNode;
}

/**
 * Slot — renders all content registered to a named slot.
 *
 * Content is sorted by priority (higher priority = rendered first).
 * Entries with a `when` condition that returns false are filtered out.
 */
export const Slot: React.FC<SlotProps> = ({
  name,
  wrapper: Wrapper,
  className,
  fallback,
  before,
  after,
}) => {
  const entries = useSlot(name);

  /* No entries and no fallback = render nothing. */
  if (entries.length === 0 && !fallback && !before && !after) {
    return null;
  }

  const renderedEntries =
    entries.length > 0
      ? entries.map((entry: { id: string; render: () => React.ReactNode }) =>
          createElement(Fragment, { key: entry.id }, entry.render())
        )
      : fallback;

  const content = createElement(Fragment, null, before, renderedEntries, after);

  /* Use custom wrapper if provided. */
  if (Wrapper) {
    return createElement(Wrapper, null, content);
  }

  /* Use div wrapper with className if provided. */
  if (className) {
    return createElement('div', { className }, content);
  }

  /* No wrapper needed. */
  return content;
};

Slot.displayName = 'Slot';
