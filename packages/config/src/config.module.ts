/**
 * Configuration Module
 *
 * Registers:
 * - `CONFIG_OPTIONS` — raw options object
 * - `CONFIG_DRIVER` — the active configuration driver
 * - `ConfigService` — created by DI so @Inject decorators fire
 * - `CONFIG_SERVICE` — useExisting alias to ConfigService
 *
 * Users inject `CONFIG_SERVICE` (or `ConfigService` directly) and call
 * `config.get('key')` to read configuration values.
 *
 * @module config.module
 */

import { Module, type DynamicModule } from '@abdokouta/ts-container';

import { EnvDriver } from './drivers/env.driver';
import { FileDriver } from './drivers/file.driver';
import { ConfigService } from './services/config.service';
import type { ConfigDriver } from './interfaces/config-driver.interface';
import type { ConfigModuleOptions } from './interfaces/config-module-options.interface';
import { CONFIG_DRIVER, CONFIG_OPTIONS, CONFIG_SERVICE } from './constants/tokens.constant';

/**
 * ConfigModule — provides configuration management with multiple drivers.
 *
 * Follows the non-manager DI pattern:
 * - `CONFIG_OPTIONS` — raw config object
 * - `ConfigService` — class-based injection
 * - `CONFIG_SERVICE` — useExisting alias
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     ConfigModule.forRoot({
 *       driver: 'env',
 *       isGlobal: true,
 *       envPrefix: 'auto',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     ConfigModule.forRoot({
 *       driver: 'file',
 *       load: { database: { host: 'localhost', port: 5432 } },
 *       isGlobal: true,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern requires static methods
export class ConfigModule {
  /**
   * Register configuration module with runtime options.
   *
   * Creates the appropriate driver based on `options.driver`,
   * loads configuration, and registers all providers.
   *
   * @param options - Configuration module options
   * @returns DynamicModule with all config providers
   */
  static forRoot(options: ConfigModuleOptions = {}): DynamicModule {
    const driver = ConfigModule.createDriver(options);

    return {
      module: ConfigModule,
      global: options.isGlobal ?? true,
      providers: [
        { provide: CONFIG_OPTIONS, useValue: options },
        { provide: CONFIG_DRIVER, useValue: driver },
        { provide: ConfigService, useClass: ConfigService },
        { provide: CONFIG_SERVICE, useExisting: ConfigService },
      ],
      exports: [ConfigService, CONFIG_SERVICE, CONFIG_OPTIONS, CONFIG_DRIVER],
    };
  }

  /**
   * Create the configuration driver based on options.
   *
   * Dispatches to `EnvDriver` or `FileDriver` based on the
   * `driver` field in options. Defaults to `'env'`.
   *
   * @param options - Configuration module options
   * @returns A configured ConfigDriver instance
   * @throws Error if the driver type is unknown
   *
   * @private
   */
  private static createDriver(options: ConfigModuleOptions): ConfigDriver {
    const driverType = options.driver || 'env';

    switch (driverType) {
      case 'env': {
        const envDriver = new EnvDriver({
          envFilePath: options.envFilePath,
          ignoreEnvFile: options.ignoreEnvFile,
          expandVariables: options.expandVariables,
          envPrefix: options.envPrefix,
          globalName: options.globalName,
        });
        envDriver.load();

        // Merge custom load function if provided
        if (options.load) {
          ConfigModule.mergeCustomConfig(envDriver, options.load);
        }

        return envDriver;
      }

      case 'file': {
        const fileDriver = new FileDriver({
          config: typeof options.load === 'object' ? options.load : undefined,
        });
        return fileDriver;
      }

      default:
        throw new Error(`Unknown configuration driver: ${driverType}`);
    }
  }

  /**
   * Merge custom configuration into an existing driver.
   *
   * Supports both synchronous objects and async factory functions.
   *
   * @param driver - The driver to merge config into
   * @param load - Config object or factory function
   *
   * @private
   */
  private static mergeCustomConfig(
    driver: ConfigDriver,
    load: Record<string, any> | (() => Record<string, any> | Promise<Record<string, any>>),
  ): void {
    const customConfig = typeof load === 'function' ? load() : load;

    if (customConfig instanceof Promise) {
      customConfig.then((config) => {
        Object.assign(driver.all(), config);
      });
    } else {
      Object.assign(driver.all(), customConfig);
    }
  }
}
