/**
 * React Hooks Example
 *
 * |--------------------------------------------------------------------------
 * | @pixielity/events — React Hooks
 * |--------------------------------------------------------------------------
 * |
 * | This example demonstrates using events in React components:
 * | - useEvent() — listen for events with auto-cleanup
 * | - useEventDispatcher() — get the dispatcher instance
 * | - Component-to-component communication via events
 * | - Wildcard listeners in components
 * |
 * | These hooks integrate with @abdokouta/react-di's DI container.
 * | The EventService must be registered via EventsModule.forRoot().
 * |
 * | NOTE: This file shows the code patterns — it won't run standalone
 * | because it requires a React rendering environment.
 * |
 * | @example
 * | ```tsx
 * | // In your React app:
 * | import { useEvent, useEventDispatcher } from '@pixielity/events';
 * | ```
 * |
 */

// ─── Example 1: useEvent() — Listen in a Component ─────────────────────────
//
// useEvent() registers a listener and auto-unsubscribes on unmount.
// No manual cleanup needed — it uses useEffect internally.
//

/*
|--------------------------------------------------------------------------
| NotificationBanner Component
|--------------------------------------------------------------------------
|
| Listens for 'notification.received' events and displays the message.
| The listener is automatically cleaned up when the component unmounts.
|
| useEvent(eventName, callback, priority?)
|   - eventName: string — the event name or wildcard pattern
|   - callback: EventListener — the handler function
|   - priority: number — optional priority (default: NORMAL)
|
*/
const NotificationBannerExample = `
import { useState } from 'react';
import { useEvent } from '@pixielity/events';

function NotificationBanner() {
  const [message, setMessage] = useState('');

  // Listen for notification events — auto-cleans up on unmount.
  useEvent('notification.received', (payload) => {
    const { message, type } = payload as { message: string; type: string };
    setMessage(\`[\${type}] \${message}\`);
  });

  if (!message) return null;

  return (
    <div role="alert" className="notification-banner">
      {message}
    </div>
  );
}
`;

// ─── Example 2: useEventDispatcher() — Dispatch from a Component ────────────
//
// useEventDispatcher() resolves the EventService from DI.
// Use it to dispatch events from React components.
//

/*
|--------------------------------------------------------------------------
| CreateOrderButton Component
|--------------------------------------------------------------------------
|
| Dispatches an 'order.created' event when the button is clicked.
| Other components listening for this event will react accordingly.
|
| useEventDispatcher() returns the EventDispatcherInterface.
| It's a thin wrapper around useInject(EventService).
|
*/
const CreateOrderButtonExample = `
import { useEventDispatcher } from '@pixielity/events';

function CreateOrderButton({ orderData }: { orderData: OrderData }) {
  const events = useEventDispatcher();

  const handleClick = async () => {
    // Create the order via API...
    const order = await api.createOrder(orderData);

    // Dispatch event — other components react to this.
    events.dispatch('order.created', {
      orderId: order.id,
      total: order.total,
    });
  };

  return (
    <button onClick={handleClick}>
      Create Order
    </button>
  );
}
`;

// ─── Example 3: Component-to-Component Communication ────────────────────────
//
// Events enable decoupled communication between components.
// No prop drilling, no shared state — just events.
//

/*
|--------------------------------------------------------------------------
| Cart + CartBadge — Decoupled Communication
|--------------------------------------------------------------------------
|
| The Cart component dispatches 'cart.updated' when items change.
| The CartBadge component listens for 'cart.updated' to show the count.
|
| Neither component knows about the other — they communicate via events.
| This is the pub/sub pattern applied to React components.
|
*/
const CartCommunicationExample = `
// ── Cart Component (Publisher) ──────────────────────────────────────────

import { useEventDispatcher } from '@pixielity/events';

function Cart() {
  const events = useEventDispatcher();

  const addItem = (item: CartItem) => {
    // Add item to cart...
    cartStore.add(item);

    // Notify other components.
    events.dispatch('cart.updated', {
      itemCount: cartStore.count,
      total: cartStore.total,
    });
  };

  return (
    <div>
      <button onClick={() => addItem({ id: '1', name: 'Widget', price: 9.99 })}>
        Add to Cart
      </button>
    </div>
  );
}

// ── CartBadge Component (Subscriber) ────────────────────────────────────

import { useState } from 'react';
import { useEvent } from '@pixielity/events';

function CartBadge() {
  const [count, setCount] = useState(0);

  // Listen for cart updates — auto-cleans up on unmount.
  useEvent('cart.updated', (payload) => {
    const { itemCount } = payload as { itemCount: number };
    setCount(itemCount);
  });

  return (
    <span className="cart-badge">
      🛒 {count}
    </span>
  );
}
`;

