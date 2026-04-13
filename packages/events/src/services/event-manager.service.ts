/**
 * Event Manager
 *
 * The central orchestrator for the event system. Manages multiple named
 * dispatchers using the `MultipleInstanceManager` pattern.
 *
 * Each dispatcher is lazily created on first access, cached internally,
 * and reused on subsequent calls. The manager creates low-level `Dispatcher`
 * instances (memory, redis, null) and wraps them in `EventService`
 * instances that provide the high-level API.
 *
 * ## Architecture
 *
 * ```
 * EventManager (this class)
 *   ├── extends MultipleInstanceManager<Dispatcher>
 *   ├── creates Dispatcher instances (MemoryDispatcher, RedisDispatcher, NullDispatcher)
 *   └── wraps them in EventService (the consumer-facing API)
 * ```
 *
 * Equivalent to `CacheManager` in the cache package.
 *
 * @module @pixielity/events
 * @category Services
 */

import {
  Injectable,
  Inject,
  Optional,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@abdokouta/ts-container';
import { MultipleInstanceManager } from '@abdokouta/react-support';
import { REDIS_MANAGER, type IRedisService } from '@abdokouta/react-redis';

import type { Dispatcher, EventModuleOptions } from '@/interfaces';
import type { DispatcherConfig } from '@/types';
import { MemoryDispatcher } from '@/dispatchers/memory.dispatcher';
import { RedisDispatcher } from '@/dispatchers/redis.dispatcher';
import { NullDispatcher } from '@/dispatchers/null.dispatcher';
import { EventService } from './event.service';
import { EVENT_CONFIG } from '@/constants/tokens.constant';

/**
 * EventManager — creates and manages multiple named event dispatchers.
 *
 * @example
 * ```typescript
 * const events = manager.dispatcher();
 * events.dispatch('user.created', { userId: '123' });
 *
 * const redis = manager.dispatcher('redis');
 * redis.dispatch('order.placed', { orderId: '456' });
 *
 * manager.extend('custom', (config) => new MyDispatcher(config));
 * ```
 */
@Injectable()
export class EventManager
  extends MultipleInstanceManager<Dispatcher>
  implements OnModuleInit, OnModuleDestroy
{
  /** Cached EventService wrappers, keyed by dispatcher name. */
  private readonly services: Map<string, EventService> = new Map();

  constructor(
    @Inject(EVENT_CONFIG) private readonly config: EventModuleOptions,
    @Optional() @Inject(REDIS_MANAGER) private readonly redisService?: IRedisService
  ) {
    super();
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  onModuleInit(): void {
    try {
      this.dispatcher();
    } catch (err) {
      console.warn(
        `[EventManager] Failed to create default dispatcher '${this.config.default}':`,
        (err as Error).message
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    for (const [, service] of this.services) {
      try {
        service.destroy();
      } catch {
        /* ignore */
      }
    }
    this.services.clear();
    this.purge();
  }

  // ── MultipleInstanceManager contract ────────────────────────────────────

  getDefaultInstance(): string {
    return this.config.default;
  }

  setDefaultInstance(name: string): void {
    (this.config as any).default = name;
  }

  getInstanceConfig(name: string): Record<string, any> | undefined {
    return this.config.dispatchers[name];
  }

  protected createDriver(driver: string, config: Record<string, any>): Dispatcher {
    const dispatcherConfig = config as DispatcherConfig;
    const globalWildcards = this.config.wildcards ?? true;

    switch (driver) {
      case 'memory':
        return new MemoryDispatcher({
          wildcards: (dispatcherConfig as any).wildcards ?? globalWildcards,
          prefix: dispatcherConfig.prefix,
        });
      case 'redis':
        return this.createRedisDispatcher(dispatcherConfig as any);
      case 'null':
        return new NullDispatcher();
      default:
        throw new Error(`Event dispatcher driver [${driver}] is not supported.`);
    }
  }

  // ── Dispatcher access ───────────────────────────────────────────────────

  /**
   * Get an EventService for a named dispatcher.
   *
   * The primary consumer API. Returns an EventService wrapping the
   * underlying Dispatcher with listen, dispatch, subscribe, etc.
   * Cached — subsequent calls return the same instance.
   *
   * @param name - Dispatcher name. Uses default if omitted.
   */
  dispatcher(name?: string): EventService {
    const dispatcherName = name ?? this.config.default;

    const existing = this.services.get(dispatcherName);
    if (existing) return existing;

    const dispatcherInstance = this.instance(dispatcherName);
    const service = new EventService(dispatcherInstance);

    this.services.set(dispatcherName, service);
    return service;
  }

  /**
   * Get an EventService for a named dispatcher.
   *
   * The primary consumer API. Returns an EventService wrapping the
   * underlying Dispatcher with listen, dispatch, subscribe, etc.
   * Cached — subsequent calls return the same instance.
   *
   * @param name - Dispatcher name. Uses default if omitted.
   */
  driver(name?: string): EventService {
    return this.dispatcher(name);
  }

  // ── Introspection ───────────────────────────────────────────────────────

  getDefaultDriver(): string {
    return this.config.default;
  }

  getDispatcherNames(): string[] {
    return Object.keys(this.config.dispatchers);
  }

  hasDispatcher(name: string): boolean {
    return name in this.config.dispatchers;
  }

  getGlobalPrefix(): string {
    return this.config.prefix ?? '';
  }

  // ── Cache management ────────────────────────────────────────────────────

  forgetDispatcher(name?: string | string[]): this {
    const names = name ? (Array.isArray(name) ? name : [name]) : [this.config.default];
    for (const n of names) {
      this.services.delete(n);
    }
    return this.forgetInstance(name);
  }

  override purge(): void {
    this.services.clear();
    super.purge();
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private createRedisDispatcher(config: any): RedisDispatcher {
    if (!this.redisService) {
      throw new Error(
        'Redis event dispatcher requires @abdokouta/react-redis.\n' +
          'Import RedisModule.forRoot() before EventsModule.forRoot().'
      );
    }
    const globalPrefix = this.config.prefix ?? '';
    return new RedisDispatcher(
      this.redisService,
      globalPrefix + (config.prefix ?? 'events:'),
      config.connection ?? 'default',
      config.wildcards ?? this.config.wildcards ?? true,
      config.pollingInterval ?? 1000
    );
  }
}
