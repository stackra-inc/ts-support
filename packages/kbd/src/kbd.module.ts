/**
 * KBD Module
 *
 * |--------------------------------------------------------------------------
 * | DI Module for @abdokouta/kbd
 * |--------------------------------------------------------------------------
 * |
 * | Registers:
 * |   - `KBD_CONFIG`          — raw config object
 * |   - `ShortcutRegistry`    — the global singleton registry
 * |   - `SHORTCUT_REGISTRY`   — useValue alias to the same singleton
 * |
 * | Users inject `ShortcutRegistry` (or use the `shortcutRegistry` export
 * | for non-DI usage) and call register/unregister/query directly.
 * |
 * | Follows the exact same pattern as CacheModule, EventsModule, etc.
 * |
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     KbdModule.forRoot({ registerBuiltIn: true }),
 *     KbdModule.forFeature([
 *       { id: 'pos:scan', name: 'Scan Barcode', keys: ['F2'], ... },
 *     ]),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @module @abdokouta/kbd
 */

import { Module, type DynamicModule } from '@abdokouta/ts-container';

import type { KeyboardShortcut, ShortcutGroup } from '@/interfaces';
import { shortcutRegistry, ShortcutRegistry } from '@/registries/shortcut.registry';
import { BUILT_IN_SHORTCUTS, BUILT_IN_GROUPS } from '@/shortcuts/built-in-shortcuts';
import { KBD_CONFIG, SHORTCUT_REGISTRY } from '@/constants';

/*
|--------------------------------------------------------------------------
| KbdModuleOptions
|--------------------------------------------------------------------------
*/

/** Configuration for KbdModule.forRoot(). */
export interface KbdModuleOptions {
  /** Initial shortcuts to register. */
  shortcuts?: KeyboardShortcut[];

  /** Initial groups to register. */
  groups?: ShortcutGroup[];

  /** Whether to register built-in shortcuts. @default true */
  registerBuiltIn?: boolean;

  /** Whether to enable debug logging. @default false */
  debug?: boolean;
}

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern
export class KbdModule {
  /*
  |--------------------------------------------------------------------------
  | forRoot
  |--------------------------------------------------------------------------
  |
  | Registers the ShortcutRegistry as a global DI singleton.
  |
  | Applies options:
  |   - registerBuiltIn: registers navigation, search, editing shortcuts
  |   - shortcuts: registers additional shortcuts from config
  |   - groups: registers shortcut groups from config
  |
  | The global `shortcutRegistry` singleton is the same instance
  | registered in DI — backward compatibility is preserved.
  |
  */
  static forRoot(config?: KbdModuleOptions): DynamicModule {
    const options: KbdModuleOptions = {
      registerBuiltIn: true,
      debug: false,
      ...config,
    };

    /*
    |--------------------------------------------------------------------------
    | Register built-in shortcuts and groups.
    |--------------------------------------------------------------------------
    */
    if (options.registerBuiltIn !== false) {
      for (const shortcut of BUILT_IN_SHORTCUTS) {
        shortcutRegistry.register(shortcut, { onConflict: 'skip' });
      }
      for (const group of BUILT_IN_GROUPS) {
        shortcutRegistry.registerGroup(group);
      }

      if (options.debug) {
        console.log(`[KbdModule] Registered ${BUILT_IN_SHORTCUTS.length} built-in shortcuts`);
        console.log(`[KbdModule] Registered ${BUILT_IN_GROUPS.length} built-in groups`);
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Register shortcuts from config.
    |--------------------------------------------------------------------------
    */
    if (options.shortcuts) {
      for (const shortcut of options.shortcuts) {
        shortcutRegistry.register(shortcut, { onConflict: 'skip' });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Register groups from config.
    |--------------------------------------------------------------------------
    */
    if (options.groups) {
      for (const group of options.groups) {
        shortcutRegistry.registerGroup(group);
      }
    }

    if (options.debug) {
      console.log('[KbdModule] Initialized. Total shortcuts:', shortcutRegistry.getAll().length);
    }

    return {
      module: KbdModule,
      global: true,
      providers: [
        { provide: KBD_CONFIG, useValue: options },
        { provide: ShortcutRegistry, useValue: shortcutRegistry },
        { provide: SHORTCUT_REGISTRY, useValue: shortcutRegistry },
      ],
      exports: [ShortcutRegistry, SHORTCUT_REGISTRY, KBD_CONFIG],
    };
  }

  /*
  |--------------------------------------------------------------------------
  | forFeature
  |--------------------------------------------------------------------------
  |
  | Register additional shortcuts from a feature module.
  | Shortcuts are added to the global ShortcutRegistry singleton.
  |
  */
  static forFeature(shortcuts: KeyboardShortcut[]): DynamicModule {
    for (const shortcut of shortcuts) {
      shortcutRegistry.register(shortcut, { onConflict: 'skip' });
    }

    return { module: KbdModule, providers: [], exports: [] };
  }
}
