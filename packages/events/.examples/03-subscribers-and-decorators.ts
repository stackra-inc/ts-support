/**
 * Subscribers & Decorators Example
 *
 * |--------------------------------------------------------------------------
 * | @pixielity/events — Subscribers & Decorators
 * |--------------------------------------------------------------------------
 * |
 * | This example demonstrates the decorator-based subscriber pattern:
 * | - @Subscriber() class decorator
 * | - @OnEvent() method decorator
 * | - @Channel() class decorator for grouping
 * | - Priority and once options on @OnEvent
 * | - Auto-discovery from module providers
 * | - Manual subscriber registration
 * |
 * | Subscribers are classes that group related event listeners together.
 * | They mirror Laravel's EventSubscriber pattern.
 * |
 * | @example
 * | Run this example:
 * | ```bash
 * | npx ts-node .examples/03-subscribers-and-decorators.ts
 * | ```
 * |
 */

import 'reflect-metadata';
import { Module } from '@abdokouta/react-di';
import {
  EventsModule,
  MemoryDispatcher,
  Subscriber,
  OnEvent,
  Channel,
  EventPriority,
} from '@pixielity/events';
import type { EventDispatcherInterface, EventSubscriber } from '@pixielity/events';

// ─── Example 1: Basic Subscriber with @OnEvent ─────────────────────────────
//
// A subscriber is a class that groups related event listeners.
// Decorate the class with @Subscriber() and methods with @OnEvent().
//

/*
|--------------------------------------------------------------------------
| UserSubscriber
|--------------------------------------------------------------------------
|
| Handles all user-related events. Each method decorated with @OnEvent()
| is automatically registered as a listener when the subscriber is
| registered with the dispatcher.
|
| In a real app, this class would be listed in the module's `providers`
| array and auto-discovered by EventsModule.
|
*/
@Subscriber()
class UserSubscriber implements EventSubscriber {
  /*
  |--------------------------------------------------------------------------
  | @OnEvent('user.created')
  |--------------------------------------------------------------------------
  |
  | Fires when a new user is created.
  | Default priority (NORMAL = 0).
  |
  */
  @OnEvent('user.created')
  handleUserCreated(payload: { userId: string; email: string }) {
    console.log(`  ✓ [UserSubscriber] User created: ${payload.userId} (${payload.email})`);
  }

  /*
  |--------------------------------------------------------------------------
  | @OnEvent('user.deleted', { priority: HIGH })
  |--------------------------------------------------------------------------
  |
  | Fires when a user is deleted. HIGH priority ensures this runs
  | before NORMAL-priority listeners (e.g. for cleanup before logging).
  |
  */
  @OnEvent('user.deleted', { priority: EventPriority.HIGH })
  handleUserDeleted(payload: { userId: string }) {
    console.log(`  ✓ [UserSubscriber] User deleted (HIGH priority): ${payload.userId}`);
  }

  /*
  |--------------------------------------------------------------------------
  | @OnEvent('user.login', { once: true })
  |--------------------------------------------------------------------------
  |
  | Fires only on the FIRST user login, then auto-removes itself.
  | Useful for one-time setup or onboarding triggers.
  |
  */
  @OnEvent('user.login', { once: true })
  handleFirstLogin(payload: { userId: string }) {
    console.log(`  ✓ [UserSubscriber] First login detected: ${payload.userId}`);
  }

  /*
  |--------------------------------------------------------------------------
  | subscribe() — Manual registration (Laravel pattern)
  |--------------------------------------------------------------------------
  |
  | The subscribe() method is called by the dispatcher when the subscriber
  | is registered. It returns a map of event → handler.
  |
  | This is the "manual" approach — @OnEvent decorators are the "auto" approach.
  | Both work together. The dispatcher calls subscribe() first, then reads
  | @OnEvent metadata.
  |
  */
  subscribe(_dispatcher: EventDispatcherInterface) {
    // Return manual mappings (in addition to @OnEvent decorators).
    return {
      'user.updated': (payload: unknown) => {
        const { userId } = payload as { userId: string };
        console.log(`  ✓ [UserSubscriber] User updated (manual): ${userId}`);
      },
    };
  }
}

