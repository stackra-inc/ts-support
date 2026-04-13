/**
 * Redis Dispatcher
 *
 * Extends MemoryDispatcher with Redis pub/sub for cross-process events.
 * Uses the RedisManager (IRedisService) from @abdokouta/react-redis.
 *
 * NOT injectable — created by EventManager.createDriver().
 * The RedisManager is passed in by the EventManager, same pattern
 * as RedisStore in the cache package.
 *
 * @module @pixielity/events
 * @category Dispatchers
 */

import { MemoryDispatcher } from './memory.dispatcher';
import type { IRedisService } from '@abdokouta/react-redis';

/** Serialised event stored in Redis. */
interface RedisEventMessage {
  event: string;
  payload: unknown;
  timestamp: number;
  publisherId: string;
}

/**
 * Redis-backed event dispatcher.
 *
 * Extends MemoryDispatcher — all local listener management is inherited.
 * Adds Redis pub/sub via a polling strategy for cross-process events.
 */
export class RedisDispatcher extends MemoryDispatcher {
  private readonly redisService: IRedisService;
  private redisConnection: any = null;
  private readonly connectionName: string;
  private readonly prefix: string;
  private readonly pollingInterval: number;
  private readonly publisherId: string;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private polling = false;

  private get channelKey(): string {
    return `${this.prefix}channel`;
  }

  /**
   * @param redisService - The RedisManager instance (injected by EventManager)
   * @param prefix - Redis key prefix
   * @param connectionName - Redis connection name from config
   * @param wildcards - Enable wildcard matching
   * @param pollingInterval - Poll interval in ms
   */
  constructor(
    redisService: IRedisService,
    prefix: string = 'events:',
    connectionName: string = 'default',
    wildcards: boolean = true,
    pollingInterval: number = 1000
  ) {
    super({ wildcards });
    this.redisService = redisService;
    this.prefix = prefix;
    this.connectionName = connectionName;
    this.pollingInterval = pollingInterval;
    this.publisherId = `pub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private async getConnection(): Promise<any> {
    if (this.redisConnection) return this.redisConnection;
    this.redisConnection = await this.redisService.connection(this.connectionName);
    return this.redisConnection;
  }

  override dispatch(
    event: string | object,
    payload?: unknown,
    halt: boolean = false
  ): unknown[] | unknown | null {
    const [eventName, eventPayload] = this._parseForRedis(event, payload);

    this._publishToRedis(eventName, eventPayload).catch((err) => {
      console.warn('[RedisDispatcher] Failed to publish:', err);
    });

    return super.dispatch(event, payload, halt);
  }

  startPolling(): void {
    if (this.polling) return;
    this.polling = true;
    this.pollingTimer = setInterval(() => {
      this._pollRedis().catch((err) => {
        console.warn('[RedisDispatcher] Polling error:', err);
      });
    }, this.pollingInterval);
  }

  stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.polling = false;
  }

  override destroy(): void {
    this.stopPolling();
    this.redisConnection = null;
    super.destroy();
  }

  private async _publishToRedis(event: string, payload: unknown): Promise<void> {
    const redis = await this.getConnection();
    const message: RedisEventMessage = {
      event,
      payload,
      timestamp: Date.now(),
      publisherId: this.publisherId,
    };
    const script = `
      redis.call('RPUSH', KEYS[1], ARGV[1])
      redis.call('LTRIM', KEYS[1], -1000, -1)
      return 1
    `;
    await redis.eval(script, [this.channelKey], [JSON.stringify(message)]);
  }

  private async _pollRedis(): Promise<void> {
    const redis = await this.getConnection();
    const script = `
      local msgs = redis.call('LRANGE', KEYS[1], 0, 99)
      if #msgs > 0 then
        redis.call('LTRIM', KEYS[1], #msgs, -1)
      end
      return msgs
    `;
    const result = await redis.eval(script, [this.channelKey], []);
    if (!Array.isArray(result) || result.length === 0) return;

    for (const raw of result) {
      if (typeof raw !== 'string') continue;
      try {
        const msg: RedisEventMessage = JSON.parse(raw);
        if (msg.publisherId === this.publisherId) continue;
        super.dispatch(msg.event, msg.payload);
      } catch {
        /* malformed — skip */
      }
    }
  }

  private _parseForRedis(event: string | object, payload?: unknown): [string, unknown] {
    if (typeof event === 'object') return [event.constructor.name, event];
    return [event, payload];
  }
}
