/**
 * @fileoverview @Optional() decorator.
 *
 * Marks a dependency as optional. If the container cannot resolve the
 * dependency, `undefined` is injected instead of throwing an error.
 *
 * @module decorators/optional
 */

import 'reflect-metadata';
import { OPTIONAL_DEPS_METADATA, OPTIONAL_PROPERTY_DEPS_METADATA } from '@/constants';

/**
 * Marks a constructor parameter or property dependency as optional.
 *
 * Without `@Optional()`, an unresolvable dependency throws an error.
 * With `@Optional()`, `undefined` is injected instead.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class CacheService {
 *   constructor(
 *     @Inject(CACHE_CONFIG) private config: CacheConfig,
 *     @Optional() @Inject(RedisManager) private redis?: RedisManager,
 *   ) {
 *     // redis will be undefined if RedisModule is not imported
 *   }
 * }
 * ```
 */
export function Optional(): PropertyDecorator & ParameterDecorator {
  return (target: object, key: string | symbol | undefined, index?: number) => {
    if (index !== undefined) {
      // Constructor parameter — store the index
      const existingOptional = Reflect.getMetadata(OPTIONAL_DEPS_METADATA, target) || [];
      Reflect.defineMetadata(OPTIONAL_DEPS_METADATA, [...existingOptional, index], target);
    } else {
      // Property — store the property key
      const existingOptional =
        Reflect.getMetadata(OPTIONAL_PROPERTY_DEPS_METADATA, target.constructor) || [];
      Reflect.defineMetadata(
        OPTIONAL_PROPERTY_DEPS_METADATA,
        [...existingOptional, key],
        target.constructor
      );
    }
  };
}
