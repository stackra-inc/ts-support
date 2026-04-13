/**
 * Wildcards & Priority Example
 *
 * |--------------------------------------------------------------------------
 * | @pixielity/events — Wildcards & Priority
 * |--------------------------------------------------------------------------
 * |
 * | This example demonstrates advanced event matching:
 * | - Single-segment wildcards (*)
 * | - Multi-segment wildcards (**)
 * | - Priority-based listener ordering
 * | - Combining wildcards with priority
 * |
 * | Wildcard matching mirrors Laravel's event wildcard support.
 * | Priority mirrors Laravel's listener priority (higher = earlier).
 * |
 * | @example
 * | Run this example:
 * | ```bash
 * | npx ts-node .examples/02-wildcards-and-priority.ts
 * | ```
 * |
 */

import { MemoryDispatcher, EventPriority } from '@pixielity/events';
import type { EventDispatcherInterface } from '@pixielity/events';

// ─── Example 1: Single-Segment Wildcard (*) ────────────────────────────────
//
// The `*` wildcard matches exactly ONE segment between dots.
// 'user.*' matches 'user.created', 'user.deleted', but NOT 'user.profile.updated'.
//

function singleSegmentWildcard(events: EventDispatcherInterface) {
  console.log('\n=== Example 1: Single-Segment Wildcard (*) ===\n');

  /*
  |--------------------------------------------------------------------------
  | Register a wildcard listener for 'user.*'.
  |--------------------------------------------------------------------------
  |
  | The `*` matches exactly one segment:
  |   ✓ user.created     → matches (one segment after 'user.')
  |   ✓ user.deleted     → matches
  |   ✗ user.profile.updated → does NOT match (two segments)
  |
  | Wildcard listeners receive (eventName, payload) — two arguments.
  | This differs from exact listeners which receive (payload) — one argument.
  |
  */
  const unsub = events.listen('user.*', (eventName, payload) => {
    console.log(`  ✓ Wildcard 'user.*' caught: ${eventName}`, payload);
  });

  // These match 'user.*':
  events.dispatch('user.created', { userId: '1' });
  events.dispatch('user.deleted', { userId: '2' });

  // This does NOT match 'user.*' (two segments after 'user.'):
  events.dispatch('user.profile.updated', { userId: '3' });
  console.log("  ✓ 'user.profile.updated' was NOT caught by 'user.*'");

  unsub();
}

// ─── Example 2: Multi-Segment Wildcard (**) ─────────────────────────────────
//
// The `**` wildcard matches ONE OR MORE segments.
// 'user.**' matches 'user.created', 'user.profile.updated', etc.
//

function multiSegmentWildcard(events: EventDispatcherInterface) {
  console.log('\n=== Example 2: Multi-Segment Wildcard (**) ===\n');

  /*
  |--------------------------------------------------------------------------
  | Register a wildcard listener for 'user.**'.
  |--------------------------------------------------------------------------
  |
  | The `**` matches one or more segments:
  |   ✓ user.created              → matches
  |   ✓ user.profile.updated      → matches
  |   ✓ user.settings.theme.changed → matches
  |
  */
  const unsub = events.listen('user.**', (eventName, payload) => {
    console.log(`  ✓ Wildcard 'user.**' caught: ${eventName}`, payload);
  });

  events.dispatch('user.created', { userId: '1' });
  events.dispatch('user.profile.updated', { userId: '2', field: 'avatar' });
  events.dispatch('user.settings.theme.changed', { userId: '3', theme: 'dark' });

  unsub();
}

// ─── Example 3: Prefix Wildcard ─────────────────────────────────────────────
//
// Wildcards can appear at any position in the pattern.
// '*.created' matches 'user.created', 'order.created', etc.
//

function prefixWildcard(events: EventDispatcherInterface) {
  console.log('\n=== Example 3: Prefix Wildcard (*.created) ===\n');

  /*
  |--------------------------------------------------------------------------
  | Register a wildcard listener for '*.created'.
  |--------------------------------------------------------------------------
  |
  | Matches any single-segment prefix followed by '.created':
  |   ✓ user.created   → matches
  |   ✓ order.created  → matches
  |   ✗ user.profile.created → does NOT match (two segments before '.created')
  |
  */
  const unsub = events.listen('*.created', (eventName, payload) => {
    console.log(`  ✓ Wildcard '*.created' caught: ${eventName}`, payload);
  });

  events.dispatch('user.created', { type: 'user' });
  events.dispatch('order.created', { type: 'order' });
  events.dispatch('product.created', { type: 'product' });

  unsub();
}

// ─── Example 4: Catch-All Wildcard ──────────────────────────────────────────
//
// The pattern '*' or '**' matches ALL events.
// Useful for logging, analytics, or debugging.
//

function catchAllWildcard(events: EventDispatcherInterface) {
  console.log('\n=== Example 4: Catch-All Wildcard (**) ===\n');

  /*
  |--------------------------------------------------------------------------
  | Register a catch-all listener.
  |--------------------------------------------------------------------------
  |
  | '**' matches every event dispatched through the system.
  | Use this for cross-cutting concerns like logging or analytics.
  |
  | ⚠️ Be careful with catch-all listeners in production — they fire
  | on every single event and can impact performance.
  |
  */
  const log: string[] = [];

  const unsub = events.listen('**', (eventName) => {
    log.push(eventName as string);
  });

  events.dispatch('user.created', {});
  events.dispatch('order.placed', {});
  events.dispatch('payment.processed', {});

  console.log('  ✓ Catch-all captured:', log);

  unsub();
}

