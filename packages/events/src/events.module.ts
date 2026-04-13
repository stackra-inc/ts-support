/**
 * Events Module
 *
 * Registers:
 * - `EVENT_CONFIG` — raw config object
 * - `EventManager` — created by DI so @Inject decorators fire
 * - `EVENT_MANAGER` — useExisting alias to EventManager
 *
 * Users inject `EVENT_MANAGER` (or `EventManager` directly) and call
 * `manager.dispatcher()` to get an `EventService`, or use the `useEvents()`
 * hook which does this automatically.
 *
 * Follows the exact same pattern as CacheModule.
 *
 * @module events.module
 */

import { Module, type DynamicModule } from '@abdokouta/ts-container';

import type { EventModuleOptions } from '@/interfaces';
import { EventManager } from '@/services/event-manager.service';
import { EVENT_CONFIG, EVENT_MANAGER } from '@/constants/tokens.constant';

/**
 * EventsModule — provides multi-driver event dispatching with DI integration.
 *
 * Follows the standard manager DI pattern:
 * - `EVENT_CONFIG` — raw config object
 * - `EventManager` — class-based injection
 * - `EVENT_MANAGER` — useExisting alias
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     EventsModule.forRoot({
 *       default: 'memory',
 *       dispatchers: {
 *         memory: { driver: 'memory', wildcards: true },
 *         redis: { driver: 'redis', connection: 'events' },
 *         test: { driver: 'null' },
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern
export class EventsModule {
  static forRoot(config: EventModuleOptions): DynamicModule {
    return {
      module: EventsModule,
      global: true,
      providers: [
        { provide: EVENT_CONFIG, useValue: config },
        { provide: EventManager, useClass: EventManager },
        { provide: EVENT_MANAGER, useExisting: EventManager },
      ],
      exports: [EventManager, EVENT_MANAGER, EVENT_CONFIG],
    };
  }
}
