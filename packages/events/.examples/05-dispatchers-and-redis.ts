/**
 * Dispatchers & Redis Example
 *
 * |--------------------------------------------------------------------------
 * | @pixielity/events — Multiple Dispatchers & Redis
 * |--------------------------------------------------------------------------
 * |
 * | This example demonstrates the dispatcher architecture:
 * | - MemoryDispatcher (default, in-memory)
 * | - RedisDispatcher (cross-process via @abdokouta/react-redis)
 * | - NullDispatcher (testing, silences all dispatch)
 * | - EventService as the manager (resolves dispatchers by name)
 * | - Switching between dispatchers at runtime
 * | - Module configuration with multiple dispatchers
 * |
 * | The dispatcher pattern mirrors the cache package's store pattern:
 * |   CacheService → Store (memory, redis, null)
 * |   EventService → Dispatcher (memory, redis, null)
 * |
 * | @example
 * | ```bash
 * | npx ts-node .examples/05-dispatchers-and-redis.ts
 * | ```
 * |
 */

import 'reflect-metadata';
import {
  MemoryDispatcher,
  NullDispatcher,
  EventPriority,
  Subscriber,
  OnEvent,
  Channel,
} from '@pixielity/events';
import type { EventDispatcherInterface, EventSubscriber } from '@pixielity/events';

// ─── Example 1: MemoryDispatcher (Default) ──────────────────────────────────
//
// The default dispatcher. Stores listeners in memory using Map.
// Uses RxJS Subject for async streaming. Listeners are lost on refresh.
//

async function memoryDispatcherExample() {
  console.log('\n=== Example 1: MemoryDispatcher (Default) ===\n');

  /*
  |--------------------------------------------------------------------------
  | Create a MemoryDispatcher directly.
  |--------------------------------------------------------------------------
  |
  | In a real app, EventService creates this for you based on config.
  | Here we instantiate it directly for demonstration.
  |
  | Options:
  |   - wildcards: enable wildcard matching (default: true)
  |   - prefix: key prefix for namespacing (optional)
  |
  */
  const dispatcher = new MemoryDispatcher({ wildcards: true });

  dispatcher.listen('user.created', (payload) => {
    const { userId } = payload as { userId: string };
    console.log(`  ✓ [Memory] User created: ${userId}`);
  });

  dispatcher.dispatch('user.created', { userId: 'U-001' });

  /*
  |--------------------------------------------------------------------------
  | RxJS Observable — async event streaming.
  |--------------------------------------------------------------------------
  */
  const sub = dispatcher.asObservable().subscribe(({ event, payload }) => {
    console.log(`  ✓ [Memory/RxJS] Event: ${event}`, payload);
  });

  dispatcher.dispatch('order.placed', { orderId: 'ORD-001' });

  // Cleanup.
  sub.unsubscribe();
  dispatcher.destroy();
  console.log('  ✓ Dispatcher destroyed');
}

// ─── Example 2: NullDispatcher (Testing) ────────────────────────────────────
//
// Silences all dispatch calls. Listener registration is tracked
// so you can assert that listeners were set up correctly.
//

async function nullDispatcherExample() {
  console.log('\n=== Example 2: NullDispatcher (Testing) ===\n');

  /*
  |--------------------------------------------------------------------------
  | NullDispatcher — no-op dispatch for testing.
  |--------------------------------------------------------------------------
  |
  | Use this in tests to prevent side effects from event dispatch
  | while still verifying listener setup.
  |
  */
  const dispatcher = new NullDispatcher();

  // Listeners are tracked.
  dispatcher.listen('user.created', () => {
    console.log('  ✗ This should NOT fire');
  });

  // Dispatch is silenced — listener is NOT called.
  dispatcher.dispatch('user.created', { userId: 'U-002' });
  console.log('  ✓ Dispatch was silenced (no listener fired)');

  // But we can verify listeners were registered.
  console.log(`  ✓ hasListeners('user.created'): ${dispatcher.hasListeners('user.created')}`);
  console.log(`  ✓ getListeners count: ${dispatcher.getListeners('user.created').length}`);

  dispatcher.destroy();
}