// ─── Example 5: Priority-Based Ordering ─────────────────────────────────────
//
// Listeners can have a priority. Higher priority = earlier execution.
// Default priority is EventPriority.NORMAL (0).
//

function priorityOrdering(events: EventDispatcherInterface) {
  console.log('\n=== Example 5: Priority-Based Ordering ===\n');

  /*
  |--------------------------------------------------------------------------
  | Register listeners with different priorities.
  |--------------------------------------------------------------------------
  |
  | Priority values (from EventPriority enum):
  |   CRITICAL = 200  → executes first (security checks, rate limiting)
  |   HIGH     = 100  → executes second (validation, enrichment)
  |   NORMAL   = 0    → default (most listeners)
  |   LOW      = -100 → executes last (cleanup, logging, analytics)
  |
  | Listeners with the same priority execute in registration order.
  |
  */
  const order: string[] = [];

  const unsub1 = events.listen(
    'order.process',
    () => {
      order.push('3-normal');
    },
    EventPriority.NORMAL
  );

  const unsub2 = events.listen(
    'order.process',
    () => {
      order.push('1-critical');
    },
    EventPriority.CRITICAL
  );

  const unsub3 = events.listen(
    'order.process',
    () => {
      order.push('4-low');
    },
    EventPriority.LOW
  );

  const unsub4 = events.listen(
    'order.process',
    () => {
      order.push('2-high');
    },
    EventPriority.HIGH
  );

  events.dispatch('order.process', {});

  console.log('  ✓ Execution order:', order);
  console.log('  ✓ Expected: critical → high → normal → low');

  unsub1();
  unsub2();
  unsub3();
  unsub4();
}

// ─── Example 6: Custom Numeric Priority ─────────────────────────────────────
//
// You can use any number as a priority, not just the enum values.
// Higher numbers execute first.
//

function customPriority(events: EventDispatcherInterface) {
  console.log('\n=== Example 6: Custom Numeric Priority ===\n');

  /*
  |--------------------------------------------------------------------------
  | Use custom numeric priorities for fine-grained ordering.
  |--------------------------------------------------------------------------
  |
  | Any number works — the enum values are just convenient presets.
  | Higher numbers execute first. Negative numbers execute after 0.
  |
  */
  const order: string[] = [];

  const unsub1 = events.listen(
    'custom.event',
    () => {
      order.push('priority-50');
    },
    50
  );
  const unsub2 = events.listen(
    'custom.event',
    () => {
      order.push('priority-150');
    },
    150
  );
  const unsub3 = events.listen(
    'custom.event',
    () => {
      order.push('priority-75');
    },
    75
  );
  const unsub4 = events.listen(
    'custom.event',
    () => {
      order.push('priority--50');
    },
    -50
  );

  events.dispatch('custom.event', {});

  console.log('  ✓ Execution order:', order);
  console.log('  ✓ Expected: 150 → 75 → 50 → -50');

  unsub1();
  unsub2();
  unsub3();
  unsub4();
}

// ─── Example 7: Wildcards + Priority Combined ───────────────────────────────
//
// Wildcard listeners and exact listeners are merged and sorted by priority.
// A high-priority wildcard listener executes before a low-priority exact one.
//

function wildcardsWithPriority(events: EventDispatcherInterface) {
  console.log('\n=== Example 7: Wildcards + Priority Combined ===\n');

  /*
  |--------------------------------------------------------------------------
  | Wildcard and exact listeners are merged by priority.
  |--------------------------------------------------------------------------
  |
  | When 'user.created' is dispatched, the dispatcher collects:
  |   - Exact listeners for 'user.created'
  |   - Wildcard listeners matching 'user.created' (e.g. 'user.*')
  |
  | All collected listeners are sorted by priority (descending).
  | A CRITICAL wildcard listener runs before a NORMAL exact listener.
  |
  */
  const order: string[] = [];

  const unsub1 = events.listen(
    'user.created',
    () => {
      order.push('exact-normal');
    },
    EventPriority.NORMAL
  );

  const unsub2 = events.listen(
    'user.*',
    () => {
      order.push('wildcard-critical');
    },
    EventPriority.CRITICAL
  );

  const unsub3 = events.listen(
    'user.created',
    () => {
      order.push('exact-high');
    },
    EventPriority.HIGH
  );

  events.dispatch('user.created', {});

  console.log('  ✓ Execution order:', order);
  console.log('  ✓ Expected: wildcard-critical → exact-high → exact-normal');

  unsub1();
  unsub2();
  unsub3();
}

// ─── Run All Examples ───────────────────────────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Events — Wildcards & Priority        ║');
  console.log('╚════════════════════════════════════════╝');

  const events = new MemoryDispatcher();

  singleSegmentWildcard(events);
  multiSegmentWildcard(events);
  prefixWildcard(events);
  catchAllWildcard(events);
  priorityOrdering(events);
  customPriority(events);
  wildcardsWithPriority(events);

  console.log('\n✅ All examples completed successfully!\n');
}

main().catch(console.error);
