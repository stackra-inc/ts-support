/**
 * @fileoverview SlotEntry interface — a single injection registered at a slot position.
 *
 * @module interfaces/slot-entry
 */

import type React from 'react';

/**
 * A slot injection entry.
 *
 * Registered via `slotRegistry.registerEntry()` and rendered by `<Slot>`.
 * Entries are sorted by priority (higher = rendered first, Magento-style).
 */
export interface SlotEntry {
  /** Unique identifier for this entry. */
  id: string;
  /** Render function that returns the content. */
  render: () => React.ReactNode;
  /** Priority for ordering (higher = rendered first). @default 0 */
  priority?: number;
  /** Optional condition — entry is skipped if this returns false. */
  when?: () => boolean;
}

/**
 * Options for registering a slot entry.
 * The `id` is optional — auto-generated if not provided.
 */
export type SlotEntryOptions = Omit<SlotEntry, 'id'> & { id?: string };
