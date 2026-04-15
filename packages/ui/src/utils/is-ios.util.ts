/**
 * @fileoverview isIOS — detects iOS devices including iPadOS 13+.
 *
 * Used by the scroll prevention hook to apply iOS-specific workarounds.
 *
 * @module drawer-stack/utils/is-ios
 */

/**
 * Detect iOS devices (iPhone, iPad, iPadOS 13+).
 *
 * iPadOS 13+ reports as "Mac" in the platform string, so we also
 * check for `maxTouchPoints > 1` to catch iPads.
 *
 * @returns Whether the current device is running iOS/iPadOS.
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined' || !window.navigator) return false;
  return (
    /^iPhone/.test(navigator.platform) ||
    /^iPad/.test(navigator.platform) ||
    (/^Mac/.test(navigator.platform) && navigator.maxTouchPoints > 1)
  );
}
