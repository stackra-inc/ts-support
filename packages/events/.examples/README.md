# Events Examples

This folder contains examples demonstrating how to use `@pixielity/events` in
various scenarios.

## Examples Overview

### 1. Basic Usage (`01-basic-usage.ts`)

Learn the fundamental event dispatcher operations:

- ✅ Dispatching events with payloads
- ✅ Registering listeners with `listen()`
- ✅ One-time listeners with `once()`
- ✅ Listener return values
- ✅ Stop propagation (return `false`)
- ✅ `until()` — halt on first response
- ✅ `forget()` and `hasListeners()`
- ✅ Object events (class instance as event)

**Run:**

```bash
npx ts-node .examples/01-basic-usage.ts
```

### 2. Wildcards & Priority (`02-wildcards-and-priority.ts`)

Master wildcard matching and priority ordering:

- ✅ Single-segment wildcard (`*`) — matches one segment
- ✅ Multi-segment wildcard (`**`) — matches one or more segments
- ✅ Prefix wildcards (`*.created`)
- ✅ Catch-all wildcard (`**`)
- ✅ Priority-based listener ordering (CRITICAL → HIGH → NORMAL → LOW)
- ✅ Custom numeric priorities
- ✅ Wildcards + priority combined

**Run:**

```bash
npx ts-node .examples/02-wildcards-and-priority.ts
```

### 3. Subscribers & Decorators (`03-subscribers-and-decorators.ts`)

Use the decorator-based subscriber pattern:

- ✅ `@Subscriber()` class decorator
- ✅ `@OnEvent()` method decorator
- ✅ `@Channel()` class decorator for grouping
- ✅ Priority and `once` options on `@OnEvent`
- ✅ Multiple subscribers for the same event
- ✅ Module auto-discovery pattern
- ✅ Feature module subscribers

**Run:**

```bash
npx ts-node .examples/03-subscribers-and-decorators.ts
```

### 4. React Hooks (`04-react-hooks.ts`)

Integrate events with React components:

- ✅ `useEvent()` — listen with auto-cleanup on unmount
- ✅ `useEventDispatcher()` — get the EventService instance
- ✅ Component-to-component communication
- ✅ Wildcard listeners in components
- ✅ Full app setup with module + provider

**View patterns:**

```bash
npx ts-node .examples/04-react-hooks.ts
```

### 5. Dispatchers & Redis (`05-dispatchers-and-redis.ts`)

Multiple dispatcher drivers and Redis integration:

- ✅ `MemoryDispatcher` — in-memory (default)
- ✅ `RedisDispatcher` — cross-process via Redis
- ✅ `NullDispatcher` — no-op for testing
- ✅ `EventService` as the manager (resolves dispatchers by name)
- ✅ Switching dispatchers at runtime
- ✅ Module configuration with multiple dispatchers
- ✅ Driver comparison table

**Run:**

```bash
npx ts-node .examples/05-dispatchers-and-redis.ts
```

## Quick Start

### Installation

```bash
pnpm add @pixielity/events rxjs reflect-metadata

# For Redis dispatcher (optional):
pnpm add @abdokouta/react-redis
```

### Module Setup

```typescript
import { Module } from '@abdokouta/react-di';
import { EventsModule } from '@pixielity/events';
import { UserSubscriber } from './subscribers/user.subscriber';

@Module({
  imports: [EventsModule.forRoot()],
  providers: [UserSubscriber], // Auto-discovered
})
export class AppModule {}
```

### With Redis Dispatcher

```typescript
import { RedisModule } from '@abdokouta/react-redis';
import { EventsModule } from '@pixielity/events';

@Module({
  imports: [
    RedisModule.forRoot({
      default: 'events',
      connections: {
        events: { url: UPSTASH_URL, token: UPSTASH_TOKEN },
      },
    }),
    EventsModule.forRoot({
      default: 'redis',
      dispatchers: {
        memory: { driver: 'memory' },
        redis: { driver: 'redis', connection: 'events' },
      },
    }),
  ],
})
export class AppModule {}
```

### Dispatch Events

```typescript
import { Injectable, Inject } from '@abdokouta/react-di';
import { EventService } from '@pixielity/events';

@Injectable()
class OrderService {
  constructor(@Inject(EventService) private events: EventService) {}

  async createOrder(data: OrderData) {
    const order = await this.db.create(data);
    this.events.dispatch('order.created', { orderId: order.id });
    return order;
  }
}
```

### Create a Subscriber

```typescript
import { Injectable } from '@abdokouta/react-di';
import { Subscriber, OnEvent, EventPriority } from '@pixielity/events';

@Subscriber()
@Injectable()
class OrderSubscriber {
  @OnEvent('order.created')
  sendConfirmation(payload: { orderId: string }) {
    // Send confirmation email...
  }

  @OnEvent('order.created', { priority: EventPriority.LOW })
  trackAnalytics(payload: { orderId: string }) {
    // Track in analytics...
  }
}
```

### React Components

```tsx
import { useEvent, useEventDispatcher } from '@pixielity/events';

function OrderNotification() {
  useEvent('order.created', (payload) => {
    showToast(`Order ${payload.orderId} created!`);
  });
  return null;
}
```

## API Reference

### EventService (Manager)

| Method                               | Description                              |
| ------------------------------------ | ---------------------------------------- |
| `dispatcher(name?)`                  | Get a named dispatcher instance          |
| `listen(event, callback, priority?)` | Register a listener (default dispatcher) |
| `once(event, callback, priority?)`   | Register a one-time listener             |
| `dispatch(event, payload?, halt?)`   | Fire an event                            |
| `until(event, payload?)`             | Fire until first non-null response       |
| `subscribe(subscriber)`              | Register an event subscriber             |
| `hasListeners(event)`                | Check if listeners exist                 |
| `getListeners(event)`                | Get all listeners for an event           |
| `forget(event)`                      | Remove all listeners for an event        |
| `forgetAll()`                        | Remove all listeners                     |
| `asObservable()`                     | Get RxJS Observable of all events        |
| `destroyAll()`                       | Destroy all dispatchers                  |

### Dispatchers

| Driver   | Class              | Description             |
| -------- | ------------------ | ----------------------- |
| `memory` | `MemoryDispatcher` | In-memory (default)     |
| `redis`  | `RedisDispatcher`  | Cross-process via Redis |
| `null`   | `NullDispatcher`   | No-op for testing       |

### Decorator Reference

| Decorator                   | Target | Description                           |
| --------------------------- | ------ | ------------------------------------- |
| `@Subscriber()`             | Class  | Marks a class as an event subscriber  |
| `@OnEvent(event, options?)` | Method | Marks a method as an event listener   |
| `@Channel(name)`            | Class  | Assigns subscriber to a named channel |

### Priority Levels

| Level      | Value | Use Case                       |
| ---------- | ----- | ------------------------------ |
| `CRITICAL` | 200   | Security checks, rate limiting |
| `HIGH`     | 100   | Validation, enrichment         |
| `NORMAL`   | 0     | Default — most listeners       |
| `LOW`      | -100  | Cleanup, logging, analytics    |
