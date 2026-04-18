/**
 * Multiple Instance Manager
 *
 * Abstract base class for managing multiple named instances backed by
 * different drivers. TypeScript adaptation of Laravel's
 * `MultipleInstanceManager` pattern.
 *
 * Supports both sync and async driver creation:
 * - `instance(name)` — sync resolution via `createDriver()`
 * - `instanceAsync(name)` — async resolution via `createDriverAsync()`
 *   with built-in deduplication of in-flight resolutions
 *
 * Concrete managers extend this class and implement:
 * - `getDefaultInstance()` — which instance name to use by default
 * - `setDefaultInstance(name)` — change the default at runtime
 * - `getInstanceConfig(name)` — read config for a named instance
 * - `createDriver(driver, config)` — create an instance synchronously
 *
 * For async drivers (Redis, DB connections), also implement:
 * - `createDriverAsync(driver, config)` — create an instance asynchronously
 *
 * Optionally override:
 * - `onInstanceCreated(name, instance)` — hook to configure newly created instances
 *
 * @typeParam T - The type of instance this manager creates
 *
 * @module managers/multiple-instance-manager
 */

import type { DriverCreator } from '@/types';

/**
 * Abstract base manager for multi-instance, multi-driver services.
 *
 * @typeParam T - The type of instance managed (e.g., Store, RedisConnection)
 */
export abstract class MultipleInstanceManager<T> {
  /**
   * Resolved instances, keyed by instance name.
   * Instances are created once and reused on subsequent calls.
   */
  private readonly instances: Map<string, T> = new Map();

  /**
   * In-flight async resolutions, keyed by instance name.
   * Prevents duplicate async driver creation when `instanceAsync()`
   * is called multiple times before the first one resolves.
   */
  private readonly pending: Map<string, Promise<T>> = new Map();

  /**
   * Custom driver creators registered via `extend()`.
   * Keyed by driver name.
   */
  private readonly customCreators: Map<string, DriverCreator<T>> = new Map();

  /**
   * The config key that identifies the driver in instance config.
   * Override in subclasses if your config uses a different field name.
   *
   * @default 'driver'
   */
  protected readonly driverKey: string = 'driver';

  // ── Abstract methods ────────────────────────────────────────────────────

  /**
   * Get the default instance name.
   */
  abstract getDefaultInstance(): string;

  /**
   * Set the default instance name at runtime.
   */
  abstract setDefaultInstance(name: string): void;

  /**
   * Get the configuration for a named instance.
   */
  abstract getInstanceConfig(name: string): Record<string, any> | undefined;

  /**
   * Create a driver instance synchronously.
   * Called by `instance()` when no custom creator is registered.
   *
   * For async-only drivers (e.g., Redis), throw an error here
   * and implement `createDriverAsync()` instead.
   */
  protected abstract createDriver(driver: string, config: Record<string, any>): T;

  /**
   * Create a driver instance asynchronously.
   * Called by `instanceAsync()` when no custom creator is registered.
   *
   * Override this for drivers that require async initialization
   * (e.g., establishing connections, loading remote config).
   *
   * By default, falls back to the sync `createDriver()`.
   *
   * @param driver - The driver name from config
   * @param config - The raw instance config
   * @returns A promise that resolves to the driver instance
   */
  protected async createDriverAsync(driver: string, config: Record<string, any>): Promise<T> {
    return this.createDriver(driver, config);
  }

  // ── Lifecycle hook ──────────────────────────────────────────────────────

  /**
   * Called after a new instance is created and before it's cached.
   * Override to configure instances (e.g., set names, event dispatchers).
   *
   * @param name - The instance name
   * @param instance - The newly created instance
   * @returns The instance (possibly modified)
   */
  protected onInstanceCreated(_name: string, instance: T): T {
    return instance;
  }

  // ── Public API — Sync ───────────────────────────────────────────────────

  /**
   * Get an instance by name (sync).
   *
   * Returns a cached instance if available, otherwise resolves
   * via `createDriver()` and caches it.
   *
   * @param name - Instance name (uses default if omitted)
   */
  instance(name?: string): T {
    const instanceName = name ?? this.getDefaultInstance();

    const existing = this.instances.get(instanceName);
    if (existing) {
      return existing;
    }

    const resolved = this.resolve(instanceName);
    this.instances.set(instanceName, resolved);

    return resolved;
  }