function basicSubscriber(events: EventDispatcherInterface) {
  console.log('\n=== Example 1: Basic Subscriber with @OnEvent ===\n');

  /*
  |--------------------------------------------------------------------------
  | Register the subscriber with the dispatcher.
  |--------------------------------------------------------------------------
  |
  | subscribe() does two things:
  | 1. Calls subscriber.subscribe(dispatcher) for manual mappings
  | 2. Reads @OnEvent metadata and registers each decorated method
  |
  */
  events.subscribe(new UserSubscriber());

  // Dispatch events — the subscriber's methods fire.
  events.dispatch('user.created', { userId: 'U-001', email: 'alice@example.com' });
  events.dispatch('user.deleted', { userId: 'U-002' });
  events.dispatch('user.updated', { userId: 'U-003' });

  // First login — fires once.
  events.dispatch('user.login', { userId: 'U-001' });
  // Second login — the once listener was already removed.
  events.dispatch('user.login', { userId: 'U-001' });
  console.log('  ✓ Second login: @OnEvent({ once: true }) already removed');
}

// ─── Example 2: @Channel Decorator ──────────────────────────────────────────
//
// @Channel() assigns a subscriber to a named event channel.
// All @OnEvent methods in the class belong to that channel.
//

/*
|--------------------------------------------------------------------------
| NotificationSubscriber — on the 'notifications' channel
|--------------------------------------------------------------------------
|
| The @Channel('notifications') decorator groups all listeners in this
| class under the 'notifications' channel. This is metadata only —
| the dispatcher doesn't enforce channel isolation by default.
|
| Channels are useful for:
| - Organizing subscribers by domain
| - Filtering listeners by channel in custom dispatchers
| - Documentation and discoverability
|
*/
@Channel('notifications')
@Subscriber()
class NotificationSubscriber implements EventSubscriber {
  @OnEvent('order.placed')
  sendOrderConfirmation(payload: { orderId: string }) {
    console.log(`  ✓ [Notifications] Order confirmation sent for ${payload.orderId}`);
  }

  @OnEvent('order.shipped')
  sendShippingNotification(payload: { orderId: string; trackingId: string }) {
    console.log(
      `  ✓ [Notifications] Shipping notification: ${payload.orderId} → ${payload.trackingId}`
    );
  }

  subscribe(_dispatcher: EventDispatcherInterface) {
    return {};
  }
}

function channelDecorator(events: EventDispatcherInterface) {
  console.log('\n=== Example 2: @Channel Decorator ===\n');

  events.subscribe(new NotificationSubscriber());

  events.dispatch('order.placed', { orderId: 'ORD-100' });
  events.dispatch('order.shipped', { orderId: 'ORD-100', trackingId: 'TRK-555' });
}

// ─── Example 3: Multiple Subscribers ────────────────────────────────────────
//
// Multiple subscribers can listen to the same events.
// Each subscriber handles its own concern (SRP).
//

/*
|--------------------------------------------------------------------------
| AnalyticsSubscriber — tracks events for analytics
|--------------------------------------------------------------------------
*/
@Channel('analytics')
@Subscriber()
class AnalyticsSubscriber implements EventSubscriber {
  @OnEvent('order.placed', { priority: EventPriority.LOW })
  trackOrderPlaced(payload: { orderId: string }) {
    console.log(`  ✓ [Analytics] Tracked order.placed: ${payload.orderId}`);
  }

  @OnEvent('user.created', { priority: EventPriority.LOW })
  trackUserCreated(payload: { userId: string }) {
    console.log(`  ✓ [Analytics] Tracked user.created: ${payload.userId}`);
  }

  subscribe(_dispatcher: EventDispatcherInterface) {
    return {};
  }
}

/*
|--------------------------------------------------------------------------
| AuditSubscriber — logs events for audit trail
|--------------------------------------------------------------------------
*/
@Subscriber()
class AuditSubscriber implements EventSubscriber {
  @OnEvent('order.placed', { priority: EventPriority.CRITICAL })
  auditOrderPlaced(payload: { orderId: string }) {
    console.log(`  ✓ [Audit] CRITICAL: order.placed logged: ${payload.orderId}`);
  }

