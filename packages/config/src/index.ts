/**
 * @abdokouta/react-config
 *
 * NestJS-inspired configuration management with multiple drivers for loading
 * configuration from various sources (environment variables, files, etc.).
 * Provides type-safe access to configuration values with support for nested
 * properties and default values.
 *
 * @example
 * ```typescript
 * import { ConfigModule, ConfigService } from '@abdokouta/react-config';
 * import { Module, Injectable, Inject } from '@abdokouta/ts-container';
 *
 * @Module({
 *   imports: [
 *     ConfigModule.forRoot({
 *       driver: 'env',
 *       isGlobal: true,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 *
 * @Injectable()
 * class DatabaseService {
 *   constructor(@Inject(ConfigService) private config: ConfigService) {}
 *
 *   connect() {
 *     const host = this.config.getString('DB_HOST', 'localhost');
 *     const port = this.config.getNumber('DB_PORT', 5432);
 *   }
 * }
 * ```
 *
 * @module @abdokouta/react-config
 */

// ============================================================================
// Module (DI Configuration)
// ============================================================================
export { ConfigModule } from './config.module';

// ============================================================================
// Core Service
// ============================================================================
export { ConfigService } from './services/config.service';

// ============================================================================
// Drivers
// ============================================================================
export { EnvDriver } from './drivers/env.driver';
export { FileDriver } from './drivers/file.driver';

// ============================================================================
// Interfaces
// ============================================================================
export type { ConfigDriver } from './interfaces/config-driver.interface';
export type { ConfigModuleOptions } from './interfaces/config-module-options.interface';
export type { ConfigServiceInterface } from './interfaces/config-service.interface';
export type { ViteConfigPluginOptions } from './interfaces/vite-config-plugin-options.interface';

// ============================================================================
// Constants / Tokens
// ============================================================================
export { CONFIG_OPTIONS, CONFIG_DRIVER, CONFIG_SERVICE } from './constants/tokens.constant';

// ============================================================================
// Utilities
// ============================================================================
export { defineConfig } from './utils/define-config.util';
export { getNestedValue, hasNestedValue } from './utils/get-nested-value.util';
export { loadConfigFile } from './utils/load-config-file.util';
