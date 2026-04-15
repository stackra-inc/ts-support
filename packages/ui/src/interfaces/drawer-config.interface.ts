/**
 * @fileoverview DrawerConfig interface — configuration for a single drawer entry.
 *
 * Defines the shape of the configuration object passed when pushing
 * a new drawer onto the stack. Controls width, behavior, and metadata.
 *
 * @module drawer-stack/interfaces/drawer-config
 */

/**
 * Configuration for a single drawer entry in the stack.
 *
 * @template TId - String literal type for the drawer identifier.
 *
 * @example
 * ```tsx
 * const config: DrawerConfig = {
 *   id: "checkout",
 *   width: 680,
 *   singleton: true,
 *   closeOnEscape: true,
 *   metadata: { label: "Checkout" },
 * };
 * ```
 */
export interface DrawerConfig<TId extends string = string> {
  /**
   * Unique identifier for this drawer.
   * Used for singleton detection, popTo, update, and React key generation.
   */
  id: TId;

  /**
   * Width of the drawer panel.
   * - `number`: pixels (e.g. `480`)
   * - `string`: CSS value (e.g. `"50vw"`, `"clamp(400px, 40%, 800px)"`)
   *
   * @default 480
   */
  width?: number | string;

  /**
   * Whether pressing the Escape key closes this drawer.
   * Set to `false` for drawers that require explicit confirmation (e.g. checkout).
   *
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Singleton mode — if a drawer with the same `id` already exists in the stack,
   * pushing again will bring the existing one to the top instead of creating a duplicate.
   *
   * @default false
   */
  singleton?: boolean;

  /**
   * Arbitrary metadata that consumers can attach to the drawer entry.
   * Useful for accessibility labels, analytics tracking, or custom behavior.
   *
   * @example
   * ```ts
   * metadata: { label: "Checkout", source: "cart-panel" }
   * ```
   */
  metadata?: Record<string, unknown>;

  /**
   * Called before the drawer is dismissed (via esc, backdrop click, drag, or pop).
   * Return `true` to allow the close, or `false` to prevent it.
   * Useful for showing "unsaved changes" confirmation toasts.
   *
   * If the function returns a `Promise`, the drawer waits for resolution.
   *
   * @example
   * ```ts
   * onBeforeClose: () => {
   *   if (hasUnsavedChanges) {
   *     toast.warning("You have unsaved changes", {
   *       actionProps: { children: "Discard", onPress: () => pop() },
   *     });
   *     return false;
   *   }
   *   return true;
   * }
   * ```
   */
  onBeforeClose?: () => boolean | Promise<boolean>;

  /**
   * Called before the drawer is pushed onto the stack.
   * Return `true` to allow the push, or `false` to cancel it.
   * If the function returns a `Promise`, the push waits for resolution.
   * If the callback throws or the Promise rejects, the push is cancelled.
   */
  onBeforeOpen?: () => boolean | Promise<boolean>;

  /**
   * Called after the drawer's enter animation completes.
   * Useful for analytics, data fetching, or coordinating with other UI.
   * Invoked exactly once per push. Not invoked on singleton re-activation.
   */
  onAfterOpen?: () => void;

  /**
   * Called after the drawer's exit animation completes and the entry
   * is removed from the visual state. Useful for cleanup or external state updates.
   * Invoked exactly once per drawer removal.
   */
  onAfterClose?: () => void;

  /**
   * When true and rendered as a mobile bottom sheet, attaches a ResizeObserver
   * to the content container to toggle overflow-y based on content height.
   * No-op on desktop panels. Defaults to false.
   */
  observeResize?: boolean;

  /**
   * Snap points for mobile bottom sheets, expressed as fractions of viewport height (0–1).
   * The sheet opens at the first snap point and can be dragged between them.
   * If dragged below 15% of viewport, the sheet dismisses.
   * No-op on desktop panels.
   *
   * @example
   * ```ts
   * snapPoints: [0.3, 0.6, 1] // 30%, 60%, 100% of viewport
   * ```
   */
  snapPoints?: number[];

  /**
   * Text direction for the drawer panel.
   * - `"ltr"` (default): panel slides from the right edge on desktop.
   * - `"rtl"`: panel slides from the left edge on desktop; text renders RTL.
   *
   * On mobile, bottom sheets always slide up from the bottom regardless of direction,
   * but `dir="rtl"` is set on the panel element so inner text renders correctly.
   */
  direction?: 'ltr' | 'rtl';
}
