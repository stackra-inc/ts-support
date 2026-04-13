/**
 * Null Dispatcher
 *
 * |--------------------------------------------------------------------------
 * | No-op event dispatcher for testing.
 * |--------------------------------------------------------------------------
 * |
 * | Mirrors Laravel's Illuminate\Events\NullDispatcher.
 * |
 * | All dispatch/until calls are silenced. Listener registration is
 * | tracked internally so you can assert that listeners were registered.
 * |
 * | Use cases:
 * | - Unit testing (prevent side effects from event dispatch)
 * | - Disabling events in specific environments
 * | - Benchmarking without event overhead
 * |
 * @module @pixielity/events
 * @category Dispatchers
 *
 * @example
 * ```typescript
 * const dispatcher = new NullDispatcher();
 * dispatcher.listen('user.created', handler);
 * dispatcher.dispatch('user.created', { userId: '123' }); // no-op
 * expect(dispatcher.hasListeners('user.created')).toBe(true);
 * ```
 */

import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs';
import type { Dispatcher, EventListener, EventSubscriber } from '@/interfaces';

/**
 * Null event dispatcher — silences all dispatch calls.
 *
 * |--------------------------------------------------------------------------
 * | Listener registration is tracked (listen, once, subscribe work).
 * | Dispatch and until are no-ops.
 * | asObservable returns EMPTY (never emits).
 * |--------------------------------------------------------------------------
 */
export class NullDispatcher implements Dispatcher {
  /*
  |--------------------------------------------------------------------------
  | Internal State
  |--------------------------------------------------------------------------
  */

  /** Tracked listeners for assertion purposes. */
  private readonly _listeners = new Map<string, EventListener[]>();

  /*
  |--------------------------------------------------------------------------
  | Listener Registration (tracked)
  |--------------------------------------------------------------------------
  */

  listen(event: string, listener: EventListener, _priority?: number): () => void {
    const existing = this._listeners.get(event) ?? [];
    existing.push(listener);
    this._listeners.set(event, existing);

    return () => {
      const arr = this._listeners.get(event);
      if (!arr) return;
      const idx = arr.indexOf(listener);
      if (idx !== -1) arr.splice(idx, 1);
      if (arr.length === 0) this._listeners.delete(event);
    };
  }

  once(event: string, listener: EventListener, priority?: number): () => void {
    return this.listen(event, listener, priority);
  }

  subscribe(subscriber: EventSubscriber): void {
    const result = subscriber.subscribe(this);
    if (result && typeof result === 'object') {
      for (const [event, handler] of Object.entries(result)) {
        this.listen(event, handler as EventListener);
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Query Methods (work normally)
  |--------------------------------------------------------------------------
  */

  hasListeners(event: string): boolean {
    const arr = this._listeners.get(event);
    return arr !== undefined && arr.length > 0;
  }

  getListeners(event: string): EventListener[] {
    return [...(this._listeners.get(event) ?? [])];
  }

  /*
  |--------------------------------------------------------------------------
  | Cleanup
  |--------------------------------------------------------------------------
  */

  forget(event: string): void {
    this._listeners.delete(event);
  }

  forgetAll(): void {
    this._listeners.clear();
  }

  destroy(): void {
    this.forgetAll();
  }

  /*
  |--------------------------------------------------------------------------
  | Silenced — Dispatch (no-op)
  |--------------------------------------------------------------------------
  */

  dispatch(
    _event: string | object,
    _payload?: unknown,
    _halt?: boolean
  ): unknown[] | unknown | null {
    return null;
  }

  until(_event: string | object, _payload?: unknown): unknown | null {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Silenced — Observable (EMPTY)
  |--------------------------------------------------------------------------
  */

  asObservable(): Observable<{ event: string; payload: unknown }> {
    return EMPTY;
  }
}
