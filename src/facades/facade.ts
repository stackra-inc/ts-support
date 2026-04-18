/**
 * Facade — Laravel-Style Static Proxy
 *
 * Provides static-looking access to services resolved from the DI container.
 * Each facade subclass declares an accessor (injection token), and all
 * property/method access is proxied to the resolved instance.
 *
 * ## How it works:
 *
 * 1. Subclass `Facade` and override `accessor` with your injection token
 * 2. Call `Facade.setApplication(app)` once during bootstrap
 * 3. Use `MyFacade.instance` to get the typed, proxied instance
 *
 * ## TypeScript adaptation:
 *
 * Laravel uses PHP's `__callStatic` magic method. TypeScript doesn't have
 * that, so we provide two patterns:
 *
 * - `MyFacade.instance` — returns the fully typed resolved instance
 * - `Facade.make<T>(token)` — creates a typed proxy object
 *
 * @module facades/facade
 */

import type { IApplication, InjectionToken } from '@stackra/ts-container';

/**
 * Abstract base class for all facades.
 *
 * Facades provide a static interface to services registered in the DI
 * container. They act as a convenient shorthand for `app.get(Token)`,
 * with built-in caching and swap support for testing.
 *
 * Subclasses must override the `accessor` getter to specify which
 * injection token to resolve from the container.
 *
 * @example
 * ```typescript
 * // Define a facade
 * class CacheFacade extends Facade {
 *   protected static get accessor(): InjectionToken {
 *     return CacheManager;
 *   }
 * }
 *
 * // Bootstrap
 * const app = await Application.create(AppModule);
 * Facade.setApplication(app);
 *
 * // Use it
 * const cache = CacheFacade.instance as CacheManager;
 * cache.get('key');
 *
 * // Or use the typed accessor helper
 * const Cache = Facade.make<CacheManager>(CacheManager);
 * Cache.get('key');
 * ```
 */
export abstract class Facade {
  /**
   * The application instance that facades resolve from.
   * Set once during bootstrap via `Facade.setApplication()`.
   */
  private static app: IApplication | null = null;

  /**
   * Cache of resolved instances, keyed by a string representation
   * of the injection token. Cleared via `clearResolvedInstances()`.
   */
  private static resolvedInstances = new Map<string, any>();

  /**
   * Whether resolved instances should be cached.
   * Subclasses can override this to disable caching (e.g., for transient services).
   *
   * @default true
   */
  protected static cached = true;

  // ── Abstract accessor ────────────────────────────────────────────────────

  /**
   * The injection token for the service this facade proxies.
   *
   * Subclasses must override this getter to return the token
   * (class, string, or symbol) that identifies the service
   * in the DI container.
   *
   * @returns The injection token for the underlying service
   *
   * @throws Error if not overridden by the subclass
   *
   * @example
   * ```typescript
   * class LogFacade extends Facade {
   *   protected static get accessor(): InjectionToken {
   *     return LoggerService;
   *   }
   * }
   * ```
   */
  protected static get accessor(): InjectionToken {
    throw new Error(
      `${this.name} does not implement the 'accessor' getter. ` +
        `Override it to return the injection token for the underlying service.`
    );
  }

  // ── Application binding ──────────────────────────────────────────────────

  /**
   * Set the application instance that all facades resolve from.
   *
   * Call this once during bootstrap, after `Application.create()`.
   * All facade subclasses share the same application reference.
   *
   * @param app - The bootstrapped Application instance
   *
   * @example
   * ```typescript
   * const app = await Application.create(AppModule);
   * Facade.setApplication(app);
   * ```
   */
  public static setApplication(app: IApplication): void {
    Facade.app = app;
  }

  /**
   * Get the current application instance.
   *
   * @returns The application instance, or `null` if not set
   */
  public static getApplication(): IApplication | null {
    return Facade.app;
  }

  // ── Typed accessor factory ───────────────────────────────────────────────

