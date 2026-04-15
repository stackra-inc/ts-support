/**
 * @fileoverview DockCategory interface — a named group of dock actions.
 *
 * Categories organize actions in the expanded menu grid.
 * Each category has an id, label, and optional icon.
 *
 * @module command-dock/interfaces/dock-category
 */

import type { ReactNode } from 'react';

/**
 * A named group of dock actions displayed in the expanded menu.
 *
 * @example
 * ```ts
 * const category: DockCategory = {
 *   id: "cart",
 *   label: "Cart",
 *   icon: <ShoppingCart size={14} />,
 * };
 * ```
 */
export interface DockCategory {
  /** Unique identifier matching `DockAction.category`. */
  id: string;

  /** Human-readable heading displayed above the action group. */
  label: string;

  /** Optional icon rendered beside the category label. */
  icon?: ReactNode;
}
