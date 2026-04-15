/**
 * @fileoverview DrawerWidthPreset — type for named drawer width presets.
 *
 * The actual values are in `constants/drawer-width-presets.constant.ts`.
 *
 * @module drawer-stack/types/drawer-width-preset
 */

/**
 * Known drawer width preset names.
 *
 * Each maps to a pixel value in {@link DRAWER_WIDTH_PRESETS}.
 */
export type DrawerWidthPreset =
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'cartCoupon'
  | 'cartCustomer'
  | 'checkout'
  | 'upsell'
  | 'eventDetail'
  | 'seatMap'
  | 'shiftManagement';
