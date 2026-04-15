/**
 * @fileoverview Transforms a global drawer slot name into a drawer-ID-scoped slot name.
 *
 * @module drawer-stack/utils/build-scoped-slot-name
 *
 * @example
 * ```ts
 * buildScopedSlotName("drawer.header.before", "checkout");
 * // → "drawer.checkout.header.before"
 * ```
 */

/**
 * Inserts the drawer ID after the `"drawer."` prefix to produce a scoped slot name.
 *
 * - `"drawer.header.before"` + `"checkout"` → `"drawer.checkout.header.before"`
 * - Returns the global name unchanged if `drawerId` is empty/null/undefined.
 */
export function buildScopedSlotName(
  globalName: string,
  drawerId: string | null | undefined
): string {
  if (!drawerId) return globalName;
  return globalName.replace(/^drawer\./, `drawer.${drawerId}.`);
}
