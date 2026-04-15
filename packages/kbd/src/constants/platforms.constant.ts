/**
 * @fileoverview Platform constants
 *
 * Defines platform types and detection utilities.
 *
 * @module @abdokouta/kbd
 * @category Constants
 */

import type { Platform } from '@/interfaces/platform.type';

/**
 * Available platforms
 *
 * @constant
 * @public
 */
export const PLATFORMS = {
  MAC: 'mac' as const,
  WINDOWS: 'windows' as const,
  LINUX: 'linux' as const,
  ALL: 'all' as const,
} satisfies Record<string, Platform>;

/**
 * Array of all platforms
 *
 * @constant
 * @public
 */
export const ALL_PLATFORMS = Object.values(PLATFORMS);

/**
 * Platform display names
 *
 * @constant
 * @public
 */
export const PLATFORM_NAMES: Record<Platform, string> = {
  mac: 'macOS',
  windows: 'Windows',
  linux: 'Linux',
  all: 'All Platforms',
};

/**
 * Platform detection patterns
 *
 * @constant
 * @internal
 */
export const PLATFORM_PATTERNS = {
  mac: /(Mac|iPhone|iPod|iPad)/i,
  windows: /Win/i,
  linux: /Linux/i,
};

/**
 * Detect the current platform
 *
 * @returns The detected platform
 * @public
 */
export function detectPlatform(): Exclude<Platform, 'all'> {
  const userAgent = typeof navigator !== 'undefined' ? navigator.platform : '';

  if (PLATFORM_PATTERNS.mac.test(userAgent)) {
    return PLATFORMS.MAC;
  }

  if (PLATFORM_PATTERNS.windows.test(userAgent)) {
    return PLATFORMS.WINDOWS;
  }

  if (PLATFORM_PATTERNS.linux.test(userAgent)) {
    return PLATFORMS.LINUX;
  }

  // Default to Windows if unknown
  return PLATFORMS.WINDOWS;
}