// ─── Example 3: RedisDispatcher (Configuration Pattern) ─────────────────────
//
// The RedisDispatcher extends MemoryDispatcher with Redis pub/sub.
// It requires RedisModule to be imported — RedisService is injected via DI.
//

function redisDispatcherExample() {
  console.log('\n=== Example 3: RedisDispatcher (Configuration) ===\n');

  /*
  |--------------------------------------------------------------------------
  | RedisDispatcher — cross-process event broadcasting.
  |--------------------------------------------------------------------------
  |
  | Architecture:
  |   1. Local listeners managed by MemoryDispatcher (parent)
  |   2. On dispatch(), event is ALSO published to a Redis list
  |   3. A polling loop reads events from Redis and dispatches locally
  |   4. Events propagate across multiple clients/servers
  |
  | RedisService is injected via DI — no manual connection passing.
  | Just import RedisModule.forRoot() and configure the connection name.
  |
  */
  console.log('  // Module setup:');
  console.log('  @Module({');
  console.log('    imports: [');
  console.log('      // 1. Import RedisModule with your Upstash connection');
  console.log('      RedisModule.forRoot({');
  console.log("        default: 'events',");
  console.log('        connections: {');
  console.log('          events: {');
  console.log('            url: process.env.UPSTASH_REDIS_REST_URL!,');
  console.log('            token: process.env.UPSTASH_REDIS_REST_TOKEN!,');
  console.log('          },');
  console.log('        },');
  console.log('      }),');
  console.log('');
  console.log('      // 2. Import EventsModule with redis dispatcher');
  console.log('      EventsModule.forRoot({');
  console.log("        default: 'redis',");
  console.log('        dispatchers: {');
  console.log("          memory: { driver: 'memory' },");
  console.log('          redis: {');
  console.log("            driver: 'redis',");
  console.log("            connection: 'events',       // Redis connection name");
  console.log("            prefix: 'myapp:events:',    // Redis key prefix");
  console.log('            pollingInterval: 1000,       // Poll every 1s');
  console.log('          },');
  console.log('        },');
  console.log('      }),');
  console.log('    ],');
  console.log('    providers: [UserSubscriber],');
  console.log('  })');
  console.log('  export class AppModule {}');
  console.log('');
  console.log('  // Events dispatched via EventService will use the redis dispatcher.');
  console.log('  // They propagate to all connected clients/servers.');
  console.log('  ✓ Redis dispatcher configuration demonstrated');
}

// ─── Example 4: EventService — The Manager ──────────────────────────────────
//
// EventService manages named dispatchers and delegates to the active one.
// It mirrors CacheService → Store pattern.
//

function eventServiceExample() {
  console.log('\n=== Example 4: EventService — The Manager ===\n');

  /*
  |--------------------------------------------------------------------------
  | EventService — resolves dispatchers by name.
  |--------------------------------------------------------------------------
  |
  | In a real app, EventService is injected via DI:
  |   @Inject(EventService) private events: EventService
  |
  | Or via the React hook:
  |   const events = useEventDispatcher();
  |
  | The service delegates all calls to the default dispatcher.
  | Use dispatcher(name) to target a specific dispatcher.
  |
  */
  console.log('  // Inject EventService via DI:');
  console.log('  @Injectable()');
  console.log('  class OrderService {');
  console.log('    constructor(@Inject(EventService) private events: EventService) {}');
  console.log('');
  console.log('    async createOrder(data: OrderData) {');
  console.log('      const order = await this.db.create(data);');
  console.log('');
  console.log('      // Dispatch on the default dispatcher (configured in forRoot).');
  console.log("      this.events.dispatch('order.created', { orderId: order.id });");
  console.log('');
  console.log('      // Or target a specific dispatcher:');
  console.log(
    "      this.events.dispatcher('redis').dispatch('order.created', { orderId: order.id });"
  );
  console.log(
    "      this.events.dispatcher('memory').dispatch('order.created', { orderId: order.id });"
  );
  console.log('');
  console.log('      return order;');
  console.log('    }');
  console.log('  }');
  console.log('');
  console.log('  ✓ EventService manager pattern demonstrated');
}

