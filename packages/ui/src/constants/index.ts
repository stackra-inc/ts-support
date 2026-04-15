/**
 * @fileoverview Barrel export for all constants.
 * @module constants
 */

// ─── Drawer Stack ──────────────────────────────────────────────────
export { DRAWER_DEFAULTS } from './drawer-defaults.constant';
export { DRAWER_WIDTH_PRESETS } from './drawer-width-presets.constant';
export { DRAWER_SLOTS } from './slot-positions.constant';
export { ENTER_MS, EXIT_MS, EASE, PEEK_PX } from './animation.constant';
export {
  DRAG_THRESHOLD,
  DISMISS_FRACTION,
  VELOCITY_THRESHOLD,
  SNAP_BACK_MS,
  EASE_CURVE,
} from './drag.constant';
export { FOCUSABLE_SELECTOR } from './focusable-selector.constant';
export { MOBILE_BREAKPOINT, MOBILE_QUERY } from './mobile.constant';

// ─── Command Dock ──────────────────────────────────────────────────
export { DOCK_DEFAULTS } from './dock-defaults.constant';
export { DOCK_SLOTS } from './dock-slots.constant';
export {
  ZONE_TRANSITION_MS,
  EXPAND_MS,
  STAGGER_MS,
  MENU_MS,
  FADED_OPACITY,
} from './dock-animation.constant';
