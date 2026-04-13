/**
 * @OnEvent Decorator
 *
 * Marks a method as an event listener. When the class is registered as a
 * subscriber, the decorated method is automatically bound to the specified
 * event name.
 *
 * @module @pixielity/events
 * @category Decorators
 *
 * @example
 * ```typescript
 * import { Injectable } from '@abdokouta/ts-container';
 * import { OnEvent, EventPriority } from '@pixielity/events';
 *
 * @Injectable()
 * export class UserListener {
 *   @OnEvent('user.created')
 *   handleUserCreated(payload: { userId: string }) {
 *     console.log('User created:', payload.userId);
 *   }
 *
 *   @OnEvent('user.*', { priority: EventPriority.HIGH })
 *   handleAllUserEvents(eventName: string, payload: unknown) {
 *     console.log(`Event: ${eventName}`, payload);
 *   }
 *
 *   @OnEvent('order.completed', { once: true })
 *   handleFirstOrder(payload: unknown) {
 *     console.log('First order completed!');
 *   }
 * }
 * ```
 */

import 'reflect-metadata';
import { ON_EVENT_METADATA } from '@/constants';
import type { OnEventOptions, OnEventMetadata } from '@/types';

/**
 * Decorator that marks a method as an event listener.
 *
 * @param event - The event name or wildcard pattern to listen for.
 * @param options - Optional listener options (priority, once).
 * @returns A method decorator.
 */
export function OnEvent(event: string, options: OnEventOptions = {}): MethodDecorator {
  return (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
    // Get existing metadata or create a new array.
    const existing: OnEventMetadata[] =
      Reflect.getMetadata(ON_EVENT_METADATA, target.constructor) ?? [];

    // Add this listener's metadata.
    existing.push({
      event,
      method: String(propertyKey),
      options,
    });

    // Store back on the class constructor.
    Reflect.defineMetadata(ON_EVENT_METADATA, existing, target.constructor);
  };
}
