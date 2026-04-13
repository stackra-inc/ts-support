/**
 * useEvent Hook
 *
 * React hook that registers an event listener and auto-cleans up on unmount.
 *
 * @module @pixielity/events
 * @category Hooks
 *
 * @example
 * ```typescript
 * function NotificationBanner() {
 *   useEvent('notification.received', (payload) => {
 *     showToast(payload.message);
 *   });
 *   return null;
 * }
 * ```
 */

import { useEffect } from 'react';
import { useInject } from '@abdokouta/ts-container-react';
import { EventManager } from '@/services/event-manager.service';
import type { EventListener } from '@/interfaces';

/**
 * Registers an event listener that auto-unsubscribes on component unmount.
 *
 * @param event - The event name or wildcard pattern.
 * @param listener - The callback to invoke.
 * @param priority - Optional priority (higher = earlier).
 */
export function useEvent(event: string, listener: EventListener, priority?: number): void {
  const manager = useInject(EventManager);
  const events = manager.dispatcher();

  useEffect(() => {
    const unsubscribe = events.listen(event, listener, priority);
    return unsubscribe;
  }, [event]);
}
