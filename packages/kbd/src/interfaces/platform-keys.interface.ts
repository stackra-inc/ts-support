/**
 * @fileoverview Platform-specific key combination interface
 *
 * @module interfaces/PlatformKeys
 */

import type { KeyValue } from '@/types';

/**
 * Platform-specific key combination
 */
export interface PlatformKeys {
  /**
   * Keys for macOS
   */
  mac?: (KeyValue | string)[];

  /**
   * Keys for Windows
   */
  windows?: (KeyValue | string)[];

  /**
   * Keys for Linux
   */
  linux?: (KeyValue | string)[];

  /**
   * Default keys for all platforms
   */
  default: (KeyValue | string)[];
}
