/**
 * @fileoverview Manifest icon definition for PWA web app manifests.
 *
 * @module @abdokouta/ts-pwa
 * @category Interfaces
 */

/**
 * Manifest icon definition.
 */
export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome' | string;
}
