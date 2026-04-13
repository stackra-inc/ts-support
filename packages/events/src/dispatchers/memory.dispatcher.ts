/**
 * Memory Dispatcher
 *
 * |--------------------------------------------------------------------------
 * | In-Memory Event Dispatcher
 * |--------------------------------------------------------------------------
 * |
 * | The default event dispatcher — stores listeners in memory using Map.
 * | Uses RxJS Subject for async event streaming.
 * |
 * | This is the primary dispatcher for single-process applications.
 * | Listeners are lost on page refresh or process restart.
 * |
 * | Use cases:
 * | - Single-page applications (SPA)
 * | - Development and testing
 * | - When cross-process event sharing is not needed
 * |
 * @module @pixielity/events
 * @category Dispatchers
 *
 * @example
 * ```typescript
 * const dispatcher = new MemoryDispatcher({ wildcards: true });
 * dispatcher.listen('user.created', (payload) => console.log(payload));
 * dispatcher.dispatch('user.created', { userId: '123' });
 * dispatcher.destroy();
 * ```
 */

import 'reflect-metadata';
import { Subject } from 'rxjs';

import { ON_EVENT_METADATA } from '@/constants';
import { isWildcard, matchesWildcard } from '@/utils/wildcard.util';
import type { Dispatcher, EventListener, EventSubscriber } from '@/interfaces';
import type { OnEventMetadata } from '@/types';
import type { MemoryDispatcherConfig } from '@/interfaces';
import { EventPriority } from '@/enums';

// ── Internal types ──────────────────────────────────────────────────────────

/**
 * A registered listener with its priority, once flag, and source info.
 */
export interface RegisteredListener {
  /** The listener callback. */
  handler: EventListener;
  /** Execution priority (higher = earlier). */
  priority: number;
  /** If true, remove after first invocation. */
  once: boolean;
  /** Whether this listener was registered via a wildcard pattern. */
  isWildcard: boolean;
}

/**
 * In-memory event dispatcher.
 *
 * |--------------------------------------------------------------------------
 * | Implements the full EventDispatcherInterface with:
 * | - Exact event listeners
 * | - Wildcard pattern listeners (*, **)
 * | - Priority-based execution order
 * | - One-time listeners (once)
 * | - Subscriber auto-registration via @OnEvent metadata
 * | - RxJS Subject for async streaming (observable API)
 * | - Halt-on-first-response (until)
 * | - Proper cleanup via destroy()
 * |--------------------------------------------------------------------------
 */
export class MemoryDispatcher implements Dispatcher {
  /*
  |--------------------------------------------------------------------------
  | Internal State
  |--------------------------------------------------------------------------
  */

  /** Exact event name → sorted listeners. */
  private readonly listeners = new Map<string, RegisteredListener[]>();

  /** Wildcard pattern → sorted listeners. */
  private readonly wildcards = new Map<string, RegisteredListener[]>();

  /** RxJS Subject for async event streaming. */
  private readonly subject = new Subject<{ event: string; payload: unknown }>();

  /** Whether wildcard matching is enabled. */
  private readonly enableWildcards: boolean;

  /** Whether the dispatcher has been destroyed. */
  private destroyed = false;

  /*
  |--------------------------------------------------------------------------
  | Constructor
  |--------------------------------------------------------------------------
  */

  constructor(config?: Omit<MemoryDispatcherConfig, 'driver'>) {
    this.enableWildcards = config?.wildcards ?? true;
  }

  /*
  |--------------------------------------------------------------------------
  | listen
  |--------------------------------------------------------------------------
  */

  listen(
    event: string,
    listener: EventListener,
    priority: number = EventPriority.NORMAL
  ): () => void {
    const isWild = this.enableWildcards && isWildcard(event);

    const entry: RegisteredListener = {
      handler: listener,
      priority,
      once: false,
      isWildcard: isWild,
    };

    const map = isWild ? this.wildcards : this.listeners;
    this._addToMap(map, event, entry);

    return () => this._removeFromMap(map, event, entry);
  }

  /*
  |--------------------------------------------------------------------------
  | once
  |--------------------------------------------------------------------------
  */

  once(
    event: string,
    listener: EventListener,
    priority: number = EventPriority.NORMAL
  ): () => void {
    const isWild = this.enableWildcards && isWildcard(event);

    const entry: RegisteredListener = {
      handler: listener,
      priority,
      once: true,
      isWildcard: isWild,
    };

    const map = isWild ? this.wildcards : this.listeners;
    this._addToMap(map, event, entry);

    return () => this._removeFromMap(map, event, entry);
  }

  /*
  |--------------------------------------------------------------------------
  | dispatch
  |--------------------------------------------------------------------------
  */

