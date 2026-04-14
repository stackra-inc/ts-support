/**
 * Desktop Module
 *
 * |--------------------------------------------------------------------------
 * | DI Module for @abdokouta/ts-desktop
 * |--------------------------------------------------------------------------
 * |
 * | forRoot(config)         — registers DesktopManager, MenuRegistry, bridge
 * | forFeature(menus)       — registers @Menu classes from feature modules
 * | registerMenu(menuClass) — register a single @Menu class
 * |
 * | Menu classes decorated with @Menu() are collected by the MenuRegistry.
 * | Each module can contribute its own menu items via forFeature().
 * |
 * @example
 * ```typescript
 * // Root module
 * @Module({
 *   imports: [
 *     DesktopModule.forRoot({ appName: 'My POS' }),
 *     DesktopModule.forFeature([FileMenu, EditMenu]),
 *   ],
 * })
 * export class AppModule {}
 *
 * // Feature module
 * @Module({
 *   imports: [
 *     DesktopModule.forFeature([ToolsMenu]),
 *   ],
 * })
 * export class ToolsModule {}
 * ```
 */

import { Module, type DynamicModule } from "@abdokouta/ts-container";

import type { DesktopModuleOptions } from "./interfaces";
import { DesktopManager } from "./services/desktop-manager.service";
import { MenuRegistry } from "./services/menu-registry.service";
import { DESKTOP_CONFIG, DESKTOP_MANAGER } from "./constants";

/** Token for the global MenuRegistry. */
export const MENU_REGISTRY = Symbol.for("MENU_REGISTRY");

/** Global singleton MenuRegistry — shared across forRoot and forFeature. */
const globalMenuRegistry = new MenuRegistry();

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern
export class DesktopModule {
  /*
  |--------------------------------------------------------------------------
  | forRoot
  |--------------------------------------------------------------------------
  |
  | Registers the core desktop services:
  |   - DESKTOP_CONFIG — raw config
  |   - DesktopManager — platform detection + bridge
  |   - DESKTOP_MANAGER — useExisting alias
  |   - MenuRegistry — collects @Menu classes
  |   - MENU_REGISTRY — useValue alias
  |
  */
  static forRoot(config: DesktopModuleOptions): DynamicModule {
    return {
      module: DesktopModule,
      global: true,
      providers: [
        { provide: DESKTOP_CONFIG, useValue: config },
        { provide: DesktopManager, useClass: DesktopManager },
        { provide: DESKTOP_MANAGER, useExisting: DesktopManager },
        { provide: MenuRegistry, useValue: globalMenuRegistry },
        { provide: MENU_REGISTRY, useValue: globalMenuRegistry },
      ],
      exports: [DesktopManager, DESKTOP_MANAGER, MenuRegistry, MENU_REGISTRY, DESKTOP_CONFIG],
    };
  }

  /*
  |--------------------------------------------------------------------------
  | forFeature
  |--------------------------------------------------------------------------
  |
  | Register @Menu decorated classes from a feature module.
  | Each class is instantiated and its @Menu/@MenuItem metadata
  | is collected into the global MenuRegistry.
  |
  | Call this in any module that defines menu items.
  |
  */
  static forFeature(menuClasses: Array<new (...args: any[]) => any>): DynamicModule {
    for (const MenuClass of menuClasses) {
      const instance = new MenuClass();
      globalMenuRegistry.register(instance);
    }
    return { module: DesktopModule, providers: [], exports: [] };
  }

  /*
  |--------------------------------------------------------------------------
  | registerMenu
  |--------------------------------------------------------------------------
  |
  | Register a single @Menu class. Convenience method for inline use.
  |
  | @example
  | ```typescript
  | DesktopModule.registerMenu(FileMenu);
  | ```
  |
  */
  static registerMenu(menuClass: new (...args: any[]) => any): void {
    const instance = new menuClass();
    globalMenuRegistry.register(instance);
  }
}
