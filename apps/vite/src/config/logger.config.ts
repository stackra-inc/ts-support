/**
 * Logger Configuration
 *
 * Unified logger configuration following Laravel and NestJS patterns.
 * All logging channels and settings are defined in a single config object.
 *
 * @module config/logger
 *
 * @example
 * ```typescript
 * import loggerConfig from '@abdokouta/ts-logger/config/logger.config';
 *
 * LoggerModule.forRoot(loggerConfig);
 * ```
 */

import {
  defineConfig,
  LogLevel,
  SilentTransporter,
  ConsoleTransporter,
  StorageTransporter,
} from "@abdokouta/ts-logger";

/**
 * Logger configuration
 *
 * Single unified configuration object that automatically adapts to your environment.
 * Uses environment variables for configuration, similar to Laravel's config/logging.php
 *
 * Environment Variables:
 * - LOG_CHANNEL: Default channel (default: 'console')
 * - LOG_LEVEL: Minimum log level (default: 'debug')
 * - APP_NAME: Application name for context (default: 'refine-app')
 * - NODE_ENV: Environment (development/production/test)
 * - LOG_STORAGE_MAX_ENTRIES: Max storage entries (default: 500)
 */
const loggerConfig = defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Default Log Channel
  |--------------------------------------------------------------------------
  |
  | This option defines the default log channel that will be used to write
  | messages to the logs. The name specified in this option should match
  | one of the channels defined in the "channels" configuration array.
  |
  */
  default: import.meta.env.LOG_CHANNEL || "console",

  /*
  |--------------------------------------------------------------------------
  | Log Channels
  |--------------------------------------------------------------------------
  |
  | Here you may configure the log channels for your application. Each
  | channel can have multiple transporters for different outputs.
  |
  */
  channels: {
    /**
     * Console Channel
     *
     * Logs to the console/terminal. Good for development.
     */
    console: {
      transporters: [
        new ConsoleTransporter({
          level: (import.meta.env.LOG_LEVEL as unknown as LogLevel) || LogLevel.Debug,
        }),
      ],
      context: {
        app: import.meta.env.APP_NAME || "refine-app",
        env: import.meta.env.NODE_ENV || "development",
      },
    },

    /**
     * Storage Channel
     *
     * Persists logs to storage (localStorage/sessionStorage in browser).
     * Good for debugging and audit trails.
     */
    storage: {
      transporters: [
        new StorageTransporter({
          key: "app-logs",
          maxEntries: Number(import.meta.env.LOG_STORAGE_MAX_ENTRIES) || 500,
        }),
      ],
      context: {
        app: import.meta.env.APP_NAME || "refine-app",
      },
    },

    /**
     * Combined Channel
     *
     * Logs to both console and storage.
     * Good for production environments.
     */
    combined: {
      transporters: [
        new ConsoleTransporter({
          level: LogLevel.Info,
        }),
        new StorageTransporter({
          key: "app-logs",
          maxEntries: 1000,
        }),
      ],
      context: {
        app: import.meta.env.APP_NAME || "refine-app",
        env: import.meta.env.NODE_ENV || "production",
      },
    },

    /**
     * Error Channel
     *
     * Only logs errors and critical messages.
     * Useful for error monitoring and alerting.
     */
    errors: {
      transporters: [
        new ConsoleTransporter({
          level: LogLevel.Error,
        }),
        new StorageTransporter({
          key: "error-logs",
          maxEntries: 200,
        }),
      ],
      context: {
        app: import.meta.env.APP_NAME || "refine-app",
        channel: "errors",
      },
    },

    /**
     * Audit Channel
     *
     * For audit trails and compliance logging.
     * Stores all logs without console output.
     */
    audit: {
      transporters: [
        new StorageTransporter({
          key: "audit-logs",
          maxEntries: 1000,
        }),
      ],
      context: {
        app: import.meta.env.APP_NAME || "refine-app",
        channel: "audit",
      },
    },

    /**
     * Silent Channel
     *
     * Disables all logging. Useful for testing.
     */
    silent: {
      transporters: [new SilentTransporter()],
    },
  },
});

export default loggerConfig;
