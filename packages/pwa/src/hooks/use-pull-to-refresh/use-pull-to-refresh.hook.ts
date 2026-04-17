/**
 * @fileoverview usePullToRefresh — hook that manages the pull-to-refresh gesture.
 *
 * Attaches pointer event listeners to a container, tracks pull distance,
 * and triggers the refresh callback when the threshold is exceeded.
 * Uses dampened elastic pull for a native feel.
 *
 * @module pwa/hooks/use-pull-to-refresh
 */

import { useState, useCallback, useRef } from 'react';
import { PULL_TO_REFRESH_DEFAULTS } from '@/constants';
import type { PullToRefreshConfig } from '@/interfaces';
import type { UsePullToRefreshReturn } from '@/interfaces/use-pull-to-refresh-return.interface';

/**
 * Manage pull-to-refresh gesture state.
 *
 * @param config - Pull-to-refresh configuration.
 * @returns Pull state and pointer event handlers.
 *
 * @example
 * ```tsx
 * const { pullDistance, isRefreshing, handlers } = usePullToRefresh({
 *   onRefresh: async () => { await fetchData(); },
 *   threshold: 80,
 * });
 *
 * return <div {...handlers}>{children}</div>;
 * ```
 */
export function usePullToRefresh(config: PullToRefreshConfig): UsePullToRefreshReturn {
  const threshold = config.threshold ?? PULL_TO_REFRESH_DEFAULTS.THRESHOLD;
  const maxPull = config.maxPull ?? PULL_TO_REFRESH_DEFAULTS.MAX_PULL;
  const enabled = config.enabled ?? PULL_TO_REFRESH_DEFAULTS.ENABLED;

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef(0);
  const tracking = useRef(false);
  const confirmed = useRef(false);

  const dampen = useCallback(
    (raw: number) => {
      const ratio = Math.min(raw / maxPull, 1);
      return maxPull * (1 - Math.pow(1 - ratio, 2)) * 0.5;
    },
    [maxPull]
  );

  const isScrolledDown = useCallback((target: HTMLElement): boolean => {
    let el: HTMLElement | null = target;
    while (el) {
      if (el.scrollTop > 0) return true;
      el = el.parentElement;
    }
    return false;
  }, []);

  const reset = useCallback(() => {
    tracking.current = false;
    confirmed.current = false;
    setPullDistance(0);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || isRefreshing || e.button !== 0) return;
      if (isScrolledDown(e.target as HTMLElement)) return;

      const target = e.target as HTMLElement;
      if (
        target.closest('input, textarea, button, [role="button"], select, a, [data-drag-exclude]')
      )
        return;

      tracking.current = true;
      confirmed.current = false;
      startY.current = e.clientY;
    },
    [enabled, isRefreshing, isScrolledDown]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!tracking.current) return;

      const rawDelta = e.clientY - startY.current;

      if (!confirmed.current) {
        if (rawDelta < 8) return;
        confirmed.current = true;
      }

      if (rawDelta <= 0) {
        setPullDistance(0);
        return;
      }

      const dampened = dampen(rawDelta);
      setPullDistance(dampened);
    },
    [dampen]
  );

  const onPointerUp = useCallback(async () => {
    if (!tracking.current) return;
    tracking.current = false;

    if (confirmed.current && pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold * 0.4);
      try {
        await config.onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    confirmed.current = false;
  }, [pullDistance, threshold, config]);

  return {
    pullDistance,
    isRefreshing,
    isPastThreshold: pullDistance >= threshold,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: reset,
    },
  };
}
