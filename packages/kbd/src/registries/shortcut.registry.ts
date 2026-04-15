/**
 * @fileoverview Keyboard shortcut registry
 *
 * Central registry for managing keyboard shortcuts.
 * Handles registration, lookup, conflict detection, and platform-specific keys.
 *
 * @module registries/ShortcutRegistry
 */

import { Injectable } from '@abdokouta/ts-container';
import { BaseRegistry } from '@abdokouta/react-support';
import type {
  KeyboardShortcut,
  ShortcutGroup,
  ShortcutConflict,
  ShortcutRegistrationOptions,
  ShortcutQueryOptions,
  Platform,
  PlatformKeys,
} from '@/interfaces';
import type { KeyValue } from '@/types';

/**
 * Keyboard Shortcut Registry Service
 *
 * Manages all keyboard shortcuts in the application using BaseRegistry.
 * Provides methods for registration, lookup, conflict detection,
 * and platform-specific key resolution.
 *
 * @example
 * ```typescript
 * import { shortcutRegistry } from '@abdokouta/kbd';
 *
 * // Register a shortcut
 * shortcutRegistry.register({
 *   id: 'search',
 *   name: 'Open Search',
 *   category: 'search',
 *   context: 'global',
 *   keys: ['command', 'K'],
 *   callback: () => openSearch(),
 * });
 *
 * // Get a shortcut
 * const searchShortcut = shortcutRegistry.get('search');
 *
 * // Get all shortcuts
 * const allShortcuts = shortcutRegistry.getAll();
 * ```
 */
@Injectable()
export class ShortcutRegistry extends BaseRegistry<KeyboardShortcut> {
  /**
   * Internal storage for groups
   * Map of group ID to group configuration
   */
  private groups: Map<string, ShortcutGroup> = new Map();

  /**
   * Current platform
   */
  private platform: Platform;

  /**
   * Event listeners for registry changes
   */
  private listeners: Set<(event: RegistryEvent) => void> = new Set();

  constructor() {
    super();
    this.platform = this.detectPlatform();
  }

  // ============================================================================
  // Platform Detection
  // ============================================================================

  /**
   * Detect the current platform
   *
   * @returns The detected platform
   */
  private detectPlatform(): Platform {
    if (typeof window === 'undefined') {
      return 'all';
    }

    const userAgent = window.navigator.userAgent.toLowerCase();

    if (userAgent.includes('mac')) {
      return 'mac';
    }

    if (userAgent.includes('win')) {
      return 'windows';
    }

    if (userAgent.includes('linux')) {
      return 'linux';
    }

    return 'all';
  }

  /**
   * Get the current platform
   *
   * @returns The current platform
   */
  public getPlatform(): Platform {
    return this.platform;
  }

  /**
   * Set the platform manually (useful for testing)
   *
   * @param platform - The platform to set
   */
  public setPlatform(platform: Platform): void {
    this.platform = platform;
    this.emit({ type: 'platform-changed', platform });
  }

  // ============================================================================
  // Key Resolution
  // ============================================================================

  /**
   * Resolve platform-specific keys
   *
   * @param keys - Keys configuration (simple array or platform-specific)
   * @returns Resolved keys for the current platform
   *
   * @example
   * ```typescript
   * // Simple keys
   * resolveKeys(['command', 'K']); // Returns ['command', 'K']
   *
   * // Platform-specific keys
   * resolveKeys({
   *   mac: ['command', 'K'],
   *   windows: ['ctrl', 'K'],
   *   default: ['ctrl', 'K'],
   * }); // Returns ['command', 'K'] on Mac, ['ctrl', 'K'] on Windows
   * ```
   */
  public resolveKeys(keys: (KeyValue | string)[] | PlatformKeys): (KeyValue | string)[] {
    // If it's a simple array, return as-is
    if (Array.isArray(keys)) {
      return keys;
    }

    // Platform-specific resolution
    const platformKeys = keys as PlatformKeys;

    // Try platform-specific keys first
    if (this.platform === 'mac' && platformKeys.mac) {
      return platformKeys.mac;
    }

    if (this.platform === 'windows' && platformKeys.windows) {
      return platformKeys.windows;
    }

    if (this.platform === 'linux' && platformKeys.linux) {
      return platformKeys.linux;
    }

    // Fall back to default
    return platformKeys.default;
  }

