/**
 * @abdokouta/ts-desktop
 *
 * |--------------------------------------------------------------------------
 * | Electron Desktop Integration
 * |--------------------------------------------------------------------------
 * |
 * | Platform-agnostic desktop integration with DI, decorators, and hooks.
 * |
 * | Module API:
 * |   DesktopModule.forRoot(config)    — register core services
 * |   DesktopModule.forFeature(menus)  — register @Menu classes from modules
 * |   DesktopModule.registerMenu(cls)  — register a single @Menu class
 * |
 * @module @abdokouta/ts-desktop
 */

import "reflect-metadata";

// Module
export { DesktopModule, MENU_REGISTRY } from "./desktop.module";

// Services
export { DesktopManager, MenuRegistry } from "./services";
export type { SerializedMenu, SerializedMenuItem } from "./services";

// Bridge
export { ElectronBridge, BrowserBridge } from "./bridge";

// Decorators
export { Menu, MenuItem, Shortcut, OnIpc } from "./decorators";
export type { ShortcutMetadata, OnIpcMetadata } from "./decorators";

// Hooks
export { useDesktop, useMenuAction } from "./hooks";

// Interfaces
export type {
  DesktopModuleOptions,
  DesktopBridge,
  MenuItemOptions,
  MenuMetadata,
  MenuItemMetadata,
} from "./interfaces";

// Constants
export {
  DESKTOP_CONFIG,
  DESKTOP_MANAGER,
  MENU_METADATA,
  MENU_ITEM_METADATA,
  SHORTCUT_METADATA,
  ON_IPC_METADATA,
} from "./constants";