  subscribe(_dispatcher: EventDispatcherInterface) {
    return {};
  }
}

function multipleSubscribers(events: EventDispatcherInterface) {
  console.log('\n=== Example 3: Multiple Subscribers (Same Event) ===\n');

  /*
  |--------------------------------------------------------------------------
  | Register multiple subscribers for the same events.
  |--------------------------------------------------------------------------
  |
  | When 'order.placed' is dispatched:
  |   1. AuditSubscriber.auditOrderPlaced (CRITICAL priority)
  |   2. NotificationSubscriber.sendOrderConfirmation (NORMAL priority)
  |   3. AnalyticsSubscriber.trackOrderPlaced (LOW priority)
  |
  | Each subscriber handles its own concern — separation of responsibilities.
  |
  */
  events.subscribe(new AnalyticsSubscriber());
  events.subscribe(new AuditSubscriber());

  events.dispatch('order.placed', { orderId: 'ORD-200' });
  console.log('  ✓ Expected order: Audit (CRITICAL) → Notification (NORMAL) → Analytics (LOW)');
}

// ─── Example 4: Module Auto-Discovery ───────────────────────────────────────
//
// In a real app, subscribers are auto-discovered from the module's providers.
// Just list them as providers — no manual registration needed.
//

function moduleAutoDiscovery() {
  console.log('\n=== Example 4: Module Auto-Discovery (Code Pattern) ===\n');

  /*
  |--------------------------------------------------------------------------
  | Auto-discovery pattern — how it works in a real app.
  |--------------------------------------------------------------------------
  |
  | 1. Decorate your subscriber with @Subscriber() and @Injectable()
  | 2. List it in the module's `providers` array
  | 3. EventsModule auto-discovers it and registers its @OnEvent methods
  |
  | No manual subscriber registration needed.
  |
  */
  console.log('  // In your module:');
  console.log('  @Module({');
  console.log('    imports: [EventsModule.forRoot()],');
  console.log('    providers: [UserSubscriber, NotificationSubscriber],');
  console.log('  })');
  console.log('  export class AppModule {}');
  console.log('');
  console.log('  // Subscribers are auto-discovered from providers.');
  console.log('  // No need to pass them in EventsModule.forRoot() config.');
  console.log('  ✓ Auto-discovery pattern demonstrated');
}

// ─── Example 5: Feature Module Subscribers ──────────────────────────────────
//
// Feature modules use EventsModule.forFeature() to register additional
// subscribers without affecting the root module.
//

function featureModuleSubscribers() {
  console.log('\n=== Example 5: Feature Module Subscribers ===\n');

  /*
  |--------------------------------------------------------------------------
  | Feature module pattern.
  |--------------------------------------------------------------------------
  |
  | Root module: EventsModule.forRoot() — registers the global dispatcher.
  | Feature modules: EventsModule.forFeature() — adds more subscribers.
  |
  | The global dispatcher is shared across all modules.
  |
  */
  console.log('  // Root module:');
  console.log('  @Module({');
  console.log('    imports: [EventsModule.forRoot()],');
  console.log('    providers: [UserSubscriber],');
  console.log('  })');
  console.log('  export class AppModule {}');
  console.log('');
  console.log('  // Feature module:');
  console.log('  @Module({');
  console.log('    imports: [EventsModule.forFeature()],');
  console.log('    providers: [PaymentSubscriber, InvoiceSubscriber],');
  console.log('  })');
  console.log('  export class PaymentModule {}');
  console.log('  ✓ Feature module pattern demonstrated');
}

// ─── Run All Examples ───────────────────────────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Events — Subscribers & Decorators    ║');
  console.log('╚════════════════════════════════════════╝');

  // Use a fresh dispatcher for each example group.
  let events: EventDispatcherInterface;

  events = new MemoryDispatcher();
  basicSubscriber(events);

  events = new MemoryDispatcher();
  channelDecorator(events);

  events = new MemoryDispatcher();
  // Re-register notification subscriber for the combined example.
  events.subscribe(new NotificationSubscriber());
  multipleSubscribers(events);

  moduleAutoDiscovery();
  featureModuleSubscribers();

  console.log('\n✅ All examples completed successfully!\n');
}

main().catch(console.error);
