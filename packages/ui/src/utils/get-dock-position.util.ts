/**
 * @fileoverview getDockPosition — computes CSS position for the dock bar.
 *
 * Returns a `CSSProperties` object that positions the dock based on
 * the active zone and optional anchor rect.
 *
 * @module command-dock/utils/get-dock-position
 */

import type { DockZone } from '@/types';
import { ZONE_TRANSITION_MS, EASE } from '@/constants';

/**
 * Compute the CSS position style for the dock bar.
 *
 * @param zone - Active UI zone.
 * @param bottomOffset - Bottom offset in pixels.
 * @param anchorRect - Optional anchor rect for zone-aware positioning.
 * @returns CSS properties for the dock container.
 */
export function getDockPosition(
  zone: DockZone,
  bottomOffset: number,
  anchorRect: DOMRect | null
): React.CSSProperties {
  const transition = `left ${ZONE_TRANSITION_MS}ms ${EASE}, bottom ${ZONE_TRANSITION_MS}ms ${EASE}`;

  if (zone === 'cart' && anchorRect) {
    return {
      position: 'fixed',
      bottom: bottomOffset,
      left: anchorRect.left + anchorRect.width / 2,
      transform: 'translateX(-50%)',
      transition,
    };
  }

  return {
    position: 'fixed',
    bottom: bottomOffset,
    left: '50%',
    transform: 'translateX(-50%)',
    transition,
  };
}
