/**
 * Dispatcher Interface
 *
 * Contract that all event dispatchers must implement.
 * Equivalent to the `Store` interface in the cache package.
 *
 * Drivers: memory, redis, null.
 *
 * @module @pixielity/events
 * @category Interfaces
 */

import type { Observable } from 'rxjs';

/**
 * An event listener callback.
 *
 * For exact events: `(payload) => void`
 * For wildcard events: `(eventName, payload) => void`
 */
export type EventListener = (...args: unknown[]) => unknown;

/**
 * An event subscriber — a class that subscribes to multiple events.
 */
export interface EventSubscriber {
  subscribe(dispatcher: Dispatcher): Record<string, EventListener> | void;
}

/**
 * Dispatcher — the low-level event dispatcher contract.
 *
 * All dispatchers (MemoryDispatcher, RedisDispatcher, NullDispatcher)
 * implement this interface. The EventManager creates dispatcher instances
 * and the EventService wraps them with a high-level API.
 *
 * Mirrors the `Store` interface in the cache package.
 */
export interface Dispatcher {
  listen(event: string, listener: EventListener, priority?: number): () => void;
  once(event: string, listener: EventListener, priority?: number): () => void;
  dispatch(event: string | object, payload?: unknown, halt?: boolean): unknown[] | unknown | null;
  until(event: string | object, payload?: unknown): unknown | null;
  subscribe(subscriber: EventSubscriber): void;
  hasListeners(event: string): boolean;
  getListeners(event: string): EventListener[];
  forget(event: string): void;
  forgetAll(): void;
  asObservable(): Observable<{ event: string; payload: unknown }>;
  destroy(): void;
}
