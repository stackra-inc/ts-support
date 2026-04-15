/**
 * @fileoverview Animation constants — timing values for drawer enter/exit transitions.
 *
 * @module drawer-stack/constants/animation
 */

import { DRAWER_DEFAULTS } from './drawer-defaults.constant';

/** Enter animation duration in ms. */
export const ENTER_MS = DRAWER_DEFAULTS.ANIMATION_DURATION_MS;

/** Exit animation duration in ms. */
export const EXIT_MS = 200;

/** Shared easing curve for drawer transitions. */
export const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

/** Peek offset in pixels for stacked drawers on desktop. */
export const PEEK_PX = 24;
