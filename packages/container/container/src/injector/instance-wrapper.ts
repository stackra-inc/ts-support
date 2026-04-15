/**
 * @fileoverview InstanceWrapper — wraps a provider binding with its metadata and instance.
 *
 * Every provider registered in a module gets wrapped in an InstanceWrapper.
 * The wrapper tracks:
 * - The injection token (how consumers ask for it)
 * - The metatype (the class/factory to instantiate)
 * - The resolved instance (once created)
 * - The scope (singleton vs transient)
 * - Whether it's been resolved yet
 * - Factory dependencies (for useFactory providers)
 *
 * This is a simplified version of NestJS's InstanceWrapper — we don't need
 * request scoping, context IDs, or transient maps for client-side use.
 *
 * @module injector/instance-wrapper
 */

import type { InjectionToken, Type } from '@/interfaces';
import { Scope } from '@/interfaces';
import type { Module } from './module';

/**
 * Wraps a single provider binding with all its metadata.
 *
 * @typeParam T - The type of the provider instance
 */
export class InstanceWrapper<T = any> {
  /**
   * The injection token used to look up this provider.
   */
  public readonly token: InjectionToken;

  /**
   * Human-readable name (class name or token string).
   */
  public readonly name: string;

  /**
   * The class constructor or factory function.
   * - For class providers: the class to `new`
   * - For factory providers: the factory function
   * - For value providers: `null`
   */
  public metatype: Type<T> | Function | null;

  /**
   * The resolved instance.
   * - `null` before resolution
   * - The actual instance after resolution
   * - For value providers: set immediately at registration
   */
  public instance: T | null = null;

  /**
   * Whether this provider has been fully resolved (instance created).
   */
  public isResolved: boolean = false;

  /**
   * The scope of this provider.
   */
  public scope: Scope = Scope.DEFAULT;

  /**
   * For factory providers: the tokens to inject as factory arguments.
   * `null` for class and value providers.
   */
  public inject: InjectionToken[] | null = null;

  /**
   * Whether this is an alias (useExisting) provider.
   * Alias providers delegate resolution to another token.
   */
  public isAlias: boolean = false;

  /**
   * Whether the instance is a Promise (async factory).
   */
  public async: boolean = false;

  /**
   * The module this provider belongs to.
   */
  public host: Module | null = null;

  /**
   * Create a new InstanceWrapper.
   *
   * @param metadata - Initial values for the wrapper properties
   */
  constructor(metadata: Partial<InstanceWrapper<T>> = {}) {
    this.token = metadata.token!;
    this.name = metadata.name ?? this.getTokenName(metadata.token!);
    this.metatype = metadata.metatype ?? null;
    this.instance = metadata.instance ?? null;
    this.isResolved = metadata.isResolved ?? false;
    this.scope = metadata.scope ?? Scope.DEFAULT;
    this.inject = metadata.inject ?? null;
    this.isAlias = metadata.isAlias ?? false;
    this.async = metadata.async ?? false;
    this.host = metadata.host ?? null;
  }

  /**
   * Whether this provider is a factory (has an `inject` array).
   * Factory providers are invoked as functions, not constructed with `new`.
   */
  get isFactory(): boolean {
    return this.inject !== null;
  }

  /**
   * Whether this provider is transient (new instance per injection).
   */
  get isTransient(): boolean {
    return this.scope === Scope.TRANSIENT;
  }

  /**
   * Extract a human-readable name from a token.
   */
  private getTokenName(token: InjectionToken): string {
    if (typeof token === 'function') return token.name;
    if (typeof token === 'symbol') return token.toString();
    return String(token);
  }
}
