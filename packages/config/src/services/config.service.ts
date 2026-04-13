/**
 * Configuration Service
 *
 * Provides type-safe access to configuration values with various getter methods.
 * Wraps a `ConfigDriver` with convenience methods for typed access.
 *
 * This IS injectable — registered by `ConfigModule.forRoot()`.
 *
 * @module services/config
 */

import { Inject, Injectable } from '@abdokouta/ts-container';

import { CONFIG_DRIVER } from '@/constants/tokens.constant';
import type { ConfigDriver } from '@/interfaces/config-driver.interface';
import type { ConfigServiceInterface } from '@/interfaces/config-service.interface';

/**
 * ConfigService — the consumer-facing configuration API.
 *
 * Injected via `ConfigService` class or `CONFIG_SERVICE` token.
 * Provides typed getters for string, number, boolean, array, and JSON values.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class DatabaseService {
 *   constructor(@Inject(ConfigService) private config: ConfigService) {}
 *
 *   connect() {
 *     const host = this.config.getString('DB_HOST', 'localhost');
 *     const port = this.config.getNumber('DB_PORT', 5432);
 *     const ssl = this.config.getBool('DB_SSL', false);
 *   }
 * }
 * ```
 */
@Injectable()
export class ConfigService implements ConfigServiceInterface {
  /**
   * The underlying configuration driver.
   * @private
   */
  private readonly _driver: ConfigDriver;

  /**
   * Create a new ConfigService.
   *
   * @param driver - The configuration driver injected via DI
   */
  constructor(
    @Inject(CONFIG_DRIVER)
    driver: ConfigDriver,
  ) {
    this._driver = driver;
  }

  // ── Read ────────────────────────────────────────────────────────────────

  /**
   * Get a configuration value by key.
   *
   * Supports dot-notation for nested values (e.g., `'database.host'`).
   *
   * @typeParam T - Expected return type
   * @param key - Configuration key (supports dot notation)
   * @param defaultValue - Fallback value if key is not found
   * @returns The configuration value, or `defaultValue` if not found
   *
   * @example
   * ```typescript
   * const host = config.get('database.host', 'localhost');
   * const port = config.get<number>('database.port', 5432);
   * ```
   */
  public get<T = any>(key: string, defaultValue?: T): T | undefined {
    return this._driver.get<T>(key, defaultValue);
  }

  /**
   * Get a configuration value or throw if not found.
   *
   * @typeParam T - Expected return type
   * @param key - Configuration key
   * @returns The configuration value
   * @throws Error if the key is not set
   *
   * @example
   * ```typescript
   * const secret = config.getOrThrow<string>('JWT_SECRET');
   * ```
   */
  public getOrThrow<T = any>(key: string): T {
    const value = this.get<T>(key);
    if (value === undefined) {
      throw new Error(`Configuration key "${key}" is required but not set`);
    }
    return value;
  }

  // ── Typed getters ───────────────────────────────────────────────────────

  /**
   * Get a string configuration value.
   *
   * @param key - Configuration key
   * @param defaultValue - Fallback string value
   * @returns The string value, or `defaultValue` if not found
   */
  public getString(key: string, defaultValue?: string): string | undefined {
    const value = this.get(key, defaultValue);
    return value !== undefined ? String(value) : undefined;
  }

  /**
   * Get a string configuration value or throw if not found.
   *
   * @param key - Configuration key
   * @returns The string value
   * @throws Error if the key is not set
   */
  public getStringOrThrow(key: string): string {
    return String(this.getOrThrow(key));
  }

  /**
   * Get a numeric configuration value.
   *
   * Parses string values to numbers. Returns `defaultValue` if
   * the value cannot be parsed.
   *
   * @param key - Configuration key
   * @param defaultValue - Fallback number value
   * @returns The numeric value, or `defaultValue` if not found/unparseable
   */
  public getNumber(key: string, defaultValue?: number): number | undefined {
    const value = this.get(key, defaultValue);
    if (value === undefined) {
      return undefined;
    }
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Get a numeric configuration value or throw if not found.
   *
   * @param key - Configuration key
   * @returns The numeric value
   * @throws Error if the key is not set
   */
  public getNumberOrThrow(key: string): number {
    const value = this.getNumber(key);
    if (value === undefined) {
      throw new Error(`Configuration key "${key}" is required but not set`);
    }
    return value;
  }

  /**
   * Get a boolean configuration value.
   *
   * Treats `'true'`, `'1'`, `'yes'`, `'on'` as `true`.
   * All other string values are treated as `false`.
   *
   * @param key - Configuration key
   * @param defaultValue - Fallback boolean value
   * @returns The boolean value, or `defaultValue` if not found
   */
  public getBool(key: string, defaultValue?: boolean): boolean | undefined {
    const value = this.get(key, defaultValue);
    if (value === undefined) {
      return undefined;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
  }

  /**
   * Get a boolean configuration value or throw if not found.
   *
   * @param key - Configuration key
   * @returns The boolean value
   * @throws Error if the key is not set
   */
  public getBoolOrThrow(key: string): boolean {
    const value = this.getBool(key);
    if (value === undefined) {
      throw new Error(`Configuration key "${key}" is required but not set`);
    }
    return value;
  }

  /**
   * Get an array configuration value.
   *
   * Splits comma-separated strings into arrays. If the value is
   * already an array, it's returned as-is (stringified).
   *
   * @param key - Configuration key
   * @param defaultValue - Fallback array value
   * @returns The array value, or `defaultValue` if not found
   *
   * @example
   * ```typescript
   * // ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   * const origins = config.getArray('ALLOWED_ORIGINS');
   * // => ['http://localhost:3000', 'http://localhost:5173']
   * ```
   */
  public getArray(key: string, defaultValue?: string[]): string[] | undefined {
    const value = this.get(key, defaultValue);
    if (value === undefined) {
      return undefined;
    }
    if (Array.isArray(value)) {
      return value.map(String);
    }
    return String(value)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  /**
   * Get a JSON configuration value.
   *
   * Parses JSON strings into objects. If the value is already
   * an object, it's returned as-is.
   *
   * @typeParam T - Expected return type
   * @param key - Configuration key
   * @param defaultValue - Fallback value
   * @returns The parsed JSON value, or `defaultValue` if parsing fails
   */
  public getJson<T = any>(key: string, defaultValue?: T): T | undefined {
    const value = this.get(key, defaultValue);
    if (value === undefined) {
      return undefined;
    }
    if (typeof value === 'object') {
      return value as T;
    }
    try {
      return JSON.parse(String(value)) as T;
    } catch {
      return defaultValue;
    }
  }

  // ── Introspection ───────────────────────────────────────────────────────

  /**
   * Check if a configuration key exists.
   *
   * @param key - Configuration key (supports dot notation)
   * @returns `true` if the key exists in the configuration
   */
  public has(key: string): boolean {
    return this._driver.has(key);
  }

  /**
   * Get all configuration values as a plain object.
   *
   * @returns A shallow copy of all configuration key-value pairs
   */
  public all(): Record<string, any> {
    return this._driver.all();
  }

  /**
   * Clear any cached configuration values.
   *
   * Currently a no-op — caching should be done at a higher level if needed.
   */
  public clearCache(): void {
    // No-op — caching should be done at a higher level if needed
  }
}
