/**
 * @fileoverview DependenciesScanner — recursively scans the module tree.
 *
 * The scanner is the first phase of the DI bootstrap. It walks the module
 * graph starting from the root module and:
 *
 * 1. Registers each module in the container
 * 2. Registers each module's providers
 * 3. Sets up import relationships between modules
 * 4. Sets up export declarations
 * 5. Links global modules to all other modules
 *
 * After scanning, the container has a complete picture of the module graph
 * but NO instances have been created yet. That's the injector's job.
 *
 * ## Scan algorithm:
 *
 * ```
 * scan(RootModule)
 *   → scanForModules(RootModule)        // recursive DFS
 *     → addModule(RootModule)
 *     → scanForModules(ImportedModule1)  // recurse into imports
 *     → scanForModules(ImportedModule2)
 *   → scanModulesForDependencies()      // second pass
 *     → for each module:
 *       → reflectImports()
 *       → reflectProviders()
 *       → reflectExports()
 *   → bindGlobalScope()                 // link globals
 * ```
 *
 * @module injector/scanner
 */

import 'reflect-metadata';
import type { Type, DynamicModule, Provider, ForwardReference } from '@/interfaces';
import { MODULE_METADATA } from '@/constants';
import { NestContainer, type ModuleMetatype } from './container';

/**
 * Scans the module tree and populates the container.
 */
export class DependenciesScanner {
  constructor(private readonly container: NestContainer) {}

  /**
   * Scan the entire module tree starting from the root module.
   *
   * This is the main entry point. After this method completes,
   * the container has all modules, providers, imports, and exports
   * registered — but no instances created.
   *
   * @param rootModule - The root module class (your AppModule)
   */
  public async scan(rootModule: Type<any>): Promise<void> {
    // Phase 1: Discover all modules (recursive DFS)
    await this.scanForModules(rootModule, []);

    // Phase 2: Register providers, imports, exports for each module
    await this.scanModulesForDependencies();

    // Phase 3: Link global modules to all other modules
    this.container.bindGlobalScope();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 1: Module discovery
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Recursively discover and register all modules in the graph.
   *
   * Uses DFS traversal. Tracks visited modules to avoid infinite loops
   * from circular imports.
   *
   * @param moduleDefinition - The module to scan (class or dynamic module)
   * @param ctxRegistry - Already-visited modules (for cycle detection)
   */
  private async scanForModules(
    moduleDefinition: ModuleMetatype,
    ctxRegistry: any[]
  ): Promise<void> {
    // Resolve forward references
    const resolved = this.resolveForwardRef(moduleDefinition);
    if (!resolved) return;

    // Skip if already visited (circular import protection)
    if (ctxRegistry.includes(resolved)) return;
    ctxRegistry.push(resolved);

    // Register this module in the container
    await this.container.addModule(resolved);

    // Get this module's imports (from both static @Module() and dynamic metadata)
    const imports = this.getModuleImports(resolved);

    // Recurse into each import
    for (const importedModule of imports) {
      if (importedModule === undefined || importedModule === null) {
        const moduleName = this.getModuleName(resolved);
        throw new Error(
          `An undefined module was imported by ${moduleName}. ` +
            `This is usually caused by a circular dependency. Use forwardRef() to resolve it.`
        );
      }
      await this.scanForModules(importedModule, ctxRegistry);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 2: Dependency registration
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * For each registered module, read its metadata and register
   * providers, imports, and exports.
   */
  private async scanModulesForDependencies(): Promise<void> {
    const modules = this.container.getModules();

    for (const [token, moduleRef] of modules) {
      // Register imports (module relationships)
      await this.reflectImports(moduleRef.metatype, token);

      // Register providers
      this.reflectProviders(moduleRef.metatype, token);

      // Register exports
      this.reflectExports(moduleRef.metatype, token);
    }
  }

  /**
   * Read and register a module's imports.
   *
   * Merges static @Module({ imports }) with dynamic module imports.
   */
  private async reflectImports(metatype: Type<any>, token: string): Promise<void> {
    const staticImports: any[] = Reflect.getMetadata(MODULE_METADATA.IMPORTS, metatype) || [];
    const dynamicImports: any[] = this.container.getDynamicMetadata(token, 'imports' as any) || [];

    const allImports = [...staticImports, ...dynamicImports];

    for (const related of allImports) {
      const resolved = this.resolveForwardRef(related);
      if (resolved) {
        this.container.addImport(resolved, token);
      }
    }
  }

  /**
   * Read and register a module's providers.
   *
   * Merges static @Module({ providers }) with dynamic module providers.
   */
  private reflectProviders(metatype: Type<any>, token: string): void {
    const staticProviders: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, metatype) || [];
    const dynamicProviders: Provider[] =
      this.container.getDynamicMetadata(token, 'providers' as any) || [];

    const allProviders = [...staticProviders, ...dynamicProviders];

    for (const provider of allProviders) {
      this.container.addProvider(provider, token);
    }
  }

  /**
   * Read and register a module's exports.
   *
   * Merges static @Module({ exports }) with dynamic module exports.
   */
  private reflectExports(metatype: Type<any>, token: string): void {
    const staticExports: any[] = Reflect.getMetadata(MODULE_METADATA.EXPORTS, metatype) || [];
    const dynamicExports: any[] = this.container.getDynamicMetadata(token, 'exports' as any) || [];

    const allExports = [...staticExports, ...dynamicExports];

    for (const exported of allExports) {
      const resolved = this.resolveForwardRef(exported);
      this.container.addExport(resolved ?? exported, token);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get a module's imports from both static and dynamic sources.
   */
  private getModuleImports(moduleDefinition: any): any[] {
    if (this.isDynamicModule(moduleDefinition)) {
      const staticImports: any[] =
        Reflect.getMetadata(MODULE_METADATA.IMPORTS, moduleDefinition.module) || [];
      const dynamicImports: any[] = moduleDefinition.imports || [];
      return [...staticImports, ...dynamicImports];
    }

    return Reflect.getMetadata(MODULE_METADATA.IMPORTS, moduleDefinition) || [];
  }

  /**
   * Resolve a forward reference to its actual value.
   */
  private resolveForwardRef(ref: any): any {
    if (ref && typeof ref === 'object' && 'forwardRef' in ref) {
      return (ref as ForwardReference).forwardRef();
    }
    return ref;
  }

  /**
   * Check if a module definition is a dynamic module.
   */
  private isDynamicModule(module: any): module is DynamicModule {
    return module && !!(module as DynamicModule).module;
  }

  /**
   * Get a human-readable name for a module.
   */
  private getModuleName(module: any): string {
    if (this.isDynamicModule(module)) return module.module.name;
    if (typeof module === 'function') return module.name;
    return String(module);
  }
}
