/**
 * Event Service (Repository)
 *
 * The high-level API that consumers interact with. Wraps a Dispatcher
 * and provides convenience methods: listen, dispatch, subscribe, etc.
 *
 * NOT injectable — created by EventManager.dispatcher().
 * Each dispatcher gets its own EventService instance.
 *
 * Equivalent to `CacheService` in the cache package.
 *
 * @module @pixielity/events
 * @category Services
 */

import type { Dispatcher, EventListener, EventSubscriber } from '@/interfaces';

/**
 * EventService — the consumer-facing event API.
 *
 * Created by `EventManager.dispatcher(name)`. Wraps a low-level Dispatcher
 * with the full event API.
 *
 * @example
 * ```typescript
 * const events = manager.dispatcher('redis');
 *
 * events.listen('user.created', (payload) => { ... });
 * events.dispatch('user.created', { userId: '123' });
 * events.subscribe(new UserSubscriber());
 * ```
 */
export class EventService {
  constructor(private readonly _dispatcher: Dispatcher) {}

  // ── Listen ──────────────────────────────────────────────────────────────

  listen(event: string, listener: EventListener, priority?: number): () => void {
    return this._dispatcher.listen(event, listener, priority);
  }

  once(event: string, listener: EventListener, priority?: number): () => void {
    return this._dispatcher.once(event, listener, priority);
  }

  // ── Dispatch ────────────────────────────────────────────────────────────

  dispatch(event: string | object, payload?: unknown, halt?: boolean): unknown[] | unknown | null {
    return this._dispatcher.dispatch(event, payload, halt);
  }

  until(event: string | object, payload?: unknown): unknown | null {
    return this._dispatcher.until(event, payload);
  }

  // ── Subscribers ─────────────────────────────────────────────────────────

  subscribe(subscriber: EventSubscriber): void {
    this._dispatcher.subscribe(subscriber);
  }

  // ── Query ───────────────────────────────────────────────────────────────

  hasListeners(event: string): boolean {
    return this._dispatcher.hasListeners(event);
  }

  getListeners(event: string): EventListener[] {
    return this._dispatcher.getListeners(event);
  }

  // ── Remove ──────────────────────────────────────────────────────────────

  forget(event: string): void {
    this._dispatcher.forget(event);
  }

  forgetAll(): void {
    this._dispatcher.forgetAll();
  }

  // ── RxJS ────────────────────────────────────────────────────────────────

  asObservable() {
    return this._dispatcher.asObservable();
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  destroy(): void {
    this._dispatcher.destroy();
  }

  // ── Accessors ───────────────────────────────────────────────────────────

  getDispatcher(): Dispatcher {
    return this._dispatcher;
  }
}
