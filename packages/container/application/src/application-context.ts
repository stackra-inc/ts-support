/**
 * @fileoverview ApplicationContext — the main entry point for bootstrapping the DI system.
 *
 * This is the equivalent of NestJS's `NestFactory.createApplicationContext()`.
 * It orchestrates the full bootstrap sequence:
 *
 * 1. **Scan** — Walk the module tree, register all modules/providers/imports/exports
 * 2. **Instantiate** — Resolve all providers (create instances, inject dependencies)
 * 3. **Lifecycle** — Call `onModuleInit()` on providers that implement it
 *
 * After bootstrap, the ApplicationContext provides `get()` to resolve any provider.
 *
 * ## Usage:
 *
 * ```typescript
 * import { ApplicationContext } from '@pixielity/application';
 * import { AppModule } from './app.module';
 *
 * // Bootstrap
 * const app = await ApplicationContext.create(AppModule);
 *
 * // Resolve providers
 * const cache = app.get(CacheManager);
 * const config = app.get<AppConfig>(APP_CONFIG);
 *
 * // Shutdown
 * await app.close();
 * ```
 *
 * ## With React:
 *
 * ```tsx
 * import { ContainerProvider } from '@abdokouta/ts-container/react';
 *
 * const app = await ApplicationContext.create(AppModule);
 *
 * ReactDOM.createRoot(root).render(
 *   <ContainerProvider context={app}>
 *     <App />
 *   </ContainerProvider>
 * );
 * ```
 *
 * The ApplicationContext implements the `ContainerResolver` interface from
 * `@abdokouta/ts-container/react`, so it can be passed directly to `ContainerProvider`.
 *
 * @module application-context
 */

import type { Type, InjectionToken } from '@abdokouta/ts-container';
import {
  NestContainer,
  DependenciesScanner,
  InstanceLoader,
  ModuleRef,
} from '@abdokouta/ts-container';
import type { IApplicationContext } from './interfaces/application-context.interface';

/**
 * The bootstrapped application context.
 *
 * Provides access to the DI container after all modules have been
 * scanned and all providers have been instantiated.
 *
 * Implements `IApplicationContext` (which extends `ContainerResolver`)
 * so it can be used directly with `<ContainerProvider context={app}>`
 * from `@abdokouta/ts-container/react`.
 */
export class ApplicationContext implements IApplicationContext {
  private readonly container: NestContainer;
  private readonly instanceLoader: InstanceLoader;
  private isInitialized = false;

