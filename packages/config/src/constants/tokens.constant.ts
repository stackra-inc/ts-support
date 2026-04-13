/**
 * Dependency Injection Tokens
 *
 * Symbol-based tokens for the config package DI system.
 * Used with `@abdokouta/ts-container` for dependency injection.
 *
 * @module constants/tokens
 */

/**
 * Configuration driver token.
 *
 * Injects the active `ConfigDriver` instance (EnvDriver, FileDriver, etc.)
 * into services that need direct driver access.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyService {
 *   constructor(@Inject(CONFIG_DRIVER) private driver: ConfigDriver) {}
 * }
 * ```
 */
export const CONFIG_DRIVER = Symbol.for('CONFIG_DRIVER');

/**
 * Configuration options token.
 *
 * Injects the raw `ConfigModuleOptions` object passed to `ConfigModule.forRoot()`.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyService {
 *   constructor(@Inject(CONFIG_OPTIONS) private options: ConfigModuleOptions) {}
 * }
 * ```
 */
export const CONFIG_OPTIONS = Symbol.for('CONFIG_OPTIONS');

/**
 * Configuration service token.
 *
 * `useExisting` alias to `ConfigService`. Allows injection via
 * token instead of class reference.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyService {
 *   constructor(@Inject(CONFIG_SERVICE) private config: ConfigService) {}
 * }
 * ```
 */
export const CONFIG_SERVICE = Symbol.for('CONFIG_SERVICE');