  /**
   * Normalize keys to lowercase for comparison
   *
   * @param keys - Keys to normalize
   * @returns Normalized keys
   */
  private normalizeKeys(keys: (KeyValue | string)[]): string[] {
    return keys.map((key) => key.toLowerCase()).sort();
  }

  /**
   * Check if two key combinations are equal
   *
   * @param keys1 - First key combination
   * @param keys2 - Second key combination
   * @returns True if keys are equal
   */
  private areKeysEqual(keys1: (KeyValue | string)[], keys2: (KeyValue | string)[]): boolean {
    const normalized1 = this.normalizeKeys(keys1);
    const normalized2 = this.normalizeKeys(keys2);

    if (normalized1.length !== normalized2.length) {
      return false;
    }

    return normalized1.every((key, index) => key === normalized2[index]);
  }

  // ============================================================================
  // Registration
  // ============================================================================

  /**
   * Register a keyboard shortcut
   *
   * @param shortcut - Shortcut configuration
   * @param options - Registration options
   * @returns The registered shortcut
   * @throws Error if shortcut ID already exists and override is false
   *
   * @example
   * ```typescript
   * shortcutRegistry.register({
   *   id: 'search',
   *   name: 'Open Search',
   *   category: 'search',
   *   context: 'global',
   *   keys: ['command', 'K'],
   *   callback: () => openSearch(),
   * });
   * ```
   */
  public override register(
    shortcut: KeyboardShortcut,
    options?: ShortcutRegistrationOptions
  ): KeyboardShortcut;
  public override register(key: string, item: KeyboardShortcut): void;
  public override register(
    shortcutOrKey: KeyboardShortcut | string,
    optionsOrItem?: ShortcutRegistrationOptions | KeyboardShortcut
  ): KeyboardShortcut | void {
    // Handle BaseRegistry's (key, item) signature
    if (typeof shortcutOrKey === 'string') {
      super.register(shortcutOrKey, optionsOrItem as KeyboardShortcut);
      return;
    }

    const shortcut = shortcutOrKey;
    const options = (optionsOrItem as ShortcutRegistrationOptions) ?? {};
    const {
      override = false,
      checkConflicts = true,
      onConflict = 'warn',
      enabled = true,
    } = options;

    // Check if shortcut already exists
    if (this.has(shortcut.id) && !override) {
      const message = `Shortcut with ID "${shortcut.id}" already exists`;

      if (onConflict === 'error') {
        throw new Error(message);
      }

      if (onConflict === 'warn') {
        console.warn(message);
      }

      if (onConflict === 'skip') {
        return this.get(shortcut.id)!;
      }
    }

    // Check for key conflicts
    if (checkConflicts) {
      const conflicts = this.findConflicts(shortcut);

      if (conflicts.length > 0) {
        const message = `Shortcut "${shortcut.id}" conflicts with existing shortcuts: ${conflicts
          .map((c) => c.existingShortcut.id)
          .join(', ')}`;

        if (onConflict === 'error') {
          throw new Error(message);
        }

        if (onConflict === 'warn') {
          console.warn(message, conflicts);
        }

        if (onConflict === 'skip') {
          return shortcut;
        }
      }
    }

    // Set default values
    const completeShortcut: KeyboardShortcut = {
      ...shortcut,
      enabled: enabled ?? shortcut.enabled ?? true,
      preventDefault: shortcut.preventDefault ?? true,
      stopPropagation: shortcut.stopPropagation ?? false,
      priority: shortcut.priority ?? 'normal',
      allowRepeat: shortcut.allowRepeat ?? false,
      allowInInput: shortcut.allowInInput ?? false,
      showInHelp: shortcut.showInHelp ?? true,
      customizable: shortcut.customizable ?? true,
      order: shortcut.order ?? 0,
    };

    // Store the shortcut using BaseRegistry's set method
    this.storage.set(shortcut.id, completeShortcut);

    // Emit event
    this.emit({ type: 'registered', shortcut: completeShortcut });

    return completeShortcut;
  }

