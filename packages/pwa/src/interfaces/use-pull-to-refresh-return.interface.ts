/**
 * @fileoverview Return type interface for the usePullToRefresh hook.
 *
 * @module @abdokouta/ts-pwa
 * @category Interfaces
 */

/**
 * Return type for the {@link usePullToRefresh} hook.
 *
 * Provides pull state and pointer event handlers for pull-to-refresh gestures.
 */
export interface UsePullToRefreshReturn {
  /** Current pull distance in px (dampened). */
  pullDistance: number;
  /** Whether a refresh is in progress. */
  isRefreshing: boolean;
  /** Whether the pull has exceeded the threshold. */
  isPastThreshold: boolean;
  /** Pointer event handlers to spread onto the container element. */
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: () => void;
    onPointerCancel: () => void;
  };
}
