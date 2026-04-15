/**
 * @fileoverview getScrollParent — finds the nearest scrollable ancestor.
 *
 * Used by the iOS scroll prevention to determine whether a touch
 * event target is inside a scrollable container.
 *
 * @module drawer-stack/utils/get-scroll-parent
 */

/**
 * Find the nearest scrollable ancestor of a DOM element.
 *
 * Walks up the DOM tree checking computed overflow styles.
 * Returns `document.documentElement` if no scrollable ancestor is found.
 *
 * @param node - The starting element to search from.
 * @returns The nearest scrollable ancestor element.
 */
export function getScrollParent(node: Element): Element {
  let el: Element | null = node;
  while (el && el !== document.documentElement) {
    const style = window.getComputedStyle(el);
    if (/(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY)) {
      return el;
    }
    el = el.parentElement;
  }
  return document.documentElement;
}