  /**
   * Register multiple shortcuts at once
   *
   * @param shortcuts - Array of shortcuts to register
   * @param options - Registration options
   * @returns Array of registered shortcuts
   */
  public registerMany(
    shortcuts: KeyboardShortcut[],
    options: ShortcutRegistrationOptions = {}
  ): KeyboardShortcut[] {
    return shortcuts.map((shortcut) => this.register(shortcut, options));
  }

  /**
   * Unregister a keyboard shortcut
   *
   * @param id - Shortcut ID to unregister
   * @returns True if shortcut was unregistered, false if not found
   */
  public unregister(id: string): boolean {
    const shortcut = this.get(id);

    if (!shortcut) {
      return false;
    }

    this.storage.delete(id);
    this.emit({ type: 'unregistered', shortcut });

    return true;
  }

  /**
   * Unregister multiple shortcuts
   *
   * @param ids - Array of shortcut IDs to unregister
   * @returns Number of shortcuts unregistered
   */
  public unregisterMany(ids: string[]): number {
    let count = 0;

    for (const id of ids) {
      if (this.unregister(id)) {
        count++;
      }
    }

    return count;
  }

  /**
   * Clear all shortcuts
   */
  public clear(): void {
    super.clear();
    this.emit({ type: 'cleared' });
  }

  // ============================================================================
  // Lookup (inherited from BaseRegistry: get, has, getAll)
  // ============================================================================

  /**
   * Get shortcuts by category
   *
   * @param category - Category to filter by
   * @returns Array of shortcuts in the category
   */
  public getByCategory(category: KeyboardShortcut['category']): KeyboardShortcut[] {
    return this.getAll().filter((shortcut) => shortcut.category === category);
  }

  /**
   * Get shortcuts by context
   *
   * @param context - Context to filter by
   * @returns Array of shortcuts in the context
   */
  public getByContext(context: KeyboardShortcut['context']): KeyboardShortcut[] {
    return this.getAll().filter((shortcut) => shortcut.context === context);
  }

  /**
   * Get shortcuts by group
   *
   * @param group - Group name to filter by
   * @returns Array of shortcuts in the group
   */
  public getByGroup(group: string): KeyboardShortcut[] {
    return this.getAll().filter((shortcut) => shortcut.group === group);
  }

  /**
   * Query shortcuts with filters
   *
   * @param options - Query options
   * @returns Array of matching shortcuts
   */
  public query(options: ShortcutQueryOptions): KeyboardShortcut[] {
    let results = this.getAll();

    // Filter by category
    if (options.category) {
      const categories = Array.isArray(options.category) ? options.category : [options.category];
      results = results.filter((s) => categories.includes(s.category));
    }

    // Filter by context
    if (options.context) {
      const contexts = Array.isArray(options.context) ? options.context : [options.context];
      results = results.filter((s) => contexts.includes(s.context));
    }

    // Filter by enabled state
    if (options.enabled !== undefined) {
      results = results.filter((s) => s.enabled === options.enabled);
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      results = results.filter((s) => s.tags?.some((tag) => options.tags!.includes(tag)));
    }

    // Filter by group
    if (options.group) {
      results = results.filter((s) => s.group === options.group);
    }

    // Filter by customizable
    if (options.customizable !== undefined) {
      results = results.filter((s) => s.customizable === options.customizable);
    }

    // Search by name/description
    if (options.search) {
      const search = options.search.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(search) || s.description?.toLowerCase().includes(search)
      );
    }

