/**
 * Config Package Configuration
 *
 * Configuration for the @abdokouta/config package.
 * Defines how environment variables are loaded and accessed.
 *
 * @module config/config
 */

import { defineConfig } from "@abdokouta/ts-config";

/**
 * Config Configuration
 *
 * Settings:
 * - driver: 'env' (reads from process.env)
 * - ignoreEnvFile: true (don't load .env file in browser)
 * - isGlobal: true (available to all modules)
 * - envPrefix: 'auto' (auto-detect and strip VITE_ or NEXT_PUBLIC_ prefix)
 *
 * With envPrefix: 'auto', you can access:
 * - VITE_APP_NAME as APP_NAME
 * - NEXT_PUBLIC_API_URL as API_URL
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * import { configConfig } from '@/config/config.config';
 *
 * @Module({
 *   imports: [ConfigModule.forRoot(configConfig)],
 * })
 * export class AppModule {}
 * ```
 */
export const configConfig = defineConfig({
  /**
   * Driver to use for loading configuration
   * 'env' reads from process.env
   */
  driver: "env",

  /**
   * Ignore .env file loading
   * Set to true in browser environments
   * Set to false in Node.js environments
   */
  ignoreEnvFile: true,

  /**
   * Make config service globally available
   * When true, no need to import ConfigModule in feature modules
   */
  isGlobal: true,

  /**
   * Auto-detect and strip environment variable prefix
   * 'auto' detects VITE_ or NEXT_PUBLIC_ and strips it
   * So VITE_APP_NAME becomes accessible as APP_NAME
   */
  envPrefix: "auto",
});
