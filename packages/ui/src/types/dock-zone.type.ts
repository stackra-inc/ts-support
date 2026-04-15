/**
 * @fileoverview DockZone type — the active UI zone controlling dock behavior.
 *
 * @module command-dock/types/dock-zone
 */

/**
 * Active UI zone that determines dock visibility and positioning.
 *
 * - `"default"` — dock is centered at the bottom of the viewport.
 * - `"cart"` — dock repositions to the bottom center of the cart panel.
 * - `"hidden"` — dock is not rendered (e.g. during checkout or seat map).
 */
export type DockZone = 'default' | 'cart' | 'hidden';
