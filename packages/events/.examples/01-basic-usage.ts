/**
 * Basic Events Usage Example
 *
 * |--------------------------------------------------------------------------
 * | @pixielity/events — Basic Usage
 * |--------------------------------------------------------------------------
 * |
 * | This example demonstrates the fundamental event dispatcher operations:
 * | - Dispatching events with payloads
 * | - Registering listeners with listen()
 * | - One-time listeners with once()
 * | - Removing listeners with forget()
 * | - Checking if listeners exist
 * |
 * | The event dispatcher mirrors Laravel's Illuminate\Events\Dispatcher.
 * | Events are strings (dot-notation recommended), payloads are any value.
 * |
 * | @example
 * | Run this example:
 * | ```bash
 * | npx ts-node .examples/01-basic-usage.ts
 * | ```
 * |
 */

import { Module } from '@abdokouta/react-di';
import { EventsModule, MemoryDispatcher } from '@pixielity/events';
import type { EventDispatcherInterface } from '@pixielity/events';

// ─── Module Setup ───────────────────────────────────────────────────────────
//
// EventsModule.forRoot() registers the EventService as a global singleton
// in the DI container. It manages named dispatchers (memory, redis, null).
// No config needed for basic usage — defaults to the memory dispatcher.
//

@Module({
  imports: [EventsModule.forRoot()],
})
class AppModule {}

// ─── Example 1: Basic Listen + Dispatch ─────────────────────────────────────
//
// Register a listener for an event, then dispatch it.
// The listener receives the payload as its first argument.
//

function basicListenAndDispatch(events: EventDispatcherInterface) {
  console.log('\n=== Example 1: Basic Listen + Dispatch ===\n');

  /*
  |--------------------------------------------------------------------------
  | Register a listener for the 'user.created' event.
  |--------------------------------------------------------------------------
  |
  | listen() returns an unsubscribe function — call it to remove the listener.
  | The listener callback receives the payload passed to dispatch().
  |
  */
  const unsubscribe = events.listen('user.created', (payload) => {
    const { userId, email } = payload as { userId: string; email: string };
    console.log(`  ✓ Listener fired: user.created — userId=${userId}, email=${email}`);
  });

  /*
  |--------------------------------------------------------------------------
  | Dispatch the event with a payload.
  |--------------------------------------------------------------------------
  |
  | All registered listeners for 'user.created' are called synchronously.
  | dispatch() returns an array of listener return values.
  |
  */
  events.dispatch('user.created', { userId: '123', email: 'user@example.com' });

  // Clean up — remove the listener.
  unsubscribe();

  // This dispatch won't trigger anything — the listener was removed.
  events.dispatch('user.created', { userId: '456', email: 'other@example.com' });
  console.log('  ✓ After unsubscribe: no listener fired');
}

// ─── Example 2: Multiple Listeners ──────────────────────────────────────────
//
// Multiple listeners can be registered for the same event.
// They execute in registration order (unless priority is set).
//

function multipleListeners(events: EventDispatcherInterface) {
  console.log('\n=== Example 2: Multiple Listeners ===\n');

  /*
  |--------------------------------------------------------------------------
  | Register two listeners for the same event.
  |--------------------------------------------------------------------------
  |
  | Both listeners fire when 'order.placed' is dispatched.
  | Execution order follows registration order (FIFO) at the same priority.
  |
  */
  const unsub1 = events.listen('order.placed', (payload) => {
    const { orderId } = payload as { orderId: string };
    console.log(`  ✓ Listener 1: Send confirmation email for order ${orderId}`);
  });

  const unsub2 = events.listen('order.placed', (payload) => {
    const { orderId } = payload as { orderId: string };
    console.log(`  ✓ Listener 2: Update inventory for order ${orderId}`);
  });

  // Dispatch — both listeners fire.
  events.dispatch('order.placed', { orderId: 'ORD-001' });

  // Clean up.
  unsub1();
  unsub2();
}

// ─── Example 3: One-Time Listeners ──────────────────────────────────────────
//
// once() registers a listener that auto-removes after the first invocation.
// Useful for one-off reactions like "first login" or "initial setup".
//

function oneTimeListeners(events: EventDispatcherInterface) {
  console.log('\n=== Example 3: One-Time Listeners (once) ===\n');

  /*
  |--------------------------------------------------------------------------
  | Register a one-time listener.
  |--------------------------------------------------------------------------
  |
  | The listener fires on the first dispatch, then auto-removes itself.
  | Subsequent dispatches of the same event won't trigger it.
  |
  */
  events.once('app.first_launch', () => {
    console.log('  ✓ First launch detected — showing onboarding');
  });

  // First dispatch — listener fires.
  events.dispatch('app.first_launch');

  // Second dispatch — listener already removed, nothing happens.
  events.dispatch('app.first_launch');
  console.log('  ✓ Second dispatch: no listener fired (once removed it)');
}

// ─── Example 4: Listener Return Values ──────────────────────────────────────
//
// dispatch() collects and returns all listener return values as an array.
// This is useful for validation, enrichment, or aggregation patterns.
//

