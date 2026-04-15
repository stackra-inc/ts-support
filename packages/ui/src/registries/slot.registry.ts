/**
 * Slot Registry
 *
 * |--------------------------------------------------------------------------
 * | Global registry for dynamic UI slot injection.
 * |--------------------------------------------------------------------------
 * |
 * | Inspired by Magento's XML layout system. Modules register content
 * | to named slots, and `<Slot>` components render all registered content.
 * |
 * | No React context or provider needed — the registry is a global singleton.
 * | Entries are registered imperatively and read at render time.
 * |
 * | Usage:
 * |   slotRegistry.registerEntry("login.after.header", {
 * |     id: "multitenancy:tenant-badge",
 * |     priority: 100,
 * |     render: () => <TenantBadge />,
 * |     when: () => !!getCurrentTenant(),
 * |   });
 * |
 * @module registries/slot
 */

import type { SlotEntry, SlotEntryOptions } from '@/interfaces/slot-entry.interface';

/**
 * Internal storage: Map of entry id → entry for each slot.
 */
type SlotEntriesMap = Map<string, SlotEntry>;

/**
 * SlotRegistry
 *
 * Manages dynamic UI slot injections. Each slot name maps to a collection
 * of entries that can be rendered by the `<Slot>` component.
 *
 * Any module can inject content into named slots without modifying
 * the consuming component — true decoupled extensibility.
 */
export class SlotRegistry {
  /** Internal storage: slot name → entries map. */
  private slots = new Map<string, SlotEntriesMap>();

  /** Auto-increment counter for generating unique IDs. */
  private idCounter = 0;

  /** Change listeners for reactive updates. */
  private listeners = new Set<() => void>();

  /*
  |--------------------------------------------------------------------------
  | registerEntry
  |--------------------------------------------------------------------------
  |
  | Register content to a named slot.
  | Returns the entry ID (useful for unregistering).
  |
  */
  registerEntry(slotName: string, entry: SlotEntryOptions): string {
    const id = entry.id ?? `slot-entry-${++this.idCounter}`;
    const fullEntry: SlotEntry = {
      id,
      priority: 0,
      ...entry,
    };

    let entriesMap = this.slots.get(slotName);
    if (!entriesMap) {
      entriesMap = new Map();
      this.slots.set(slotName, entriesMap);
    }

    entriesMap.set(id, fullEntry);
    this.notify();
    return id;
  }

  /*
  |--------------------------------------------------------------------------
  | registerMany
  |--------------------------------------------------------------------------
  |
  | Register multiple entries to a slot at once.
  |
  */
  registerMany(slotName: string, entries: SlotEntryOptions[]): string[] {
    return entries.map((entry) => this.registerEntry(slotName, entry));
  }

  /*
  |--------------------------------------------------------------------------
  | unregisterEntry
  |--------------------------------------------------------------------------
  |
  | Remove an entry from a slot by ID.
  |
  */
  unregisterEntry(slotName: string, entryId: string): boolean {
    const entriesMap = this.slots.get(slotName);
    const removed = entriesMap?.delete(entryId) ?? false;
    if (removed) this.notify();
    return removed;
  }

  /*
  |--------------------------------------------------------------------------
  | hasEntries
  |--------------------------------------------------------------------------
  |
  | Check if a slot has any entries.
  |
  */
  hasEntries(slotName: string): boolean {
    const entriesMap = this.slots.get(slotName);
    return entriesMap !== undefined && entriesMap.size > 0;
  }

  /*
  |--------------------------------------------------------------------------
  | hasEntry
  |--------------------------------------------------------------------------
  |
  | Check if a specific entry exists in a slot.
  |
  */
  hasEntry(slotName: string, entryId: string): boolean {
    return this.slots.get(slotName)?.has(entryId) ?? false;
  }

  /*
  |--------------------------------------------------------------------------
  | getEntry
  |--------------------------------------------------------------------------
  |
  | Get a specific entry from a slot.
  |
  */
  getEntry(slotName: string, entryId: string): SlotEntry | undefined {
    return this.slots.get(slotName)?.get(entryId);
  }

  /*
  |--------------------------------------------------------------------------
  | getEntries
  |--------------------------------------------------------------------------
  |
  | Get all entries for a slot, sorted by priority (descending).
  | Entries with a `when` condition that returns false are filtered out.
  |
  */
  getEntries(slotName: string): SlotEntry[] {
    const entriesMap = this.slots.get(slotName);
    if (!entriesMap) return [];

    return Array.from(entriesMap.values())
      .filter((entry) => !entry.when || entry.when())
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  /*
  |--------------------------------------------------------------------------
  | countEntries
  |--------------------------------------------------------------------------
  */
  countEntries(slotName: string): number {
    return this.slots.get(slotName)?.size ?? 0;
  }

  /*
  |--------------------------------------------------------------------------
  | clearSlot
  |--------------------------------------------------------------------------
  |
  | Clear all entries from a specific slot.
  |
  */
  clearSlot(slotName: string): void {
    const entriesMap = this.slots.get(slotName);
    if (entriesMap) {
      entriesMap.clear();
      this.notify();
    }
  }

  /*
  |--------------------------------------------------------------------------
  | clearAll
  |--------------------------------------------------------------------------
  |
  | Clear all slots and all entries.
  |
  */
  clearAll(): void {
    this.slots.clear();
    this.notify();
  }

  /*
  |--------------------------------------------------------------------------
  | updateEntry
  |--------------------------------------------------------------------------
  |
  | Update an existing entry's properties.
  |
  */
  updateEntry(slotName: string, entryId: string, updates: Partial<Omit<SlotEntry, 'id'>>): boolean {
    const entry = this.getEntry(slotName, entryId);
    if (!entry) return false;

    this.slots.get(slotName)!.set(entryId, { ...entry, ...updates });
    this.notify();
    return true;
  }

  /*
  |--------------------------------------------------------------------------
  | getSlotNames
  |--------------------------------------------------------------------------
  |
  | Get all slot names that have entries.
  |
  */
  getSlotNames(): string[] {
    return Array.from(this.slots.keys()).filter((name) => this.hasEntries(name));
  }

  /*
  |--------------------------------------------------------------------------
  | subscribe / notify
  |--------------------------------------------------------------------------
  |
  | Subscribe to registry changes for reactive React hooks.
  | Returns an unsubscribe function.
  |
  */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Notify all listeners of a change. */
  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

/*
|--------------------------------------------------------------------------
| Global Singleton
|--------------------------------------------------------------------------
|
| Use this to register content from modules:
|
|   slotRegistry.registerEntry("login.after.header", {
|     id: "multitenancy:tenant-badge",
|     priority: 100,
|     render: () => <TenantBadge />,
|   });
|
*/
export const slotRegistry = new SlotRegistry();
