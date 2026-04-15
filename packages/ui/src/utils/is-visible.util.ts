/**
 * @fileoverview isVisible — checks if a DOM element is visually rendered.
 *
 * Used by the focus trap to filter out hidden elements from the
 * focusable element list.
 *
 * @module drawer-stack/utils/is-visible
 */

/**
 * Check if an element is visible (not display:none or visibility:hidden).
 *
 * Handles the edge case of `position: fixed` elements which have
 * `offsetParent === null` but are still visible.
 *
 * @param el - The HTML element to check.
 * @returns Whether the element is visually rendered on screen.
 */
export function isVisible(el: HTMLElement): boolean {
  if (el.offsetParent === null && el.style.position !== 'fixed') return false;
  const style = window.getComputedStyle(el);
  return style.visibility !== 'hidden' && style.display !== 'none';
}
