/**
 * Injection Tokens
 *
 * Symbols used as service identifiers for dependency injection.
 * Follows the same pattern as cache/redis packages.
 *
 * @module @pixielity/events
 * @category Constants
 */

/** Injection token for the events module configuration. */
export const EVENT_CONFIG = Symbol.for('EVENT_CONFIG');

/** Injection token for the EventManager (class-based). */
export const EVENT_MANAGER = Symbol.for('EVENT_MANAGER');

/** Metadata key for the @OnEvent decorator. */
export const ON_EVENT_METADATA = Symbol.for('ON_EVENT_METADATA');

/** Metadata key for the @Subscriber decorator. */
export const EVENT_SUBSCRIBER_METADATA = Symbol.for('EVENT_SUBSCRIBER_METADATA');
