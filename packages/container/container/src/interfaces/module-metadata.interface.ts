/**
 * @fileoverview Module metadata interface — the shape of @Module() options.
 *
 * @module interfaces/module-metadata
 */

import type { Type } from './type.interface';
import type { Provider } from './provider.interface';
import type { DynamicModule } from './dynamic-module.interface';
import type { ForwardReference } from './forward-reference.interface';
import type { InjectionToken } from './injection-token.interface';

/**
 * Configuration object passed to the `@Module()` decorator.
 *
 * Defines the module's dependency graph: what it imports, provides, and exports.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [ConfigModule, RedisModule.forRoot(config)],
 *   providers: [
 *     UserService,
 *     { provide: CACHE_CONFIG, useValue: cacheConfig },
 *   ],
 *   exports: [UserService],
 * })
 * class UserModule {}
 * ```
 */
export interface ModuleMetadata {
  /**
   * Modules to import.
   *
   * Imported modules make their exported providers available to this module.
   * Can be static module classes, dynamic modules (from `forRoot()`), or forward references.
   */
  imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;

  /**
   * Providers to register in this module.
   *
   * These providers are available for injection within this module.
   * To make them available to other modules, add them to `exports`.
   */
  providers?: Provider[];

  /**
   * Providers or modules to export.
   *
   * Exported providers become available to modules that import this module.
   * You can export:
   * - Provider tokens (class, string, symbol)
   * - Entire modules (re-exporting their exports)
   */
  exports?: Array<InjectionToken | Provider | DynamicModule | ForwardReference>;
}