// ─── Example 5: Multiple Dispatchers ────────────────────────────────────────
//
// Configure multiple dispatchers for different use cases.
//

function multipleDispatchersExample() {
  console.log('\n=== Example 5: Multiple Dispatchers ===\n');

  /*
  |--------------------------------------------------------------------------
  | Use different dispatchers for different concerns.
  |--------------------------------------------------------------------------
  |
  | - 'memory': fast, local-only events (UI updates, component comms)
  | - 'redis': cross-process events (order notifications, real-time sync)
  | - 'test': silenced events (unit tests)
  |
  */
  console.log('  EventsModule.forRoot({');
  console.log("    default: 'memory',");
  console.log('    dispatchers: {');
  console.log("      memory: { driver: 'memory', wildcards: true },");
  console.log("      redis: { driver: 'redis', connection: 'events' },");
  console.log("      test: { driver: 'null' },");
  console.log('    },');
  console.log('  })');
  console.log('');
  console.log('  // In a service:');
  console.log("  events.dispatch('ui.updated', data);                    // → memory (default)");
  console.log("  events.dispatcher('redis').dispatch('order.placed', d); // → redis");
  console.log("  events.dispatcher('test').dispatch('anything', d);      // → null (silenced)");
  console.log('');
  console.log('  ✓ Multiple dispatchers demonstrated');
}

// ─── Example 6: Driver Comparison ───────────────────────────────────────────

function driverComparison() {
  console.log('\n=== Example 6: Driver Comparison ===\n');

  console.log('  ┌────────────────┬──────────────┬──────────────┬──────────────┐');
  console.log('  │ Feature        │ Memory       │ Redis        │ Null         │');
  console.log('  ├────────────────┼──────────────┼──────────────┼──────────────┤');
  console.log('  │ Persistence    │ ✗ None       │ ✓ Redis      │ ✗ None       │');
  console.log('  │ Cross-process  │ ✗ No         │ ✓ Yes        │ ✗ No         │');
  console.log('  │ Wildcards      │ ✓ Yes        │ ✓ Yes        │ ✗ No         │');
  console.log('  │ RxJS stream    │ ✓ Yes        │ ✓ Yes        │ ✗ EMPTY      │');
  console.log('  │ Priority       │ ✓ Yes        │ ✓ Yes        │ ✗ No         │');
  console.log('  │ Dispatch       │ Sync         │ Sync + Redis │ No-op        │');
  console.log('  │ Use case       │ SPA / Dev    │ Production   │ Testing      │');
  console.log('  └────────────────┴──────────────┴──────────────┴──────────────┘');
}

// ─── Example 7: Full Decorator Example ──────────────────────────────────────
//
// A complete working example with @Subscriber, @OnEvent, @Channel,
// and the MemoryDispatcher — all wired together.
//

/*
|--------------------------------------------------------------------------
| OrderSubscriber — handles order lifecycle events.
|--------------------------------------------------------------------------
|
| @Subscriber() marks the class for auto-discovery by EventsModule.
| @Channel('orders') groups all listeners under the 'orders' channel.
| Each @OnEvent() method is automatically registered as a listener.
|
*/
@Channel('orders')
@Subscriber()
class OrderSubscriber implements EventSubscriber {
  /*
  |--------------------------------------------------------------------------
  | @OnEvent('order.placed', { priority: CRITICAL })
  |--------------------------------------------------------------------------
  |
  | Validates the order before any other listener runs.
  | CRITICAL priority ensures this fires first.
  |
  */
  @OnEvent('order.placed', { priority: EventPriority.CRITICAL })
  validateOrder(payload: { orderId: string; total: number }) {
    console.log(`  ✓ [OrderSubscriber] Validating order ${payload.orderId} ($${payload.total})`);
    if (payload.total <= 0) {
      console.log(`  ✗ [OrderSubscriber] Invalid total — blocking`);
      return false; // Stop propagation.
    }
  }

