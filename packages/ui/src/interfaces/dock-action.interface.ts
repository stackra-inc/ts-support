/**
 * @fileoverview DockAction interface — a single action item in the command dock.
 *
 * Represents one actionable button that can appear in the dock bar,
 * quick-action slots, or the expanded action menu.
 *
 * @module command-dock/interfaces/dock-action
 */

import type { ReactNode } from 'react';

/**
 * A single action item in the command dock.
 *
 * Actions are grouped by category and can be marked as primary,
 * disabled, hidden, or dangerous (destructive styling).
 *
 * @example
 * ```ts
 * const action: DockAction = {
 *   id: "checkout",
 *   label: "Pay $42.00",
 *   icon: <CreditCard size={16} />,
 *   category: "payment",
 *   shortcut: "⌘P",
 *   onPress: () => openCheckout(),
 * };
 * ```
 */
export interface DockAction {
  /** Unique identifier for this action. Used as React key and for lookups. */
  id: string;

  /** Human-readable label displayed in the menu and as tooltip. */
  label: string;

  /** Icon rendered beside the label. Typically a Lucide icon at size 16. */
  icon: ReactNode;

  /**
   * Category grouping for the expanded action menu.
   * Actions with the same category are rendered together under a heading.
   */
  category: string;

  /** Callback invoked when the action is triggered. */
  onPress: () => void;

  /**
   * Optional keyboard shortcut hint displayed next to the label.
   * Purely visual — the dock does not register keyboard listeners for this.
   *
   * @example "⌘K", "⌘P"
   */
  shortcut?: string;

  /**
   * When `true`, the action is the primary CTA displayed prominently
   * in the center of the dock bar. Only one action should be primary.
   *
   * @default false
   */
  primary?: boolean;

  /**
   * When `true`, the action button is rendered but non-interactive.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * When `true`, the action is excluded from rendering entirely.
   * Useful for conditionally removing actions without filtering arrays.
   *
   * @default false
   */
  hidden?: boolean;

  /**
   * When `true`, the action label and icon use danger/destructive styling.
   *
   * @default false
   */
  danger?: boolean;
}
