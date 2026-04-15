/**
 * @fileoverview DockContextValue interface — shape of the command dock context.
 *
 * Defines the value exposed by `CommandDockProvider` and consumed
 * via the `useCommandDock` hook.
 *
 * @module command-dock/interfaces/dock-context-value
 */

import type { DockAction } from './dock-action.interface';
import type { DockCategory } from './dock-category.interface';
import type { DockZone } from '@/types';

/**
 * Context value exposed by the `CommandDockProvider`.
 *
 * Contains the resolved action list, categories, zone state,
 * and imperative methods for controlling the dock.
 */
export interface DockContextValue {
  /** Visible (non-hidden) actions sorted by category. */
  actions: DockAction[];

  /** Category definitions for the expanded menu. */
  categories: DockCategory[];

  /** The primary action (first action with `primary: true`), or `undefined`. */
  primaryAction: DockAction | undefined;

  /** Quick-access actions shown in the dock bar on hover. */
  quickActions: DockAction[];

  /** Current UI zone controlling dock visibility and position. */
  zone: DockZone;

  /** Anchor rect for zone-aware positioning (e.g. cart panel bounds). */
  anchorRect: DOMRect | null;

  /** Whether the dock bar is currently expanded (hovered or menu open). */
  isExpanded: boolean;

  /** Whether the expanded action menu is open. */
  isMenuOpen: boolean;

  /** Whether a drawer is currently open (dock should fade). */
  isDrawerOpen: boolean;

  /** Bottom offset in pixels. */
  bottomOffset: number;

  /** Toggle the expanded action menu. */
  toggleMenu: () => void;

  /** Close the expanded action menu. */
  closeMenu: () => void;

  /** Set the hover/expanded state of the dock bar. */
  setExpanded: (expanded: boolean) => void;

  /**
   * Imperatively update the zone at runtime.
   * Useful when the active UI area changes (e.g. navigating to cart).
   */
  setZone: (zone: DockZone) => void;

  /**
   * Imperatively update the anchor rect at runtime.
   * Call this when the cart panel resizes or repositions.
   */
  setAnchorRect: (rect: DOMRect | null) => void;

  /**
   * Replace the entire action list at runtime.
   * Useful for context-dependent action sets.
   */
  setActions: (actions: DockAction[]) => void;
}
