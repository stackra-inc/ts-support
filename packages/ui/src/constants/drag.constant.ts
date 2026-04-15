/**
 * @fileoverview Drag constants — thresholds and timing for drag-to-dismiss gestures.
 *
 * @module drawer-stack/constants/drag
 */

/** Pixels of movement before drag activates (avoids false starts from taps). */
export const DRAG_THRESHOLD = 8;

/** Fraction of drawer width — dismiss if dragged beyond this. */
export const DISMISS_FRACTION = 0.3;

/** px/ms — dismiss on fast flick regardless of distance. */
export const VELOCITY_THRESHOLD = 0.5;

/** Spring-back animation duration in milliseconds. */
export const SNAP_BACK_MS = 300;

/** Cubic bezier matching vaul's transition curve. */
export const EASE_CURVE = 'cubic-bezier(0.32, 0.72, 0, 1)';