function listenerReturnValues(events: EventDispatcherInterface) {
  console.log('\n=== Example 4: Listener Return Values ===\n');

  /*
  |--------------------------------------------------------------------------
  | Listeners can return values.
  |--------------------------------------------------------------------------
  |
  | dispatch() returns an array of all listener return values.
  | This enables patterns like validation (return false to stop propagation)
  | or data enrichment (return transformed data).
  |
  */
  const unsub1 = events.listen('cart.validate', () => {
    console.log('  ✓ Validator 1: checking stock');
    return { valid: true, check: 'stock' };
  });

  const unsub2 = events.listen('cart.validate', () => {
    console.log('  ✓ Validator 2: checking price');
    return { valid: true, check: 'price' };
  });

  const results = events.dispatch('cart.validate', { cartId: 'CART-001' });
  console.log('  ✓ Results:', results);

  unsub1();
  unsub2();
}

// ─── Example 5: Stop Propagation ────────────────────────────────────────────
//
// If a listener returns `false`, event propagation stops.
// Subsequent listeners for the same event are NOT called.
//

function stopPropagation(events: EventDispatcherInterface) {
  console.log('\n=== Example 5: Stop Propagation (return false) ===\n');

  /*
  |--------------------------------------------------------------------------
  | Return false to stop propagation.
  |--------------------------------------------------------------------------
  |
  | When a listener returns `false`, the dispatcher stops calling
  | remaining listeners. This mirrors Laravel's event propagation.
  |
  */
  const unsub1 = events.listen('payment.process', () => {
    console.log('  ✓ Listener 1: Fraud check — BLOCKED');
    return false; // Stop propagation — payment is blocked.
  });

  const unsub2 = events.listen('payment.process', () => {
    console.log('  ✗ Listener 2: Process payment — should NOT fire');
  });

  events.dispatch('payment.process', { amount: 9999 });
  console.log('  ✓ Listener 2 was skipped due to propagation stop');

  unsub1();
  unsub2();
}

// ─── Example 6: until() — Halt on First Response ───────────────────────────
//
// until() dispatches an event and returns the first non-null response.
// Useful for "who handles this?" patterns.
//

function untilExample(events: EventDispatcherInterface) {
  console.log('\n=== Example 6: until() — First Non-Null Response ===\n');

  /*
  |--------------------------------------------------------------------------
  | until() stops at the first non-null return value.
  |--------------------------------------------------------------------------
  |
  | This is equivalent to dispatch(event, payload, true).
  | Useful for "first responder" patterns — e.g. which handler
  | can process this request?
  |
  */
  const unsub1 = events.listen('resolve.handler', () => {
    return null; // Can't handle it.
  });

  const unsub2 = events.listen('resolve.handler', () => {
    return { handler: 'PaymentHandler', canHandle: true };
  });

  const unsub3 = events.listen('resolve.handler', () => {
    return { handler: 'FallbackHandler', canHandle: true };
  });

  const result = events.until('resolve.handler', { type: 'payment' });
  console.log('  ✓ First responder:', result);

  unsub1();
  unsub2();
  unsub3();
}

// ─── Example 7: forget() and hasListeners() ────────────────────────────────
//
// forget() removes all listeners for an event.
// hasListeners() checks if any listeners are registered.
//

function forgetAndHasListeners(events: EventDispatcherInterface) {
  console.log('\n=== Example 7: forget() and hasListeners() ===\n');

  events.listen('temp.event', () => console.log('  temp listener'));

  console.log(`  ✓ hasListeners('temp.event'): ${events.hasListeners('temp.event')}`);

  /*
  |--------------------------------------------------------------------------
  | forget() removes ALL listeners for the given event.
  |--------------------------------------------------------------------------
  |
  | Unlike the unsubscribe function (which removes a single listener),
  | forget() removes every listener registered for that event name.
  |
  */
  events.forget('temp.event');

  console.log(`  ✓ After forget: hasListeners('temp.event'): ${events.hasListeners('temp.event')}`);
}

// ─── Example 8: Object Events (Laravel Pattern) ────────────────────────────
//
// You can dispatch class instances as events.
// The constructor name is used as the event name.
//

function objectEvents(events: EventDispatcherInterface) {
  console.log('\n=== Example 8: Object Events ===\n');

  /*
  |--------------------------------------------------------------------------
  | Dispatch a class instance as an event.
  |--------------------------------------------------------------------------
  |
  | When you pass an object to dispatch(), the dispatcher uses
  | `object.constructor.name` as the event name and the object itself
  | as the payload. This mirrors Laravel's event object pattern.
  |
  */
  class UserRegistered {
    constructor(
      public readonly userId: string,
      public readonly email: string
    ) {}
  }

  const unsub = events.listen('UserRegistered', (payload) => {
    const event = payload as UserRegistered;
    console.log(`  ✓ UserRegistered event: userId=${event.userId}, email=${event.email}`);
  });

  // Dispatch the object — constructor name 'UserRegistered' is the event name.
  events.dispatch(new UserRegistered('user-789', 'new@example.com'));

  unsub();
}

// ─── Run All Examples ───────────────────────────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Events — Basic Usage Examples        ║');
  console.log('╚════════════════════════════════════════╝');

  /*
  |--------------------------------------------------------------------------
  | Bootstrap the DI container and resolve the dispatcher.
  |--------------------------------------------------------------------------
  |
  | In a real app, inject EventService via @Inject(EventService).
  | Here we instantiate a MemoryDispatcher directly for demonstration.
  |
  */
  const events = new MemoryDispatcher();

  basicListenAndDispatch(events);
  multipleListeners(events);
  oneTimeListeners(events);
  listenerReturnValues(events);
  stopPropagation(events);
  untilExample(events);
  forgetAndHasListeners(events);
  objectEvents(events);

  console.log('\n✅ All examples completed successfully!\n');
}

main().catch(console.error);
