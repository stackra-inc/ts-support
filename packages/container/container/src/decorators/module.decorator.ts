/**
 * @fileoverview @Module() decorator.
 *
 * Defines a module — the organizational unit of the DI system.
 * Modules group related providers and define the dependency graph
 * between different parts of the application.
 *
 * ## How it works:
 *
 * The decorator iterates over the metadata object and stores each
 * property as a separate metadata entry on the class:
 *
 * ```
 * @Module({ imports: [...], providers: [...], exports: [...] })
 * class MyModule {}
 *
 * // Becomes:
 * Reflect.defineMetadata('imports', [...], MyModule)
 * Reflect.defineMetadata('providers', [...], MyModule)
 * Reflect.defineMetadata('exports', [...], MyModule)
 * ```
 *
 * The scanner later reads these metadata entries to build the module graph.
 *
 * @module decorators/module
 */

import 'reflect-metadata';
import type { ModuleMetadata } from '@/interfaces';

/**
 * Valid keys for @Module() metadata.
 */
const VALID_MODULE_KEYS = new Set(['imports', 'providers', 'exports']);

/**
 * Decorator that defines a module.
 *
 * @param metadata - Module configuration (imports, providers, exports)
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [ConfigModule.forRoot(config)],
 *   providers: [UserService, UserRepository],
 *   exports: [UserService],
 * })
 * class UserModule {}
 * ```
 */
export function Module(metadata: ModuleMetadata): ClassDecorator {
  // Validate that only known keys are used
  const invalidKeys = Object.keys(metadata).filter((key) => !VALID_MODULE_KEYS.has(key));
  if (invalidKeys.length > 0) {
    throw new Error(
      `Invalid property '${invalidKeys.join("', '")}' passed into the @Module() decorator. ` +
        `Valid properties are: ${[...VALID_MODULE_KEYS].join(', ')}.`
    );
  }

  return (target: Function) => {
    for (const property in metadata) {
      if (Object.prototype.hasOwnProperty.call(metadata, property)) {
        Reflect.defineMetadata(property, (metadata as any)[property], target);
      }
    }
  };
}
