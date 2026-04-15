/**
 * @fileoverview Focusable element selector — CSS selector for all natively focusable elements.
 *
 * Used by the focus trap hook to find elements that can receive keyboard focus.
 *
 * @module drawer-stack/constants/focusable-selector
 */

/**
 * CSS selector matching all natively focusable HTML elements.
 *
 * Includes: links, buttons, textareas, inputs, selects,
 * elements with tabindex, and contenteditable elements.
 * Excludes disabled elements and tabindex="-1".
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');
