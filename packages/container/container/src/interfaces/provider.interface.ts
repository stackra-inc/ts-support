/**
 * @fileoverview Provider types — the different ways to register a dependency.
 *
 * Providers are the fundamental building blocks of the DI system.
 * They tell the container HOW to create an instance for a given token.
 *
 * Four provider types are supported (same as NestJS):
 *
 * 1. **Class provider** — `{ provide: Token, useClass: SomeClass }`
 * 2. **Value provider** — `{ provide: Token, useValue: someValue }`
 * 3. **Factory provider** — `{ provide: Token, useFactory: () => value, inject: [Dep1] }`
 * 4. **Existing provider** (alias) — `{ provide: Token, useExisting: OtherToken }`
 *
 * Plus the shorthand: just passing a class directly (equivalent to `{ provide: Class, useClass: Class }`).
 *
 * @module interfaces/provider
 */

import type { Type } from './type.interface';
import type { InjectionToken } from './injection-token.interface';
import type { Scope } from './scope.enum';

/**
 * Class provider — binds a token to a class that will be instantiated by the container.
 *
 * The container will:
 * 1. Read the class's constructor parameter types
 * 2. Resolve each dependency recursively
 * 3. Call `new useClass(...resolvedDeps)`
 *
 * @example
 * ```typescript
 * // Bind an interface token to a concrete implementation
 * { provide: 'IUserRepository', useClass: PostgresUserRepository }
 *
 * // Bind a class to itself (same as just listing the class)
 * { provide: UserService, useClass: UserService }
 * ```
 */
export interface ClassProvider<T = any> {
  /**
   * The injection token (what consumers ask for).
   */
  provide: InjectionToken;
  /**
   * The class to instantiate when this token is requested.
   */
  useClass: Type<T>;
  /**
   * Optional scope override.
   */
  scope?: Scope;
}

/**
 * Value provider — binds a token to a pre-existing value.
 *
 * No instantiation occurs. The exact value is returned as-is.
 * Useful for configuration objects, constants, and pre-built instances.
 *
 * @example
 * ```typescript
 * // Bind a configuration object
 * { provide: CACHE_CONFIG, useValue: { default: 'memory', stores: { ... } } }
 *
 * // Bind a primitive
 * { provide: 'API_URL', useValue: 'https://api.example.com' }
 *
 * // Bind a pre-built instance
 * { provide: Logger, useValue: new Logger('app') }
 * ```
 */
export interface ValueProvider<T = any> {
  /**
   * The injection token.
   */
  provide: InjectionToken;
  /**
   * The value to inject. Returned as-is, no instantiation.
   */
  useValue: T;
}

/**
 * Factory provider — binds a token to a factory function.
 *
 * The factory function is called once (for singletons) or per-injection
 * (for transients). Dependencies can be injected into the factory via
 * the `inject` array.
 *
 * @example
 * ```typescript
 * // Simple factory
 * {
 *   provide: 'CONNECTION',
 *   useFactory: () => createConnection({ host: 'localhost' }),
 * }
 *
 * // Factory with injected dependencies
 * {
 *   provide: CacheManager,
 *   useFactory: (config: ConfigService) => new CacheManager(config.get('cache')),
 *   inject: [ConfigService],
 * }
 *
 * // Async factory
 * {
 *   provide: 'DB_CONNECTION',
 *   useFactory: async (config: ConfigService) => {
 *     const conn = await createConnection(config.get('database'));
 *     return conn;
 *   },
 *   inject: [ConfigService],
 * }
 * ```
 */
export interface FactoryProvider<T = any> {
  /**
   * The injection token.
   */
  provide: InjectionToken;
  /**
   * Factory function that creates the value. Can be async.
   */
  useFactory: (...args: any[]) => T | Promise<T>;
  /**
   * Tokens to inject as arguments to the factory function.
   */
  inject?: InjectionToken[];
  /**
   * Optional scope override.
   */
  scope?: Scope;
}

/**
 * Existing provider (alias) — binds a token to another token.
 *
 * When the alias token is requested, the container resolves the
 * target token instead. Useful for providing multiple tokens that
 * resolve to the same instance.
 *
 * @example
 * ```typescript
 * // Make CACHE_SERVICE resolve to the same instance as CacheManager
 * { provide: CACHE_SERVICE, useExisting: CacheManager }
 * ```
 */
export interface ExistingProvider<T = any> {
  /**
   * The alias injection token.
   */
  provide: InjectionToken;
  /**
   * The target token to resolve instead.
   */
  useExisting: InjectionToken<T>;
}

/**
 * Union type of all provider forms.
 *
 * A provider can be:
 * - A class reference (shorthand for `{ provide: Class, useClass: Class }`)
 * - A ClassProvider
 * - A ValueProvider
 * - A FactoryProvider
 * - An ExistingProvider
 *
 * @example
 * ```typescript
 * const providers: Provider[] = [
 *   UserService,                                          // class shorthand
 *   { provide: 'API_URL', useValue: 'https://...' },     // value
 *   { provide: CacheManager, useClass: CacheManager },   // class
 *   { provide: DB, useFactory: () => connect() },        // factory
 *   { provide: CACHE, useExisting: CacheManager },       // alias
 * ];
 * ```
 */
export type Provider<T = any> =
  | Type<T>
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>
  | ExistingProvider<T>;

// ─────────────────────────────────────────────────────────────────────────────
// Type guards for provider classification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a provider is a custom provider (has a `provide` property).
 */
export function isCustomProvider(
  provider: Provider
): provider is ClassProvider | ValueProvider | FactoryProvider | ExistingProvider {
  return provider !== null && typeof provider === 'object' && 'provide' in provider;
}

/**
 * Check if a provider is a class shorthand (just a class reference).
 */
export function isClassShorthand(provider: Provider): provider is Type {
  return typeof provider === 'function';
}

/**
 * Check if a provider uses `useClass`.
 */
export function isClassProvider(provider: Provider): provider is ClassProvider {
  return (
    isCustomProvider(provider) && 'useClass' in provider && (provider as any).useClass !== undefined
  );
}

/**
 * Check if a provider uses `useValue`.
 */
export function isValueProvider(provider: Provider): provider is ValueProvider {
  return isCustomProvider(provider) && 'useValue' in provider;
}

/**
 * Check if a provider uses `useFactory`.
 */
export function isFactoryProvider(provider: Provider): provider is FactoryProvider {
  return (
    isCustomProvider(provider) &&
    'useFactory' in provider &&
    typeof (provider as any).useFactory === 'function'
  );
}

/**
 * Check if a provider uses `useExisting`.
 */
export function isExistingProvider(provider: Provider): provider is ExistingProvider {
  return (
    isCustomProvider(provider) &&
    'useExisting' in provider &&
    (provider as any).useExisting !== undefined
  );
}
