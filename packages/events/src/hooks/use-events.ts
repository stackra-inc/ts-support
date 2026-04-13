/**
 * useEvents Hook
 *
 * React hook that resolves the EventManager from DI and returns
 * the default EventService. Equivalent to `useCache()` in the cache package.
 *
 * @module @pixielity/events
 * @category Hooks
 *
 * @example
 * ```typescript
 * function OrderButton() {
 *   const events = useEvents();
 *   return (
 *     <button onClick={() => events.dispatch('order.created', { id: '1' })}>
 *       Create Order
 *     </button>
 *   );
 * }
 * ```
 */

import { useInject } from '@abdokouta/ts-container-react';
import { EventManager } from '@/services/event-manager.service';
import type { EventService } from '@/services/event.service';

/**
 * Resolves the default EventService from the DI container.
 *
 * @param name - Optional dispatcher name. Uses default if omitted.
 * @returns The EventService instance.
 */
export function useEvents(name?: string): EventService {
  const manager = useInject(EventManager);
  return manager.dispatcher(name);
}
