/**
 * Event Priority
 *
 * Controls the order in which listeners are invoked for the same event.
 * Higher priority listeners execute first. Listeners with the same
 * priority execute in registration order.
 *
 * @enum {number}
 *
 * @example
 * ```typescript
 * @OnEvent('user.created', { priority: EventPriority.HIGH })
 * handleUserCreated(payload: UserCreatedEvent) { ... }
 * ```
 */
export enum EventPriority {
  /** Execute last — cleanup, logging, analytics. */
  LOW = -100,

  /** Default priority — most listeners use this. */
  NORMAL = 0,

  /** Execute before normal listeners — validation, enrichment. */
  HIGH = 100,

  /** Execute first — security checks, rate limiting. */
  CRITICAL = 200,
}
