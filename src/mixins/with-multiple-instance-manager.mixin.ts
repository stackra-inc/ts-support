/**
 * withMultipleInstanceManager Mixin
 *
 * Applies multi-instance, multi-driver management to any base class.
 * Use when you need a class that is both a service AND a manager.
 *
 * @typeParam T - The type of instance the manager creates
 * @typeParam TBase - The base class constructor type
 *
 * @module mixins/with-multiple-instance-manager
 */

import type { DriverCreator } from '@/types';

export function withMultipleInstanceManager<T, TBase extends new (...args: any[]) => {}>(
  Base: TBase
) {
  abstract class Mixed extends Base {
    /**
     * @internal
     */
    _instances: Map<string, T> = new Map();
    /**
     * @internal
     */
    _pending: Map<string, Promise<T>> = new Map();
    /**
     * @internal
     */
    _customCreators: Map<string, DriverCreator<T>> = new Map();

    /**
     * Override if your config uses a different field name. @default 'driver'
     */
    driverKey: string = 'driver';

    // ── Abstract ──────────────────────────────────────────────────────────

    abstract getDefaultInstance(): string;
    abstract setDefaultInstance(name: string): void;
    abstract getInstanceConfig(name: string): Record<string, any> | undefined;
    abstract createDriver(driver: string, config: Record<string, any>): T;

    /**
     * Override for async driver creation. Defaults to sync createDriver().
     */
    async createDriverAsync(driver: string, config: Record<string, any>): Promise<T> {
      return this.createDriver(driver, config);
    }

    /**
     * Override to configure newly created instances.
     */
    onInstanceCreated(_name: string, instance: T): T {
      return instance;
    }

    // ── Sync ──────────────────────────────────────────────────────────────

    instance(name?: string): T {
      const instanceName = name ?? this.getDefaultInstance();
      const existing = this._instances.get(instanceName);
      if (existing) return existing;
      const resolved = this._resolve(instanceName);
      this._instances.set(instanceName, resolved);
      return resolved;
    }

    // ── Async ─────────────────────────────────────────────────────────────

    async instanceAsync(name?: string): Promise<T> {
      const instanceName = name ?? this.getDefaultInstance();

      const existing = this._instances.get(instanceName);
      if (existing) return existing;

      let promise = this._pending.get(instanceName);
      if (!promise) {
        promise = this._resolveAsync(instanceName);
        this._pending.set(instanceName, promise);
      }

      try {
        const resolved = await promise;
        this._instances.set(instanceName, resolved);
        return resolved;
      } finally {
        this._pending.delete(instanceName);
      }
    }

    // ── Cache management ──────────────────────────────────────────────────

    extend(driver: string, creator: DriverCreator<T>): this {
      this._customCreators.set(driver, creator);
      return this;
    }

    forgetInstance(name?: string | string[]): this {
      const names = name ? (Array.isArray(name) ? name : [name]) : [this.getDefaultInstance()];
      for (const n of names) {
        this._instances.delete(n);
      }
      return this;
    }

    purge(): void {
      this._instances.clear();
      this._pending.clear();
    }

    hasInstance(name: string): boolean {
      return this._instances.has(name);
    }

    /**
     * @deprecated Use hasInstance()
     */
    hasResolvedInstance(name: string): boolean {
      return this.hasInstance(name);
    }

    getResolvedInstances(): string[] {
      return Array.from(this._instances.keys());
    }

    setInstance(name: string, instance: T): void {
      this._instances.set(name, instance);
    }

    // ── Private ───────────────────────────────────────────────────────────

    /**
     * @internal
     */
    _resolve(name: string): T {
      const config = this.getInstanceConfig(name);
      if (!config) throw new Error(`Instance [${name}] is not defined.`);
      const driver = config[this.driverKey];
      if (!driver) throw new Error(`Instance [${name}] does not specify a "${this.driverKey}".`);
      const customCreator = this._customCreators.get(driver);
      const instance = customCreator ? customCreator(config) : this.createDriver(driver, config);
      return this.onInstanceCreated(name, instance);
    }

    /**
     * @internal
     */
    async _resolveAsync(name: string): Promise<T> {
      const config = this.getInstanceConfig(name);
      if (!config) throw new Error(`Instance [${name}] is not defined.`);
      const driver = config[this.driverKey];
      if (!driver) throw new Error(`Instance [${name}] does not specify a "${this.driverKey}".`);
      const customCreator = this._customCreators.get(driver);
      const instance = customCreator
        ? customCreator(config)
        : await this.createDriverAsync(driver, config);
      return this.onInstanceCreated(name, instance);
    }
  }

  return Mixed;
}