  private constructor(container: NestContainer, instanceLoader: InstanceLoader) {
    this.container = container;
    this.instanceLoader = instanceLoader;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Static factory
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create and bootstrap an application context.
   *
   * This is the main entry point. It:
   * 1. Scans the module tree starting from the root module
   * 2. Resolves all providers (creates instances, injects dependencies)
   * 3. Calls `onModuleInit()` lifecycle hooks
   *
   * @param rootModule - The root module class (your AppModule)
   * @returns A fully bootstrapped ApplicationContext
   *
   * @example
   * ```typescript
   * import { ApplicationContext } from '@pixielity/application';
   * import { AppModule } from './app.module';
   *
   * const app = await ApplicationContext.create(AppModule);
   *
   * const userService = app.get(UserService);
   * const config = app.get<CacheConfig>(CACHE_CONFIG);
   * ```
   */
  public static async create(rootModule: Type<any>): Promise<ApplicationContext> {
    const container = new NestContainer();
    const scanner = new DependenciesScanner(container);
    const instanceLoader = new InstanceLoader(container);

    // Phase 1: Scan the module tree
    await scanner.scan(rootModule);

    // Phase 2: Create all provider instances
    await instanceLoader.createInstances();

    const app = new ApplicationContext(container, instanceLoader);
    app.isInitialized = true;

    return app;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ContainerResolver interface (used by @abdokouta/ts-container/react)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Resolve a provider by its injection token.
   *
   * Searches all modules for the provider. For singleton providers,
   * returns the cached instance.
   *
   * @param token - The injection token (class, string, or symbol)
   * @returns The resolved provider instance
   * @throws Error if the provider is not found
   *
   * @example
   * ```typescript
   * const userService = app.get(UserService);
   * const config = app.get<CacheConfig>(CACHE_CONFIG);
   * const apiUrl = app.get<string>('API_URL');
   * ```
   */
  public get<T = any>(token: InjectionToken<T>): T {
    this.assertInitialized();

    for (const [, moduleRef] of this.container.getModules()) {
      const wrapper = moduleRef.providers.get(token);
      if (!wrapper) continue;

      // Singleton or value provider — return cached instance
      if (wrapper.isResolved && !wrapper.isTransient) {
        return wrapper.instance as T;
      }

      // Transient provider — create a fresh instance each time.
      // All dependencies should already be resolved after bootstrap,
      // so we can synchronously instantiate the class.
      if (wrapper.isTransient && wrapper.metatype) {
        return this.instantiateTransient<T>(wrapper, moduleRef);
      }

      // Transient provider that was resolved during bootstrap
      // (has a cached instance from the initial resolution)
      if (wrapper.isTransient && wrapper.instance !== null) {
        return wrapper.instance as T;
      }
    }

    throw new Error(
      `Provider '${this.getTokenName(token)}' not found in any module. ` +
        `Make sure it is provided in a module that has been imported.`
    );
  }

  /**
   * Try to resolve a provider, returning `undefined` if not found.
   *
   * @param token - The injection token
   * @returns The resolved instance or undefined
   */
  public getOptional<T = any>(token: InjectionToken<T>): T | undefined {
    try {
      return this.get(token);
    } catch {
      return undefined;
    }
  }

  /**
   * Check if a provider is registered in any module.
   *
   * @param token - The injection token to check
   */
  public has(token: InjectionToken): boolean {
    for (const [, moduleRef] of this.container.getModules()) {
      if (moduleRef.providers.has(token)) return true;
    }
    return false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Advanced API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Select a specific module and resolve a provider from it.
   *
   * Useful when the same token exists in multiple modules.
   *
   * @param moduleClass - The module class to search in
   * @param token - The injection token
   */
  public select<T = any>(moduleClass: Type<any>, token: InjectionToken<T>): T {
    this.assertInitialized();

    for (const [, moduleRef] of this.container.getModules()) {
      if (moduleRef.metatype === moduleClass) {
        const wrapper = moduleRef.providers.get(token);
        if (wrapper?.isResolved) {
          return wrapper.instance as T;
        }
        throw new Error(
          `Provider '${this.getTokenName(token)}' not found in module '${moduleClass.name}'.`
        );
      }
    }

    throw new Error(`Module '${moduleClass.name}' not found in the container.`);
  }

  /**
   * Get the underlying NestContainer (for advanced use cases).
   */
  public getContainer(): NestContainer {
    return this.container;
  }

  /**
   * Gracefully shut down the application.
   *
   * Calls `onModuleDestroy()` on all providers that implement it,
   * in reverse module order (leaf modules first).
   */
  public async close(): Promise<void> {
    await this.instanceLoader.destroy();
    this.isInitialized = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private
  // ─────────────────────────────────────────────────────────────────────────

  private assertInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        'ApplicationContext is not initialized. Call ApplicationContext.create() first.'
      );
    }
  }

  private getTokenName(token: InjectionToken): string {
    if (typeof token === 'function') return token.name;
    if (typeof token === 'symbol') return token.toString();
    return String(token);
  }

  /**
   * Synchronously instantiate a transient provider.
   *
   * After bootstrap, all dependencies of a transient provider are already
   * resolved singletons. So we can synchronously look them up and call
   * `new Class(...deps)` without awaiting anything.
   */
  private instantiateTransient<T>(wrapper: any, moduleRef: ModuleRef): T {
    const injector = this.instanceLoader.getInjector();

    // Look up constructor dependencies — they should all be resolved singletons
    const metatype = wrapper.metatype;
    const deps = (injector as any).getConstructorDependencies(metatype);
    const optionalIndices: number[] = (injector as any).getOptionalDependencies(metatype);

    const resolvedDeps = deps.map((dep: InjectionToken, index: number) => {
      if (dep === undefined || dep === null || dep === Object) {
        if (optionalIndices.includes(index)) return undefined;
        return undefined;
      }

      const result = injector.lookupProvider(dep, moduleRef);
      if (!result) {
        if (optionalIndices.includes(index)) return undefined;
        throw new Error(`Cannot resolve transient dependency '${this.getTokenName(dep)}'`);
      }

      return result.wrapper.instance;
    });

    return new metatype(...resolvedDeps);
  }
}
