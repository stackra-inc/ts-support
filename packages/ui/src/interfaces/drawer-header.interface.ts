/**
 * @fileoverview DrawerHeader interfaces — props for the drawer header component.
 *
 * @module drawer-stack/interfaces/drawer-header
 */

import type { ReactNode } from 'react';

/**
 * Visual variant for the drawer header.
 *
 * - `"default"` — Standard header with title, subtitle, and border.
 * - `"hero"` — Floating buttons over a hero image (no background).
 * - `"compact"` — Smaller padding, single-line with inline pills.
 */
export type DrawerHeaderVariant = 'default' | 'hero' | 'compact';

/**
 * A metadata pill displayed inline next to the title on desktop.
 *
 * @example
 * ```ts
 * { label: "Platinum", color: "#e5e4e2", icon: "💎" }
 * ```
 */
export interface DrawerHeaderPill {
  /** Text label for the pill. */
  label: string;

  /** Optional color — applied to text, border, and background tint. */
  color?: string;

  /** Optional emoji or icon string rendered before the label. */
  icon?: string;
}

/**
 * Props for the DrawerHeader component.
 *
 * @example
 * ```tsx
 * <DrawerHeader
 *   variant="compact"
 *   title="Ahmed Al Maktoum"
 *   pills={[
 *     { label: "Platinum", color: "#e5e4e2", icon: "💎" },
 *     { label: "Active", color: "#22c55e" },
 *   ]}
 *   onClose={() => pop()}
 * />
 * ```
 */
export interface DrawerHeaderProps {
  /** Main title text. */
  title?: string;

  /**
   * Subtitle text shown below the title.
   * On compact variant with pills, subtitle is hidden on desktop
   * and shown on mobile as a fallback.
   */
  subtitle?: string;

  /** Optional icon element rendered before the title. */
  icon?: ReactNode;

  /**
   * Visual variant controlling layout and sizing.
   * @default "default"
   */
  variant?: DrawerHeaderVariant;

  /**
   * Close handler. If not provided, defaults to `operations.pop()`.
   * For stacked drawers, this acts as the "Back" button handler.
   */
  onClose?: () => void;

  /** Optional action elements rendered in the header's right area. */
  actions?: ReactNode;

  /** Additional CSS class names for the root element. */
  className?: string;

  /**
   * Whether to hide the close/esc button.
   * @default false
   */
  hideClose?: boolean;

  /**
   * Whether to hide the drag handle pill (mobile sheet indicator).
   * @default false
   */
  hideHandle?: boolean;

  /**
   * Metadata pills shown inline next to the title on desktop.
   * Supports emoji icons, colored backgrounds, and text labels.
   *
   * @example
   * ```ts
   * pills={[{ label: "Gold", color: "#ffd700", icon: "🥇" }]}
   * ```
   */
  pills?: DrawerHeaderPill[];

  /**
   * Display mode for the close button.
   *
   * - `"kbd"` — Shows "esc" keyboard hint on desktop, X icon on mobile (default).
   * - `"icon"` — Always shows an X icon (useful when esc is disabled).
   *
   * @default "kbd"
   */
  closeDisplay?: 'kbd' | 'icon';

  /**
   * Whether to show a loading spinner adjacent to the title.
   * Close and back buttons remain fully interactive.
   * @default false
   */
  isLoading?: boolean;
}