    return results;
  }

  // ============================================================================
  // Conflict Detection
  // ============================================================================

  /**
   * Find conflicts for a shortcut
   *
   * @param shortcut - Shortcut to check for conflicts
   * @returns Array of conflicts
   */
  public findConflicts(shortcut: KeyboardShortcut): ShortcutConflict[] {
    const conflicts: ShortcutConflict[] = [];
    const newKeys = this.resolveKeys(shortcut.keys);

    for (const existing of this.getAll()) {
      // Skip self
      if (existing.id === shortcut.id) {
        continue;
      }

      // Check if contexts overlap
      if (
        shortcut.context !== 'global' &&
        existing.context !== 'global' &&
        shortcut.context !== existing.context
      ) {
        continue;
      }

      // Check main keys
      const existingKeys = this.resolveKeys(existing.keys);

      if (this.areKeysEqual(newKeys, existingKeys)) {
        conflicts.push({
          newShortcut: shortcut,
          existingShortcut: existing,
          conflictingKeys: newKeys,
          canResolve: shortcut.priority! > (existing.priority ?? 'normal'),
          resolution: shortcut.priority! > (existing.priority ?? 'normal') ? 'override' : 'skip',
        });
      }

      // Check alternative keys
      if (shortcut.alternativeKeys) {
        for (const altKeys of shortcut.alternativeKeys) {
          const resolvedAltKeys = this.resolveKeys(altKeys);

          if (this.areKeysEqual(resolvedAltKeys, existingKeys)) {
            conflicts.push({
              newShortcut: shortcut,
              existingShortcut: existing,
              conflictingKeys: resolvedAltKeys,
              canResolve: false,
              resolution: 'alternative',
            });
          }
        }
      }
    }

    return conflicts;
  }

  // ============================================================================
  // Groups
  // ============================================================================

  /**
   * Register a shortcut group
   *
   * @param group - Group configuration
   */
  public registerGroup(group: ShortcutGroup): void {
    this.groups.set(group.id, group);
    this.emit({ type: 'group-registered', group });
  }

  /**
   * Get a group by ID
   *
   * @param id - Group ID
   * @returns The group or undefined if not found
   */
  public getGroup(id: string): ShortcutGroup | undefined {
    return this.groups.get(id);
  }

  /**
   * Get all groups
   *
   * @returns Array of all groups
   */
  public getAllGroups(): ShortcutGroup[] {
    return Array.from(this.groups.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  // ============================================================================
  // State Management
  // ============================================================================

  /**
   * Enable a shortcut
   *
   * @param id - Shortcut ID
   * @returns True if shortcut was enabled
   */
  public enable(id: string): boolean {
    const shortcut = this.get(id);

    if (!shortcut) {
      return false;
    }

    shortcut.enabled = true;
    this.storage.set(id, shortcut);
    this.emit({ type: 'enabled', shortcut });

    return true;
  }

  /**
   * Disable a shortcut
   *
   * @param id - Shortcut ID
   * @returns True if shortcut was disabled
   */
  public disable(id: string): boolean {
    const shortcut = this.get(id);

    if (!shortcut) {
      return false;
    }

    shortcut.enabled = false;
    this.storage.set(id, shortcut);
    this.emit({ type: 'disabled', shortcut });

    return true;
  }

  /**
   * Toggle a shortcut's enabled state
   *
   * @param id - Shortcut ID
   * @returns The new enabled state, or undefined if not found
   */
  public toggle(id: string): boolean | undefined {
    const shortcut = this.get(id);

    if (!shortcut) {
      return undefined;
    }

    shortcut.enabled = !shortcut.enabled;
    this.storage.set(id, shortcut);
    this.emit({
      type: shortcut.enabled ? 'enabled' : 'disabled',
      shortcut,
    });

    return shortcut.enabled;
  }

  // ============================================================================
  // Events
  // ============================================================================

  /**
   * Subscribe to registry events
   *
   * @param listener - Event listener function
   * @returns Unsubscribe function
   */
  public subscribe(listener: (event: RegistryEvent) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit a registry event
   *
   * @param event - Event to emit
   */
  private emit(event: RegistryEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

/**
 * Registry event types
 */
export type RegistryEvent =
  | { type: 'registered'; shortcut: KeyboardShortcut }
  | { type: 'unregistered'; shortcut: KeyboardShortcut }
  | { type: 'enabled'; shortcut: KeyboardShortcut }
  | { type: 'disabled'; shortcut: KeyboardShortcut }
  | { type: 'cleared' }
  | { type: 'group-registered'; group: ShortcutGroup }
  | { type: 'platform-changed'; platform: Platform };

/**
 * Global shortcut registry instance
 */
export const shortcutRegistry = new ShortcutRegistry();
