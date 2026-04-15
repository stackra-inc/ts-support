/**
 * @fileoverview Injector — resolves dependencies and creates provider instances.
 *
 * The injector is the engine that turns the module graph (built by the scanner)
 * into actual, live instances. For each provider, it:
 *
 * 1. Reads constructor parameter types from metadata
 * 2. Resolves each dependency (recursively)
 * 3. Creates the instance (via `new` for classes, or by calling the factory)
 * 4. Applies property injection
 * 5. Marks the provider as resolved
 *
 * ## Resolution algorithm:
 *
 * For a given token in a given module:
 * 1. Look in the module's own providers
 * 2. If not found, look in imported modules' exports (recursively)
 * 3. If still not found, throw UnknownDependencyError
 *
 * ## Singleton vs Transient:
 *
 * - Singleton (DEFAULT): resolved once, cached in the InstanceWrapper
 * - Transient: a new instance is created every time it's injected
 *
 * @module injector/injector
 */

import 'reflect-metadata';
import type { InjectionToken, Type } from '@/interfaces';
import {
  PARAMTYPES_METADATA,
  SELF_DECLARED_DEPS_METADATA,
  OPTIONAL_DEPS_METADATA,
  PROPERTY_DEPS_METADATA,
  OPTIONAL_PROPERTY_DEPS_METADATA,
} from '@/constants';
import { InstanceWrapper } from './instance-wrapper';
import { Module } from './module';

/**
 * The Injector resolves and instantiates providers.
 *
 * It's stateless — all state lives in the InstanceWrappers within modules.
 * The injector just reads metadata and creates instances.
 */
export class Injector {
  /**
   * Tracks which wrappers are currently being resolved, to detect circular dependencies.
   * Uses a Set of tokens being resolved in the current chain.
   */
  private readonly resolutionStack = new Set<InjectionToken>();

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Resolve all providers in a module.
   *
   * Iterates over all providers and resolves each one.
   * Value providers are already resolved at registration time.
   *
   * @param moduleRef - The module whose providers to resolve
   */
  public async resolveProviders(moduleRef: Module): Promise<void> {
    const providers = moduleRef.providers;

    for (const [_token, wrapper] of providers) {
      if (!wrapper.isResolved) {
        await this.resolveInstance(wrapper, moduleRef);
      }
    }
  }

  /**
   * Resolve a single provider instance.
   *
   * This is the core resolution method. It handles:
   * - Already-resolved singletons (returns cached instance)
   * - Circular dependency detection
   * - Factory providers (calls the factory function)
   * - Class providers (resolves constructor deps, then `new`)
   * - Property injection (after construction)
   * - Async factories (awaits the result)
   *
   * @param wrapper - The InstanceWrapper to resolve
   * @param moduleRef - The module context for dependency lookup
   */
  public async resolveInstance<T>(wrapper: InstanceWrapper<T>, moduleRef: Module): Promise<T> {
    // Already resolved singleton — return cached instance
    if (wrapper.isResolved && !wrapper.isTransient) {
      return wrapper.instance!;
    }

    // Circular dependency detection
    if (this.resolutionStack.has(wrapper.token)) {
      throw new Error(`Circular dependency detected: ${this.formatResolutionStack(wrapper.token)}`);
    }

    this.resolutionStack.add(wrapper.token);

    try {
      let instance: T;

      if (wrapper.isFactory) {
        // ── Factory provider ─────────────────────────────────────────
        instance = await this.resolveFactory(wrapper, moduleRef);
      } else if (wrapper.metatype) {
        // ── Class provider ───────────────────────────────────────────
        instance = await this.resolveClass(wrapper, moduleRef);
      } else {
        // ── Value provider (should already be resolved) ──────────────
        instance = wrapper.instance!;
      }

      // Cache the instance
      // For singletons: cached permanently
      // For transients: cached as the "last created" instance,
      //   but get() will create fresh instances on each call
      wrapper.instance = instance;
      wrapper.isResolved = true;

      return instance;
    } finally {
      this.resolutionStack.delete(wrapper.token);
    }
  }

