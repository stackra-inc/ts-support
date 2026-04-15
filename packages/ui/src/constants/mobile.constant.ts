/**
 * @fileoverview Mobile constants — breakpoint for responsive drawer rendering.
 *
 * @module drawer-stack/constants/mobile
 */

/** Mobile breakpoint in pixels. Below this, drawers render as bottom sheets. */
export const MOBILE_BREAKPOINT = 768;

/** Media query string for mobile detection. */
export const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
