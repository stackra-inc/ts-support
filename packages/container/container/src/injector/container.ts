/**
 * @fileoverview NestContainer — the top-level container that holds all modules.
 *
 * This is the central registry of the DI system. It holds:
 * - All registered modules (keyed by opaque token)
 * - The set of global modules
 * - Dynamic module metadata
 *
 * ## How the container is used:
 *
 * 1. The **scanner** calls `addModule()` for each module in the graph
 * 2. The **scanner** calls `addProvider()`, `addImport()`, `addExport()` to populate modules
 * 3. The **scanner** calls `bindGlobalScope()` to link global modules to all other modules
 * 4. The **injector** reads from modules to resolve dependencies
 *
 * The container itself does NOT resolve dependencies — that's the injector's job.
 * The container is purely a data structure that holds the module graph.
 *
 * @module injector/container
 */

import 'reflect-metadata';
import type { Type, Provider, DynamicModule, InjectionToken } from '@/interfaces';
import { GLOBAL_MODULE_METADATA } from '@/constants';
import { Module } from './module';

/**
 * The type of a module definition — can be a class, dynamic module, or promise.
 */
export type ModuleMetatype = Type<any> | DynamicModule | Promise<DynamicModule>;

/**
 * The top-level DI container.
 *
 * Holds all modules and their provider bindings. Created once during
 * application bootstrap and shared throughout the application lifetime.
 */
export class NestContainer {
  /**
   * All registered modules, keyed by their opaque token.
   * The token is derived from the module class name (or a hash for dynamic modules).
   */
  private readonly modules = new Map<string, Module>();

  /**
   * Global modules whose exports are available to all other modules.
   */
  private readonly globalModules = new Set<Module>();

  /**
   * Dynamic module metadata, keyed by module token.
   * Stored separately because dynamic metadata is merged with static @Module() metadata.
   */
  private readonly dynamicModulesMetadata = new Map<string, Partial<DynamicModule>>();

