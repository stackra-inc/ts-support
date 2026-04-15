/**
 * @fileoverview DrawerPosition interface — position data for a drawer in the stack.
 *
 * Provided via DrawerPositionContext to child components (e.g. DrawerHeader)
 * so they can adapt their rendering based on stack position.
 *
 * @module drawer-stack/interfaces/drawer-position
 */

/**
 * Position data for a drawer within the stack.
 *
 * Used by DrawerHeader to decide whether to show a back arrow
 * (stacked) or a close button (root), and by StackDots to
 * render position indicators.
 */
export interface DrawerPositionValue {
  /** 0-based index in the stack (0 = bottom/first drawer). */
  index: number;

  /** Total number of drawers currently in the stack. */
  stackSize: number;

  /** Whether this drawer is the topmost (active) one. */
  isActive: boolean;
}