// ─── Example 4: Wildcard Listeners in Components ────────────────────────────
//
// useEvent() supports wildcard patterns just like listen().
// Useful for logging, analytics, or cross-cutting concerns.
//

/*
|--------------------------------------------------------------------------
| ActivityLogger Component
|--------------------------------------------------------------------------
|
| Listens for ALL user events using a wildcard pattern.
| Logs them to the console (or sends to an analytics service).
|
| Wildcard listeners in useEvent() receive (eventName, payload).
|
*/
const ActivityLoggerExample = `
import { useEvent } from '@pixielity/events';

function ActivityLogger() {
  // Listen for all user events.
  useEvent('user.**', (eventName, payload) => {
    console.log(\`[Activity] \${eventName}\`, payload);

    // Send to analytics service.
    analytics.track(eventName as string, payload);
  });

  // This component renders nothing — it's a "listener-only" component.
  return null;
}
`;

// ─── Example 5: Full App Setup ──────────────────────────────────────────────
//
// Complete example showing module setup + provider + hooks in a React app.
//

/*
|--------------------------------------------------------------------------
| Full App Setup
|--------------------------------------------------------------------------
|
| 1. Create the root module with EventsModule.forRoot()
| 2. Wrap your app with the DI provider
| 3. Use hooks in any component
|
*/
const FullAppSetupExample = `
// ── app.module.ts ───────────────────────────────────────────────────────

import { Module } from '@abdokouta/react-di';
import { EventsModule } from '@pixielity/events';
import { UserSubscriber } from './subscribers/user.subscriber';

@Module({
  imports: [EventsModule.forRoot({ wildcards: true })],
  providers: [UserSubscriber],
})
export class AppModule {}

// ── App.tsx ─────────────────────────────────────────────────────────────

import { ModuleProvider } from '@abdokouta/react-di';
import { AppModule } from './app.module';

function App() {
  return (
    <ModuleProvider module={AppModule}>
      <NotificationBanner />
      <ActivityLogger />
      <CartBadge />
      <MainContent />
    </ModuleProvider>
  );
}

// ── MainContent.tsx ─────────────────────────────────────────────────────

import { useEventDispatcher } from '@pixielity/events';

function MainContent() {
  const events = useEventDispatcher();

  return (
    <div>
      <button onClick={() => events.dispatch('user.action', { type: 'click' })}>
        Do Something
      </button>
    </div>
  );
}
`;

// ─── Print Examples ─────────────────────────────────────────────────────────

function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Events — React Hooks (Patterns)      ║');
  console.log('╚════════════════════════════════════════╝');

  console.log('\n=== Example 1: useEvent() — Listen in a Component ===\n');
  console.log(NotificationBannerExample);

  console.log('\n=== Example 2: useEventDispatcher() — Dispatch ===\n');
  console.log(CreateOrderButtonExample);

  console.log('\n=== Example 3: Component-to-Component Communication ===\n');
  console.log(CartCommunicationExample);

  console.log('\n=== Example 4: Wildcard Listeners in Components ===\n');
  console.log(ActivityLoggerExample);

  console.log('\n=== Example 5: Full App Setup ===\n');
  console.log(FullAppSetupExample);

  console.log('\n✅ All React hook patterns demonstrated!\n');
}

main();
