/**
 * @fileoverview Module — the runtime representation of a @Module() class.
 *
 * Each `@Module()` decorated class gets a corresponding `Module` instance
 * at runtime. The Module holds:
 * - All provider bindings (as InstanceWrappers)
 * - References to imported modules
 * - The set of exported tokens
 *
 * ## Module lifecycle:
 *
 * 1. **Registration** — The scanner creates a Module instance and registers
 *    providers, imports, and exports based on the @Module() metadata.
 *
 * 2. **Resolution** — The injector resolves all providers in the module,
 *    creating instances and injecting dependencies.
 *
 * 3. **Lifecycle hooks** — After all providers are resolved, onModuleInit()
 *    is called on providers that implement it.
 *
 * @module injector/module
 */

import type {
  InjectionToken,
  Type,
  Provider,
  ClassProvider,
  ValueProvider,
  FactoryProvider,
  ExistingProvider,
} from '@/interfaces';
import { Scope } from '@/interfaces';
import {
  isCustomProvider,
  isClassProvider,
  isValueProvider,
  isFactoryProvider,
  isExistingProvider,
} from '@/interfaces/provider.interface';
import { SCOPE_OPTIONS_METADATA } from '@/constants';
import { InstanceWrapper } from './instance-wrapper';

/**
 * Runtime representation of a module.
 *
 * Created by the scanner for each `@Module()` class encountered during
 * the module graph traversal.
 */
export class Module {
  /**
   * Unique identifier for this module instance.
   */
  public readonly id: string;

  /**
   * The original class decorated with @Module().
   */
  public readonly metatype: Type<any>;

  /**
   * Whether this module is global (its exports are available everywhere).
   */
  public isGlobal: boolean = false;

  /**
   * The opaque token used to identify this module in the container.
   */
  public token: string = '';

  /**
   * All providers registered in this module.
   * Key: injection token, Value: InstanceWrapper
   */
  private readonly _providers = new Map<InjectionToken, InstanceWrapper>();

  /**
   * Imported modules (their exports are available to this module).
   */
  private readonly _imports = new Set<Module>();

  /**
   * Tokens that this module exports (available to modules that import this one).
   */
  private readonly _exports = new Set<InjectionToken>();

  constructor(metatype: Type<any>) {
    this.metatype = metatype;
    this.id = `${metatype.name}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Accessors
  // ─────────────────────────────────────────────────────────────────────────

  get name(): string {
    return this.metatype.name;
  }

  get providers(): Map<InjectionToken, InstanceWrapper> {
    return this._providers;
  }

  get imports(): Set<Module> {
    return this._imports;
  }

  get exports(): Set<InjectionToken> {
    return this._exports;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Provider registration
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Register a provider in this module.
   *
   * Handles all provider forms:
   * - Class shorthand: `UserService`
   * - Class provider: `{ provide: Token, useClass: UserService }`
   * - Value provider: `{ provide: Token, useValue: someValue }`
   * - Factory provider: `{ provide: Token, useFactory: fn, inject: [...] }`
   * - Existing provider: `{ provide: Token, useExisting: OtherToken }`
   *
   * @param provider - The provider to register
   * @returns The injection token for this provider
   */
  public addProvider(provider: Provider): InjectionToken {
    if (isCustomProvider(provider)) {
      return this.addCustomProvider(provider);
    }

    // Class shorthand — the class itself is both the token and the implementation
    const classRef = provider as Type<any>;
    const scope = this.getClassScope(classRef);

    this._providers.set(
      classRef,
      new InstanceWrapper({
        token: classRef,
        name: classRef.name,
        metatype: classRef,
        instance: null,
        isResolved: false,
        scope,
        host: this,
      })
    );

    return classRef;
  }

  /**
   * Register a custom provider (one with a `provide` property).
   */
  private addCustomProvider(
    provider: ClassProvider | ValueProvider | FactoryProvider | ExistingProvider
  ): InjectionToken {
    if (isClassProvider(provider)) {
      this.addClassProvider(provider);
    } else if (isValueProvider(provider)) {
      this.addValueProvider(provider);
    } else if (isFactoryProvider(provider)) {
      this.addFactoryProvider(provider);
    } else if (isExistingProvider(provider)) {
      this.addExistingProvider(provider);
    }
    return provider.provide;
  }

  /**
   * Register a class provider: `{ provide: Token, useClass: SomeClass }`
   */
  private addClassProvider(provider: ClassProvider): void {
    const scope = provider.scope ?? this.getClassScope(provider.useClass);

    this._providers.set(
      provider.provide,
      new InstanceWrapper({
        token: provider.provide,
        name: provider.useClass?.name ?? String(provider.provide),
        metatype: provider.useClass,
        instance: null,
        isResolved: false,
        scope,
        host: this,
      })
    );
  }

  /**
   * Register a value provider: `{ provide: Token, useValue: value }`
   *
   * Value providers are immediately resolved — the value is stored as-is.
   */
  private addValueProvider(provider: ValueProvider): void {
    this._providers.set(
      provider.provide,
      new InstanceWrapper({
        token: provider.provide,
        name: this.getTokenName(provider.provide),
        metatype: null,
        instance: provider.useValue,
        isResolved: true,
        async: provider.useValue instanceof Promise,
        host: this,
      })
    );
  }

  /**
   * Register a factory provider: `{ provide: Token, useFactory: fn, inject: [...] }`
   *
   * The factory function is stored as the metatype and will be called
   * (not constructed with `new`) during resolution.
   */
  private addFactoryProvider(provider: FactoryProvider): void {
    this._providers.set(
      provider.provide,
      new InstanceWrapper({
        token: provider.provide,
        name: this.getTokenName(provider.provide),
        metatype: provider.useFactory as any,
        instance: null,
        isResolved: false,
        inject: provider.inject ?? [],
        scope: provider.scope ?? Scope.DEFAULT,
        host: this,
      })
    );
  }

  /**
   * Register an existing (alias) provider: `{ provide: Token, useExisting: OtherToken }`
   *
   * Implemented as a factory that resolves the target token.
   */
  private addExistingProvider(provider: ExistingProvider): void {
    this._providers.set(
      provider.provide,
      new InstanceWrapper({
        token: provider.provide,
        name: this.getTokenName(provider.provide),
        metatype: ((instance: any) => instance) as any,
        instance: null,
        isResolved: false,
        inject: [provider.useExisting],
        isAlias: true,
        host: this,
      })
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Imports & Exports
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Add an imported module.
   */
  public addImport(moduleRef: Module): void {
    this._imports.add(moduleRef);
  }

  /**
   * Add an exported token.
   *
   * @param token - The token to export (class, string, symbol, or module class)
   */
  public addExport(token: InjectionToken): void {
    this._exports.add(token);
  }

  /**
   * Check if this module has a provider for the given token.
   */
  public hasProvider(token: InjectionToken): boolean {
    return this._providers.has(token);
  }

  /**
   * Get a provider wrapper by token.
   */
  public getProviderByToken<T = any>(token: InjectionToken): InstanceWrapper<T> | undefined {
    return this._providers.get(token) as InstanceWrapper<T> | undefined;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Read the scope from a class's @Injectable() metadata.
   */
  private getClassScope(type: Type<any>): Scope {
    const options = Reflect.getMetadata(SCOPE_OPTIONS_METADATA, type);
    return options?.scope ?? Scope.DEFAULT;
  }

  /**
   * Get a human-readable name from a token.
   */
  private getTokenName(token: InjectionToken): string {
    if (typeof token === 'function') return token.name;
    if (typeof token === 'symbol') return token.toString();
    return String(token);
  }
}