  // ── Public API — Async ──────────────────────────────────────────────────

  /**
   * Get an instance by name (async).
   *
   * Returns a cached instance if available, otherwise resolves
   * via `createDriverAsync()` and caches it.
   *
   * Deduplicates in-flight resolutions — if two callers request
   * the same instance simultaneously, they share one Promise.
   *
   * @param name - Instance name (uses default if omitted)
   *
   * @example
   * ```typescript
   * // In RedisManager:
   * async connection(name?: string): Promise<RedisConnection> {
   *   return this.instanceAsync(name);
   * }
   * ```
   */
  async instanceAsync(name?: string): Promise<T> {
    const instanceName = name ?? this.getDefaultInstance();

    // Return from cache if already resolved
    const existing = this.instances.get(instanceName);
    if (existing) {
      return existing;
    }

    // Deduplicate in-flight resolutions
    let promise = this.pending.get(instanceName);
    if (!promise) {
      promise = this.resolveAsync(instanceName);
      this.pending.set(instanceName, promise);
    }

    try {
      const resolved = await promise;
      this.instances.set(instanceName, resolved);
      return resolved;
    } finally {
      this.pending.delete(instanceName);
    }
  }

  // ── Public API — Registration ───────────────────────────────────────────

  /**
   * Register a custom driver creator.
   * Custom creators take priority over built-in drivers.
   */
  extend(driver: string, creator: DriverCreator<T>): this {
    this.customCreators.set(driver, creator);
    return this;
  }

  // ── Public API — Cache management ───────────────────────────────────────

  /**
   * Remove a cached instance, forcing re-creation on next access.
   *
   * @param name - Instance name(s). Uses default if omitted.
   */
  forgetInstance(name?: string | string[]): this {
    const names = name ? (Array.isArray(name) ? name : [name]) : [this.getDefaultInstance()];

    for (const n of names) {
      this.instances.delete(n);
    }

    return this;
  }

  /**
   * Remove all cached instances.
   */
  purge(): void {
    this.instances.clear();
    this.pending.clear();
  }

  /**
   * Check if an instance has been resolved and cached.
   */
  hasInstance(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Get all resolved instance names.
   */
  getResolvedInstances(): string[] {
    return Array.from(this.instances.keys());
  }

  /**
   * Manually set a resolved instance in the cache.
   * Useful when instance creation happens outside the normal
   * `instance()` / `instanceAsync()` flow.
   */
  protected setInstance(name: string, instance: T): void {
    this.instances.set(name, instance);
  }

  // ── Deprecated aliases (backward compat) ────────────────────────────────

  /**
   * @deprecated Use `hasInstance()` instead.
   */
  hasResolvedInstance(name: string): boolean {
    return this.hasInstance(name);
  }

  // ── Private — Sync resolution ───────────────────────────────────────────

  private resolve(name: string): T {
    const config = this.getInstanceConfig(name);

    if (!config) {
      throw new Error(`Instance [${name}] is not defined.`);
    }

    const driver = config[this.driverKey];
    if (!driver) {
      throw new Error(`Instance [${name}] does not specify a "${this.driverKey}".`);
    }

    const customCreator = this.customCreators.get(driver);
    const instance = customCreator ? customCreator(config) : this.createDriver(driver, config);

    return this.onInstanceCreated(name, instance);
  }

  // ── Private — Async resolution ──────────────────────────────────────────

  private async resolveAsync(name: string): Promise<T> {
    const config = this.getInstanceConfig(name);

    if (!config) {
      throw new Error(`Instance [${name}] is not defined.`);
    }

    const driver = config[this.driverKey];
    if (!driver) {
      throw new Error(`Instance [${name}] does not specify a "${this.driverKey}".`);
    }

    const customCreator = this.customCreators.get(driver);
    const instance = customCreator
      ? customCreator(config)
      : await this.createDriverAsync(driver, config);

    return this.onInstanceCreated(name, instance);
  }
}