  /**
   * Create a fully typed proxy object for a service.
   *
   * This is the recommended way to use facades in TypeScript.
   * Returns a `Proxy` that forwards all property and method access
   * to the resolved service instance, with full type safety.
   *
   * The proxy lazily resolves the service on first access, so it's
   * safe to create at module scope before the app is bootstrapped.
   *
   * @typeParam T - The type of the service being proxied
   * @param token - The injection token for the service
   * @returns A proxy object typed as `T` that delegates to the resolved instance
   *
   * @example
   * ```typescript
   * // Define at module scope
   * const Cache = Facade.make<CacheManager>(CacheManager);
   * const Config = Facade.make<ConfigService>(ConfigService);
   *
   * // Use anywhere after bootstrap
   * const value = Cache.get('key');
   * const dbUrl = Config.get('database.url');
   * ```
   */
  public static make<T extends object>(token: InjectionToken<T>): T {
    const facade = this;

    return new Proxy({} as T, {
      /**
       * Intercept property access and forward to the resolved instance.
       */
      get(_target: T, prop: string | symbol): any {
        if (!facade.app) {
          throw new Error(
            `Facade accessor for '${String(token)}' cannot resolve — ` +
              `no application has been set. Call Facade.setApplication(app) during bootstrap.`
          );
        }

        const key = facade.getTokenKey(token);

        // Resolve (with caching)
        let instance: any;
        if (facade.resolvedInstances.has(key)) {
          instance = facade.resolvedInstances.get(key);
        } else {
          instance = facade.app.get(token);
          facade.resolvedInstances.set(key, instance);
        }

        const value = instance[prop];

        // Bind methods to the instance so `this` works correctly
        return typeof value === 'function' ? value.bind(instance) : value;
      },
    });
  }

  // ── Instance resolution ──────────────────────────────────────────────────

  /**
   * Get the resolved service instance behind this facade.
   *
   * Resolves the service from the container using the `accessor` token.
   * Caches the result by default (controlled by `cached` property).
   *
   * @returns The resolved service instance
   *
   * @throws Error if the application has not been set
   * @throws Error if the accessor is not overridden
   * @throws Error if the service cannot be resolved
   *
   * @example
   * ```typescript
   * class CacheFacade extends Facade {
   *   protected static get accessor() { return CacheManager; }
   * }
   *
   * const cache = CacheFacade.instance as CacheManager;
   * await cache.get('key');
   * ```
   */
  public static get instance(): any {
    return this.resolve();
  }

  /**
   * Resolve the facade root instance from the container.
   *
   * Checks the cache first (if caching is enabled), then falls back
   * to resolving from the application container.
   *
   * @returns The resolved service instance
   *
   * @throws Error if the application has not been set
   */
  protected static resolve(): any {
    const token = this.accessor;
    const key = this.getTokenKey(token);

    // Check cache first
    if (this.resolvedInstances.has(key)) {
      return this.resolvedInstances.get(key);
    }

    if (!Facade.app) {
      throw new Error(
        `Facade '${this.name}' cannot resolve — no application has been set. ` +
          `Call Facade.setApplication(app) during bootstrap.`
      );
    }

    const instance = Facade.app.get(token);

    // Cache if enabled
    if (this.cached) {
      this.resolvedInstances.set(key, instance);
    }

    return instance;
  }

  // ── Swap & Testing ───────────────────────────────────────────────────────

  /**
   * Hotswap the underlying instance behind this facade.
   *
   * Replaces the cached instance with the provided one. Useful for
   * testing — swap in a mock, run tests, then clear.
   *
   * @param instance - The replacement instance (typically a mock or fake)
   *
   * @example
   * ```typescript
   * // In tests
   * const mockCache = { get: vi.fn(), put: vi.fn() };
   * CacheFacade.swap(mockCache);
   *
   * // CacheFacade.instance now returns mockCache
   * expect(CacheFacade.instance).toBe(mockCache);
   *
   * // Clean up
   * CacheFacade.clearResolvedInstance();
   * ```
   */
  public static swap(instance: any): void {
    const key = this.getTokenKey(this.accessor);
    this.resolvedInstances.set(key, instance);
  }

  /**
   * Clear the resolved instance for this facade.
   *
   * The next access will re-resolve from the container.
   * Optionally pass a token to clear a specific instance.
   *
   * @param token - Optional token to clear. Defaults to this facade's accessor.
   */
  public static clearResolvedInstance(token?: InjectionToken): void {
    const key = this.getTokenKey(token ?? this.accessor);
    this.resolvedInstances.delete(key);
  }

  /**
   * Clear all resolved facade instances.
   *
   * Resets the entire cache. Typically called in test teardown
   * to ensure a clean state between tests.
   *
   * @example
   * ```typescript
   * afterEach(() => {
   *   Facade.clearResolvedInstances();
   * });
   * ```
   */
  public static clearResolvedInstances(): void {
    this.resolvedInstances.clear();
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  /**
   * Convert an injection token to a string key for the cache map.
   *
   * @param token - The injection token to convert
   * @returns A string key suitable for Map lookup
   */
  private static getTokenKey(token: InjectionToken): string {
    if (typeof token === 'function') return token.name;
    if (typeof token === 'symbol') return token.toString();
    return String(token);
  }
}
