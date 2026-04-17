/**
 * @fileoverview Web App Manifest configuration options.
 *
 * @module @abdokouta/ts-pwa
 * @category Interfaces
 */

import type { ManifestIcon } from './manifest-icon.interface';

/**
 * Web App Manifest configuration.
 *
 * Subset of the W3C Web App Manifest spec with the most commonly used fields.
 */
export interface ManifestOptions {
  /** Application name. */
  name?: string;

  /** Short name for the home screen icon. */
  short_name?: string;

  /** Application description. */
  description?: string;

  /** Theme color for the browser chrome. */
  theme_color?: string;

  /** Background color for the splash screen. */
  background_color?: string;

  /** Display mode. @default "standalone" */
  display?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';

  /** Preferred orientation. */
  orientation?: 'any' | 'natural' | 'landscape' | 'portrait';

  /** Start URL when the app is launched. @default "/" */
  start_url?: string;

  /** Scope of the PWA navigation. @default "/" */
  scope?: string;

  /** Application icons. */
  icons?: ManifestIcon[];

  /** Additional manifest properties. */
  [key: string]: unknown;
}
