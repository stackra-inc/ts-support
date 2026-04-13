/**
 * @Channel Decorator
 *
 * Marks a subscriber class as belonging to a specific event channel.
 *
 * @module @pixielity/events
 * @category Decorators
 */

import 'reflect-metadata';

/** Metadata key for the @Channel decorator. */
export const CHANNEL_METADATA = Symbol.for('CHANNEL_METADATA');

/** Assigns a subscriber class to a specific event channel. */
export function Channel(channel: string): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function) => {
    Reflect.defineMetadata(CHANNEL_METADATA, channel, target);
  };
}

/** Reads the channel name from a class decorated with @Channel. */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getChannel(target: Function): string {
  return Reflect.getMetadata(CHANNEL_METADATA, target) ?? 'default';
}
