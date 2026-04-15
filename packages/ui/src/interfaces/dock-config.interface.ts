/**
 * @fileoverview DockConfig interface — configuration for the command dock.
 *
 * Controls the dock's behavior, positioning, and visual appearance.
 * Passed to the `CommandDockProvider` to configure the dock system.
 *
 * @module command-dock/interfaces/dock-config
 */

import type { DockAction } from './dock-action.interface';
import type { DockCategory } from './dock-category.interface';
import type { DockZone } from '@/types';

/**
 * Configuration for the command dock system.
 *
 * @example
 * ```tsx
 * <CommandDockProvider config={{
 *   actions: myActions,
 *   categories: myCategories,
 *   zone: "catalog",
 *   quickActionIds: ["search", "promo", "customer", "hold"],
 *   hideOnDrawerOpen: true,
 * }}>
 *   <CommandDock />
 * </CommandDockProvider>
 * ```
 */
export interface DockConfig {
  /**
   * All available actions for the dock.
   * Actions are filtered by `hidden` and grouped by `category`.
   */
  actions: DockAction[];

  /**
   * Category definitions for the expanded action menu.
   * Determines the order and headings of action groups.
   */
  categories: DockCategory[];

  /**
   * Active UI zone controlling dock visibility and positioning.
   * - `"default"`: bottom center of the viewport.
   * - `"cart"`: bottom center of the cart panel (requires `anchorRect`).
   * - `"hidden"`: dock is not rendered.
   *
   * @default "default"
   */
  zone?: DockZone;

  /**
   * Bounding rect of the anchor element (e.g. cart panel) for zone-aware positioning.
   * When `zone` is `"cart"`, the dock centers itself at the bottom of this rect.
   */
  anchorRect?: DOMRect | null;

  /**
   * IDs of actions to show as quick-access icon buttons in the dock bar.
   * These appear on hover/expand flanking the primary CTA.
   * Maximum 4 on each side is recommended.
   *
   * @default []
   */
  quickActionIds?: string[];

  /**
   * When `true`, the dock fades out and becomes non-interactive
   * while a drawer is open (detected via `[data-drawer-backdrop]`).
   *
   * @default true
   */
  hideOnDrawerOpen?: boolean;

  /**
   * Bottom offset in pixels from the viewport edge.
   *
   * @default 24
   */
  bottomOffset?: number;

  /**
   * When `true`, the dock bar shows a subtle expand indicator
   * even in collapsed state to hint at hover interaction.
   *
   * @default false
   */
  showExpandHint?: boolean;
}
