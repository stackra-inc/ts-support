/**
 * @Subscriber Decorator
 *
 * Marks a class as an event subscriber.
 *
 * @module @pixielity/events
 * @category Decorators
 */

import 'reflect-metadata';
import { EVENT_SUBSCRIBER_METADATA } from '@/constants';

/** Marks a class as an event subscriber for auto-discovery. */
export function Subscriber(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function) => {
    Reflect.defineMetadata(EVENT_SUBSCRIBER_METADATA, true, target);
  };
}