  /**
   * Look up a provider by token, searching the module and its imports.
   *
   * Resolution order:
   * 1. The module's own providers
   * 2. Imported modules' exported providers (breadth-first)
   *
   * @param token - The injection token to look up
   * @param moduleRef - The module context
   * @returns The InstanceWrapper and the module it was found in
   */
  public lookupProvider(
    token: InjectionToken,
    moduleRef: Module
  ): { wrapper: InstanceWrapper; host: Module } | undefined {
    // 1. Check own providers
    if (moduleRef.providers.has(token)) {
      return { wrapper: moduleRef.providers.get(token)!, host: moduleRef };
    }

    // 2. Check imported modules' exports
    return this.lookupInImports(token, moduleRef, new Set());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private: Class resolution
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Resolve a class provider by:
   * 1. Reading constructor parameter types from metadata
   * 2. Resolving each dependency
   * 3. Calling `new Class(...deps)`
   * 4. Applying property injection
   */
  private async resolveClass<T>(wrapper: InstanceWrapper<T>, moduleRef: Module): Promise<T> {
    const metatype = wrapper.metatype as Type<T>;

    // Get constructor dependencies
    const deps = this.getConstructorDependencies(metatype);
    const optionalIndices = this.getOptionalDependencies(metatype);

    // Resolve each dependency
    const resolvedDeps = await Promise.all(
      deps.map(async (dep, index) => {
        // Unresolvable type (undefined, null, or generic Object from erased interfaces)
        if (dep === undefined || dep === null || dep === Object) {
          if (optionalIndices.includes(index)) return undefined;
          throw new Error(
            `Cannot resolve dependency at index [${index}] of ${metatype.name}. ` +
              `The dependency is undefined — this usually means a circular import or missing @Inject() decorator.`
          );
        }

        try {
          return await this.resolveDependency(dep, moduleRef);
        } catch (err) {
          // If the dependency is optional and resolution fails, return undefined
          if (optionalIndices.includes(index)) return undefined;
          throw new Error(
            `Cannot resolve dependency '${this.getTokenName(dep)}' at index [${index}] of ${metatype.name}. ` +
              `Make sure it is provided in the module or imported. Original: ${(err as Error).message}`
          );
        }
      })
    );

    // Instantiate
    const instance = new metatype(...resolvedDeps);

    // Property injection
    await this.resolveProperties(instance, metatype, moduleRef);

    return instance;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private: Factory resolution
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Resolve a factory provider by:
   * 1. Resolving the factory's `inject` dependencies
   * 2. Calling the factory function with the resolved deps
   * 3. Awaiting the result if it's a Promise
   *
   * For `useExisting` (alias) providers, the factory's dependencies
   * are resolved in the factory's host module, not the consumer's module.
   * This ensures cross-module aliases work correctly.
   */
  private async resolveFactory<T>(wrapper: InstanceWrapper<T>, moduleRef: Module): Promise<T> {
    const factory = wrapper.metatype as Function;
    const injectTokens = wrapper.inject ?? [];

    // Use the factory's host module for dependency resolution.
    // This is critical for useExisting aliases — the alias lives in
    // module A but is consumed from module B. The alias's inject deps
    // (e.g., the target class) must be resolved in module A, not B.
    const resolveContext = wrapper.host ?? moduleRef;

    // Resolve factory dependencies
    const resolvedDeps = await Promise.all(
      injectTokens.map(async (token) => {
        try {
          return await this.resolveDependency(token, resolveContext);
        } catch (err) {
          throw new Error(
            `Cannot resolve factory dependency '${this.getTokenName(token)}' ` +
              `for provider '${wrapper.name}'. ${(err as Error).message}`
          );
        }
      })
    );

    // Call the factory
    const result = factory(...resolvedDeps);

    // Handle async factories
    return result instanceof Promise ? await result : result;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private: Dependency resolution
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Resolve a single dependency token to its instance.
   *
   * Looks up the provider, resolves it if needed, and returns the instance.
   */
  private async resolveDependency(token: InjectionToken, moduleRef: Module): Promise<any> {
    const result = this.lookupProvider(token, moduleRef);

    if (!result) {
      throw new Error(
        `Provider '${this.getTokenName(token)}' not found. ` +
          `Is it provided in the current module or an imported module?`
      );
    }

    const { wrapper, host } = result;

    // Resolve if not yet resolved, or if transient (always create new)
    if (!wrapper.isResolved || wrapper.isTransient) {
      return this.resolveInstance(wrapper, host);
    }

    // Handle async values (Promise instances stored as values)
    if (wrapper.async && wrapper.instance instanceof Promise) {
      wrapper.instance = await wrapper.instance;
    }

    return wrapper.instance;
  }

  /**
   * Look up a provider in imported modules' exports.
   *
   * Searches breadth-first through the import tree, only considering
   * providers that are in the imported module's exports set.
   */
  private lookupInImports(
    token: InjectionToken,
    moduleRef: Module,
    visited: Set<string>
  ): { wrapper: InstanceWrapper; host: Module } | undefined {
    for (const importedModule of moduleRef.imports) {
      if (visited.has(importedModule.id)) continue;
      visited.add(importedModule.id);

      // Check if the imported module exports this token AND has a provider for it
      if (importedModule.exports.has(token) && importedModule.providers.has(token)) {
        return {
          wrapper: importedModule.providers.get(token)!,
          host: importedModule,
        };
      }

      // Recurse into the imported module's imports (for re-exported modules)
      const result = this.lookupInImports(token, importedModule, visited);
      if (result) return result;
    }

    return undefined;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private: Metadata reading
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get the constructor dependencies for a class.
   *
   * Merges TypeScript's auto-emitted `design:paramtypes` with
   * explicitly declared `self:paramtypes` (from @Inject decorators).
   * Explicit declarations override auto-detected types.
   *
   * Also checks the prototype chain to handle cases where bundlers
   * (SWC, esbuild) create wrapper classes during decoration — the
   * parameter decorators may have stored metadata on the original
   * class while the class decorator created a new reference.
   *
   * @param type - The class to read metadata from
   * @returns Array of injection tokens, one per constructor parameter
   */
  private getConstructorDependencies(type: Type<any>): InjectionToken[] {
    // Auto-detected types from TypeScript's emitDecoratorMetadata
    // Try the class itself first, then its prototype chain
    const paramTypes: any[] = [
      ...(Reflect.getMetadata(PARAMTYPES_METADATA, type) ??
        Reflect.getOwnMetadata(PARAMTYPES_METADATA, type) ??
        []),
    ];

    // Explicit overrides from @Inject() decorators
    // Check both the class and its prototype chain (handles SWC/esbuild
    // wrapper classes where param decorators ran on the original class)
    const selfDeclared: Array<{ index: number; param: InjectionToken }> =
      Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, type) || [];

    // Merge: explicit @Inject() overrides auto-detected types
    for (const { index, param } of selfDeclared) {
      paramTypes[index] = param;
    }

    return paramTypes;
  }

  /**
   * Get the indices of optional constructor parameters.
   *
   * Checks both the class and its prototype chain for the same
   * reason as getConstructorDependencies — bundler wrapper classes.
   */
  private getOptionalDependencies(type: Type<any>): number[] {
    return Reflect.getMetadata(OPTIONAL_DEPS_METADATA, type) || [];
  }

  /**
   * Resolve property-injected dependencies and assign them to the instance.
   */
  private async resolveProperties<T>(instance: T, type: Type<T>, moduleRef: Module): Promise<void> {
    const properties: Array<{ key: string | symbol; type: InjectionToken }> =
      Reflect.getMetadata(PROPERTY_DEPS_METADATA, type) || [];

    const optionalKeys: Array<string | symbol> =
      Reflect.getMetadata(OPTIONAL_PROPERTY_DEPS_METADATA, type) || [];

    for (const prop of properties) {
      const isOptional = optionalKeys.includes(prop.key);

      try {
        const resolved = await this.resolveDependency(prop.type, moduleRef);
        (instance as any)[prop.key] = resolved;
      } catch (err) {
        if (!isOptional) throw err;
        // Optional property — leave as undefined
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private: Helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Format the resolution stack for error messages.
   */
  private formatResolutionStack(token: InjectionToken): string {
    const stack = [...this.resolutionStack, token];
    return stack.map((t) => this.getTokenName(t)).join(' → ');
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
