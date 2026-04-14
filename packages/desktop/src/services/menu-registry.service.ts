/**
 * Menu Registry
 *
 * |--------------------------------------------------------------------------
 * | Collects @Menu / @MenuItem decorated classes and builds the menu template.
 * |--------------------------------------------------------------------------
 * |
 * | Each module can define its own menu items via decorated classes.
 * | The MenuRegistry collects them all and builds a unified menu template
 * | that gets sent to the Electron main process via IPC.
 * |
 * | Flow:
 * |   1. Modules define @Menu classes with @MenuItem methods
 * |   2. MenuRegistry.register(instance) collects the metadata
 * |   3. MenuRegistry.buildTemplate() produces the full menu structure
 * |   4. DesktopManager sends it to main process via bridge.send('menu:update')
 * |   5. Main process calls Menu.buildFromTemplate(template)
 * |
 * @module @abdokouta/ts-desktop
 */

import "reflect-metadata";
import { Injectable } from "@abdokouta/ts-container";

import { MENU_METADATA, MENU_ITEM_METADATA } from "@/constants";
import type { MenuMetadata, MenuItemMetadata } from "@/interfaces";

/** A serialisable menu item for IPC transport to the main process. */
export interface SerializedMenuItem {
  label?: string;
  accelerator?: string;
  type?: "normal" | "separator" | "submenu" | "checkbox" | "radio";
  role?: string;
  enabled?: boolean;
  visible?: boolean;
  /** IPC channel to send when clicked. */
  ipcChannel?: string;
}

/** A serialisable menu section for IPC transport. */
export interface SerializedMenu {
  id: string;
  label: string;
  order: number;
  items: SerializedMenuItem[];
}

@Injectable()
export class MenuRegistry {
  /** Collected menu sections, keyed by menu id. */
  private readonly menus = new Map<string, SerializedMenu>();

  /** Registered handler callbacks, keyed by IPC channel. */
  private readonly handlers = new Map<string, () => void>();

  /**
   * Register a @Menu decorated class instance.
   *
   * Reads @Menu metadata from the class and @MenuItem metadata
   * from its methods. Merges items into the menu section.
   */
  register(instance: object): void {
    const constructor = instance.constructor;

    // Read @Menu metadata.
    const menuMeta: MenuMetadata | undefined = Reflect.getMetadata(MENU_METADATA, constructor);
    if (!menuMeta) return;

    // Read @MenuItem metadata from methods.
    const itemsMeta: MenuItemMetadata[] =
      Reflect.getMetadata(MENU_ITEM_METADATA, constructor) ?? [];

    // Get or create the menu section.
    let menu = this.menus.get(menuMeta.id);
    if (!menu) {
      menu = {
        id: menuMeta.id,
        label: menuMeta.label,
        order: menuMeta.order ?? 50,
        items: [],
      };
      this.menus.set(menuMeta.id, menu);
    }

    // Add items from this class.
    for (const itemMeta of itemsMeta) {
      const ipcChannel = `menu:${menuMeta.id}:${itemMeta.method}`;

      const serialized: SerializedMenuItem = {
        label: itemMeta.options.label,
        accelerator: itemMeta.options.accelerator,
        type: itemMeta.options.type ?? "normal",
        role: itemMeta.options.role,
        enabled: itemMeta.options.enabled ?? true,
        visible: itemMeta.options.visible ?? true,
        ipcChannel: itemMeta.options.type === "separator" ? undefined : ipcChannel,
      };

      menu.items.push(serialized);

      // Register the handler callback.
      if (serialized.ipcChannel) {
        const handler = (instance as Record<string, Function>)[itemMeta.method];
        if (typeof handler === "function") {
          this.handlers.set(ipcChannel, handler.bind(instance));
        }
      }
    }
  }

  /**
   * Build the full menu template sorted by order.
   *
   * Returns an array of serialised menu sections ready for IPC
   * transport to the Electron main process.
   */
  buildTemplate(): SerializedMenu[] {
    return Array.from(this.menus.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Get a handler callback by IPC channel.
   */
  getHandler(channel: string): (() => void) | undefined {
    return this.handlers.get(channel);
  }

  /**
   * Get all registered IPC channels.
   */
  getChannels(): string[] {
    return Array.from(this.handlers.keys());
  }

  /** Number of registered menu sections. */
  get size(): number {
    return this.menus.size;
  }
}