  /*
  |--------------------------------------------------------------------------
  | @OnEvent('order.placed')
  |--------------------------------------------------------------------------
  |
  | Sends a confirmation email. Runs at NORMAL priority (after validation).
  |
  */
  @OnEvent('order.placed')
  sendConfirmation(payload: { orderId: string }) {
    console.log(`  ✓ [OrderSubscriber] Sending confirmation for ${payload.orderId}`);
  }

  /*
  |--------------------------------------------------------------------------
  | @OnEvent('order.*', { priority: LOW })
  |--------------------------------------------------------------------------
  |
  | Wildcard listener — logs ALL order events for analytics.
  | LOW priority ensures this runs last.
  | Receives (eventName, payload) because it's a wildcard.
  |
  */
  @OnEvent('order.*', { priority: EventPriority.LOW })
  trackAnalytics(eventName: string, payload: unknown) {
    console.log(`  ✓ [OrderSubscriber/Analytics] ${eventName}`, payload);
  }

  /*
  |--------------------------------------------------------------------------
  | @OnEvent('order.completed', { once: true })
  |--------------------------------------------------------------------------
  |
  | Fires only on the FIRST completed order, then auto-removes.
  | Useful for one-time triggers like "first sale" celebrations.
  |
  */
  @OnEvent('order.completed', { once: true })
  celebrateFirstSale(payload: { orderId: string }) {
    console.log(`  🎉 [OrderSubscriber] First sale! Order ${payload.orderId}`);
  }

  /*
  |--------------------------------------------------------------------------
  | subscribe() — manual registration (Laravel pattern).
  |--------------------------------------------------------------------------
  */
  subscribe(_dispatcher: EventDispatcherInterface) {
    return {
      'order.refunded': (payload: unknown) => {
        const { orderId } = payload as { orderId: string };
        console.log(`  ✓ [OrderSubscriber] Refund processed for ${orderId}`);
      },
    };
  }
}

async function decoratorExample() {
  console.log('\n=== Example 7: Full Decorator Example ===\n');

  /*
  |--------------------------------------------------------------------------
  | Create a dispatcher and register the subscriber.
  |--------------------------------------------------------------------------
  |
  | In a real app, EventsModule auto-discovers @Subscriber() classes
  | from the module's providers array. Here we register manually.
  |
  */
  const dispatcher = new MemoryDispatcher({ wildcards: true });
  dispatcher.subscribe(new OrderSubscriber());

  // Dispatch events — decorators fire in priority order.
  console.log('  ── Dispatching order.placed ──');
  dispatcher.dispatch('order.placed', { orderId: 'ORD-001', total: 99.99 });

  console.log('\n  ── Dispatching order.completed ──');
  dispatcher.dispatch('order.completed', { orderId: 'ORD-001' });

  console.log('\n  ── Dispatching order.completed again (once already fired) ──');
  dispatcher.dispatch('order.completed', { orderId: 'ORD-002' });

  console.log('\n  ── Dispatching order.refunded (manual subscribe) ──');
  dispatcher.dispatch('order.refunded', { orderId: 'ORD-001' });

  dispatcher.destroy();
}

// ─── Run All Examples ───────────────────────────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Events — Dispatchers & Redis         ║');
  console.log('╚════════════════════════════════════════╝');

  await memoryDispatcherExample();
  await nullDispatcherExample();
  redisDispatcherExample();
  eventServiceExample();
  multipleDispatchersExample();
  driverComparison();
  await decoratorExample();

  console.log('\n✅ All examples completed successfully!\n');
}

main().catch(console.error);
