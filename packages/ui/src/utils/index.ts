/**
 * @fileoverview Barrel export for all utilities.
 * @module utils
 */

// ─── Drawer Stack ──────────────────────────────────────────────────
export { buildScopedSlotName } from './build-scoped-slot-name.util';
export { isVisible } from './is-visible.util';
export { isIOS } from './is-ios.util';
export { isSafari } from './is-safari.util';
export { getScrollParent } from './get-scroll-parent.util';

// ─── Command Dock ──────────────────────────────────────────────────
export { getDockPosition } from './get-dock-position.util';
export { groupByCategory } from './group-by-category.util';

// ─── General ───────────────────────────────────────────────────────
export { cn } from './cn';