  dispatch(
    event: string | object,
    payload?: unknown,
    halt: boolean = false
  ): unknown[] | unknown | null {
    const [eventName, eventPayload] = this._parseEvent(event, payload);
    const allListeners = this._getMatchingListeners(eventName);

    const responses: unknown[] = [];
    const toRemove: RegisteredListener[] = [];

    for (const entry of allListeners) {
      const response = entry.isWildcard
        ? entry.handler(eventName, eventPayload)
        : entry.handler(eventPayload);

      if (halt && response != null) {
        if (entry.once) toRemove.push(entry);
        this._removeOnceListeners(toRemove);
        return response;
      }

      if (response === false) {
        if (entry.once) toRemove.push(entry);
        break;
      }

      responses.push(response);

      if (entry.once) {
        toRemove.push(entry);
      }
    }

    this._removeOnceListeners(toRemove);

    if (!this.destroyed) {
      this.subject.next({ event: eventName, payload: eventPayload });
    }

    return halt ? null : responses;
  }

  /*
  |--------------------------------------------------------------------------
  | until
  |--------------------------------------------------------------------------
  */

  until(event: string | object, payload?: unknown): unknown | null {
    return this.dispatch(event, payload, true);
  }

  /*
  |--------------------------------------------------------------------------
  | subscribe
  |--------------------------------------------------------------------------
  */

  subscribe(subscriber: EventSubscriber): void {
    const result = subscriber.subscribe(this);
    if (result && typeof result === 'object') {
      for (const [event, handler] of Object.entries(result)) {
        this.listen(event, handler as EventListener);
      }
    }

    const metadata: OnEventMetadata[] | undefined = Reflect.getMetadata(
      ON_EVENT_METADATA,
      subscriber.constructor
    );

    if (metadata) {
      for (const { event, method, options } of metadata) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        const handler = (subscriber as unknown as Record<string, Function>)[method];
        if (typeof handler === 'function') {
          const boundHandler = handler.bind(subscriber);
          const priority = options.priority ?? EventPriority.NORMAL;

          if (options.once) {
            this.once(event, boundHandler, priority);
          } else {
            this.listen(event, boundHandler, priority);
          }
        }
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | hasListeners
  |--------------------------------------------------------------------------
  */

  hasListeners(event: string): boolean {
    const exact = this.listeners.get(event);
    if (exact && exact.length > 0) return true;

    if (this.enableWildcards) {
      for (const pattern of this.wildcards.keys()) {
        if (matchesWildcard(pattern, event)) return true;
      }
    }

    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | getListeners
  |--------------------------------------------------------------------------
  */

  getListeners(event: string): EventListener[] {
    return this._getMatchingListeners(event).map((e) => e.handler);
  }

  /*
  |--------------------------------------------------------------------------
  | forget / forgetAll
  |--------------------------------------------------------------------------
  */

  forget(event: string): void {
    if (isWildcard(event)) {
      this.wildcards.delete(event);
    } else {
      this.listeners.delete(event);
    }
  }

  forgetAll(): void {
    this.listeners.clear();
    this.wildcards.clear();
  }

  /*
  |--------------------------------------------------------------------------
  | asObservable
  |--------------------------------------------------------------------------
  */

  asObservable() {
    return this.subject.asObservable();
  }

  /*
  |--------------------------------------------------------------------------
  | destroy
  |--------------------------------------------------------------------------
  */

  destroy(): void {
    this.forgetAll();
    this.subject.complete();
    this.destroyed = true;
  }

  /*
  |--------------------------------------------------------------------------
  | Internal Helpers
  |--------------------------------------------------------------------------
  */

  private _parseEvent(event: string | object, payload?: unknown): [string, unknown] {
    if (typeof event === 'object') {
      return [event.constructor.name, event];
    }
    return [event, payload];
  }

  private _getMatchingListeners(eventName: string): RegisteredListener[] {
    const result: RegisteredListener[] = [];

    const exact = this.listeners.get(eventName);
    if (exact) result.push(...exact);

    if (this.enableWildcards) {
      for (const [pattern, entries] of this.wildcards) {
        if (matchesWildcard(pattern, eventName)) {
          result.push(...entries);
        }
      }
    }

    result.sort((a, b) => b.priority - a.priority);
    return result;
  }

  private _addToMap(
    map: Map<string, RegisteredListener[]>,
    key: string,
    entry: RegisteredListener
  ): void {
    const existing = map.get(key) ?? [];
    existing.push(entry);
    existing.sort((a, b) => b.priority - a.priority);
    map.set(key, existing);
  }

  private _removeFromMap(
    map: Map<string, RegisteredListener[]>,
    key: string,
    entry: RegisteredListener
  ): void {
    const existing = map.get(key);
    if (!existing) return;
    const idx = existing.indexOf(entry);
    if (idx !== -1) existing.splice(idx, 1);
    if (existing.length === 0) map.delete(key);
  }

  private _removeOnceListeners(entries: RegisteredListener[]): void {
    for (const entry of entries) {
      const map = entry.isWildcard ? this.wildcards : this.listeners;
      for (const [key, arr] of map) {
        const idx = arr.indexOf(entry);
        if (idx !== -1) {
          arr.splice(idx, 1);
          if (arr.length === 0) map.delete(key);
          break;
        }
      }
    }
  }
}
