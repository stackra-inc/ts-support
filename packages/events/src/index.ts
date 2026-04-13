/**
 * @pixielity/events
 *
 * Laravel-style event dispatcher for TypeScript.
 * Multiple drivers (memory, redis, null), wildcard matching, priority,
 * decorators, subscribers, and RxJS streaming.
 *
 * Follows the same architecture as @abdokouta/react-cache:
 *   EventManager  → manages named dispatchers (like CacheManager → stores)
 *   EventService  → wraps a Dispatcher with high-level API (like CacheService)
 *   Dispatcher    → low-level contract (like Store)
 *
 * @module @pixielity/events
 */

import 'reflect-metadata';

// ============================================================================
// Module (DI Configuration)
// ============================================================================
export { EventsModule } from './events.module';

// ============================================================================
// Core Services
// ============================================================================
export { EventManager } from './services/event-manager.service';
export { EventService } from './services/event.service';

// ============================================================================
// Dispatchers
// ============================================================================
export { MemoryDispatcher } from './dispatchers/memory.dispatcher';
export { RedisDispatcher } from './dispatchers/redis.dispatcher';
export { NullDispatcher } from './dispatchers/null.dispatcher';

// ============================================================================
// Enums
// ============================================================================
export { EventPriority } from './enums';

// ============================================================================
// Decorators
// ============================================================================
export { OnEvent, Subscriber, Channel, getChannel } from './decorators';
export { CHANNEL_METADATA } from './decorators/channel.decorator';

// ============================================================================
// React Hooks
// ============================================================================
export { useEvents, useEvent } from './hooks';

// ============================================================================
// Utilities
// ============================================================================
export { isWildcard, matchesWildcard, clearWildcardCache } from './utils';
export { defineConfig } from './utils';

// ============================================================================
// Types
// ============================================================================
export type { EventDriver, DispatcherConfig, OnEventOptions, OnEventMetadata } from './types';

// ============================================================================
// Interfaces
// ============================================================================
export type {
  Dispatcher,
  EventListener,
  EventSubscriber,
  EventModuleOptions,
  MemoryDispatcherConfig,
  RedisDispatcherConfig,
  NullDispatcherConfig,
} from './interfaces';

// ============================================================================
// Constants (DI Tokens)
// ============================================================================
export {
  EVENT_CONFIG,
  EVENT_MANAGER,
  ON_EVENT_METADATA,
  EVENT_SUBSCRIBER_METADATA,
} from './constants';
