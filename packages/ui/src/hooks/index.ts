/**
 * @fileoverview Barrel export for all hooks.
 * @module hooks
 */

// ─── Slot ──────────────────────────────────────────────────────────
export { useSlot, useHasSlot } from './use-slot';

// ─── Drawer Stack ──────────────────────────────────────────────────
export { useDrawerStack } from './use-drawer-stack';
export { useDrawerPosition } from './use-drawer-position';
export { useDrawerDrag } from './use-drawer-drag';
export { useDrawerId } from './use-drawer-id';
export { useFocusTrap } from './use-focus-trap';
export { usePreventScroll } from './use-prevent-scroll';
export { useIsMobile } from './use-is-mobile';
export { useSubView } from './use-sub-view';

// ─── Command Dock ──────────────────────────────────────────────────
export { useCommandDock } from './use-command-dock';
export { useIsDrawerOpen } from './use-is-drawer-open';
