/**
 * @fileoverview isSafari — detects Safari browser (excludes Chrome on iOS).
 *
 * Used by the scroll prevention hook to apply Safari-specific
 * position:fixed body hack.
 *
 * @module drawer-stack/utils/is-safari
 */

/**
 * Detect Safari browser.
 *
 * Uses a negative lookahead to exclude Chrome and Android browsers
 * that include "Safari" in their user agent string.
 *
 * @returns Whether the current browser is Safari.
 */
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
