/**
 * @fileoverview Drawer width presets — named pixel values for common drawer sizes.
 *
 * @module drawer-stack/constants/drawer-width-presets
 */

import type { DrawerWidthPreset } from '@/types';

/**
 * Preset width map — all values in pixels.
 *
 * @example
 * ```tsx
 * push({ id: "checkout", width: DRAWER_WIDTH_PRESETS.checkout }, <Checkout />);
 * // equivalent to: width: 680
 * ```
 */
export const DRAWER_WIDTH_PRESETS: Record<DrawerWidthPreset, number> = {
  notifications: 420,
  profile: 460,
  settings: 460,
  cartCoupon: 420,
  cartCustomer: 420,
  checkout: 680,
  upsell: 520,
  eventDetail: 780,
  seatMap: 800,
  shiftManagement: 460,
} as const;