  // ─────────────────────────────────────────────────────────────────────────
  // Module registration
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Add a module to the container.
   *
   * If the module is already registered (by token), returns the existing one.
   * Otherwise, creates a new Module instance and registers it.
   *
   * @param metatype - The module class or dynamic module
   * @returns The Module instance and whether it was newly inserted
   */
  public async addModule(
    metatype: ModuleMetatype
  ): Promise<{ moduleRef: Module; inserted: boolean }> {
    // Resolve promises (for async dynamic modules)
    const resolved = metatype instanceof Promise ? await metatype : metatype;

    // Extract the class and dynamic metadata
    const { type, dynamicMetadata, token } = this.extractModuleMetadata(resolved);

    // Check if already registered
    if (this.modules.has(token)) {
      return { moduleRef: this.modules.get(token)!, inserted: false };
    }

    // Create and register the module
    const moduleRef = new Module(type);
    moduleRef.token = token;
    this.modules.set(token, moduleRef);

    // Store dynamic metadata for later merging
    if (dynamicMetadata) {
      this.dynamicModulesMetadata.set(token, dynamicMetadata);
    }

    // Check if this is a global module
    if (this.isGlobalModule(type, dynamicMetadata)) {
      moduleRef.isGlobal = true;
      this.globalModules.add(moduleRef);
    }

    return { moduleRef, inserted: true };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Provider, Import, Export registration
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Add a provider to a module.
   *
   * @param provider - The provider to add
   * @param token - The module token to add the provider to
   */
  public addProvider(provider: Provider, token: string): void {
    const moduleRef = this.modules.get(token);
    if (!moduleRef) {
      throw new Error(`Module [${token}] not found in container.`);
    }
    moduleRef.addProvider(provider);
  }

  /**
   * Add an import relationship between modules.
   *
   * @param relatedModule - The module being imported
   * @param token - The token of the module doing the importing
   */
  public addImport(relatedModule: Type<any> | DynamicModule, token: string): void {
    const moduleRef = this.modules.get(token);
    if (!moduleRef) return;

    const { token: relatedToken } = this.extractModuleMetadata(relatedModule);
    const related = this.modules.get(relatedToken);
    if (related) {
      moduleRef.addImport(related);
    }
  }

  /**
   * Add an export to a module.
   *
   * @param toExport - The token or provider to export
   * @param token - The module token
   */
  public addExport(toExport: InjectionToken | Provider | DynamicModule, token: string): void {
    const moduleRef = this.modules.get(token);
    if (!moduleRef) return;

    if (typeof toExport === 'object' && toExport !== null && 'module' in toExport) {
      // Exporting a dynamic module — export the module class
      moduleRef.addExport((toExport as DynamicModule).module);
    } else if (typeof toExport === 'object' && toExport !== null && 'provide' in toExport) {
      // Exporting a custom provider — export its token
      moduleRef.addExport((toExport as any).provide);
    } else {
      // Exporting a token directly (class, string, symbol)
      moduleRef.addExport(toExport as InjectionToken);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Global scope binding
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Link all global modules to all non-global modules as imports.
   *
   * Called after all modules have been scanned. This makes global modules'
   * exports available everywhere without explicit imports.
   */
  public bindGlobalScope(): void {
    for (const moduleRef of this.modules.values()) {
      for (const globalModule of this.globalModules) {
        if (moduleRef !== globalModule) {
          moduleRef.addImport(globalModule);
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Accessors
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all registered modules.
   */
  public getModules(): Map<string, Module> {
    return this.modules;
  }

  /**
   * Get a module by its token.
   */
  public getModuleByToken(token: string): Module | undefined {
    return this.modules.get(token);
  }

  /**
   * Get dynamic metadata for a module.
   *
   * @param token - The module token
   * @param key - Optional specific key to retrieve (e.g., 'imports', 'providers')
   */
  public getDynamicMetadata(token: string): Partial<DynamicModule> | undefined;
  public getDynamicMetadata<K extends keyof DynamicModule>(
    token: string,
    key: K
  ): DynamicModule[K] | undefined;
  public getDynamicMetadata(token: string, key?: string): any {
    const metadata = this.dynamicModulesMetadata.get(token);
    if (!metadata) return key ? [] : undefined;
    return key ? ((metadata as any)[key] ?? []) : metadata;
  }

  /**
   * Clear all modules (for testing).
   */
  public clear(): void {
    this.modules.clear();
    this.globalModules.clear();
    this.dynamicModulesMetadata.clear();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Extract the module class, dynamic metadata, and token from a module definition.
   *
   * Handles both static modules (just a class) and dynamic modules
   * (objects with a `module` property).
   */
  private extractModuleMetadata(metatype: Type<any> | DynamicModule): {
    type: Type<any>;
    dynamicMetadata: Partial<DynamicModule> | undefined;
    token: string;
  } {
    if (this.isDynamicModule(metatype)) {
      const { module: type, ...dynamicMetadata } = metatype as DynamicModule;
      return {
        type,
        dynamicMetadata,
        token: type.name,
      };
    }

    return {
      type: metatype as Type<any>,
      dynamicMetadata: undefined,
      token: (metatype as Type<any>).name,
    };
  }

  /**
   * Check if a module definition is a dynamic module (has a `module` property).
   */
  private isDynamicModule(metatype: any): metatype is DynamicModule {
    return metatype && !!(metatype as DynamicModule).module;
  }

  /**
   * Check if a module should be global.
   * A module is global if:
   * - It has the @Global() decorator, OR
   * - Its dynamic metadata has `global: true`
   */
  private isGlobalModule(type: Type<any>, dynamicMetadata?: Partial<DynamicModule>): boolean {
    if (dynamicMetadata?.global) return true;
    return !!Reflect.getMetadata(GLOBAL_MODULE_METADATA, type);
  }
}
