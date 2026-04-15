/**
 * @fileoverview useDrawerDrag — gesture-driven drag-to-dismiss for drawer panels.
 *
 * Features:
 * - Respects onBeforeClose guard (call-first pattern)
 * - AbortController-based transitionend listener cleanup
 * - Horizontal scroll detection
 *
 * @module drawer-stack/hooks/use-drawer-drag
 */

import { useRef, useCallback, useEffect } from 'react';
import {
  DRAG_THRESHOLD,
  DISMISS_FRACTION,
  VELOCITY_THRESHOLD,
  SNAP_BACK_MS,
  EASE_CURVE,
} from '@/constants';
import type { UseDrawerDragOptions, UseDrawerDragReturn } from '@/interfaces';

/**
 * Hook for drag-to-dismiss on right-edge drawer panels.
 *
 * Calls `onDismiss` before animating off-screen so that `onBeforeClose`
 * guards can block the dismissal. Uses AbortController to clean up
 * transitionend listeners on unmount.
 */
export function useDrawerDrag({ enabled, onDismiss }: UseDrawerDragOptions): UseDrawerDragReturn {
  const dragRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isDragging = useRef(false);
  const isActive = useRef(false);
  const startX = useRef(0);
  const currentOffset = useRef(0);
  const velocity = useRef(0);
  const lastTime = useRef(0);
  const lastX = useRef(0);

  // Cleanup transitionend listeners on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (
        target.closest('input, textarea, button, [role="button"], select, a, [data-drag-exclude]')
      )
        return;
      // Check for scrollable ancestors (vertical + horizontal)
      let el: HTMLElement | null = target;
      while (el && el !== dragRef.current) {
        const style = window.getComputedStyle(el);
        if (
          /(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY) &&
          el.scrollHeight > el.clientHeight
        )
          return;
        // Horizontal scroll detection
        if (el.scrollWidth > el.clientWidth && el.scrollLeft > 0) return;
        el = el.parentElement;
      }
      isDragging.current = true;
      isActive.current = false;
      startX.current = e.clientX;
      lastX.current = e.clientX;
      lastTime.current = Date.now();
      currentOffset.current = 0;
      velocity.current = 0;
    },
    [enabled]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !dragRef.current) return;
    const delta = Math.max(0, e.clientX - startX.current);
    if (!isActive.current) {
      if (Math.abs(e.clientX - startX.current) < DRAG_THRESHOLD) return;
      isActive.current = true;
      dragRef.current.style.transition = 'none';
      try {
        dragRef.current.setPointerCapture(e.pointerId);
      } catch {}
    }
    currentOffset.current = delta;
    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      velocity.current = (e.clientX - lastX.current) / dt;
      lastTime.current = now;
      lastX.current = e.clientX;
    }
    dragRef.current.style.transform = `translateX(${delta}px)`;
  }, []);

  const onPointerUp = useCallback(
    async (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const el = dragRef.current;
      if (!el || !isActive.current) {
        isActive.current = false;
        return;
      }
      isActive.current = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}

      const width = el.offsetWidth;
      const shouldDismiss =
        Math.abs(currentOffset.current) > width * DISMISS_FRACTION ||
        Math.abs(velocity.current) > VELOCITY_THRESHOLD;

      // Abort any previous transitionend listeners
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const { signal } = abortRef.current;

      if (shouldDismiss) {
        // Call-first pattern: check onBeforeClose guard before animating
        const dismissed = await onDismiss();

        if (dismissed && el && document.body.contains(el)) {
          // Pop succeeded — animate off-screen
          el.style.transition = `transform ${SNAP_BACK_MS}ms ${EASE_CURVE}`;
          el.style.transform = 'translateX(100%)';
          el.addEventListener(
            'transitionend',
            () => {
              el.style.transition = '';
              el.style.transform = '';
            },
            { once: true, signal }
          );
        } else if (el && document.body.contains(el)) {
          // Pop blocked — snap back
          el.style.transition = `transform ${SNAP_BACK_MS}ms ${EASE_CURVE}`;
          el.style.transform = '';
          el.addEventListener(
            'transitionend',
            () => {
              el.style.transition = '';
            },
            { once: true, signal }
          );
        }
      } else {
        // Below threshold — snap back
        el.style.transition = `transform ${SNAP_BACK_MS}ms ${EASE_CURVE}`;
        el.style.transform = '';
        el.addEventListener(
          'transitionend',
          () => {
            el.style.transition = '';
          },
          { once: true, signal }
        );
      }
      currentOffset.current = 0;
      velocity.current = 0;
    },
    [onDismiss]
  );

  const noop = () => {};
  const dragHandlers = enabled
    ? { onPointerDown, onPointerMove, onPointerUp }
    : { onPointerDown: noop, onPointerMove: noop, onPointerUp: noop };
  return { dragRef, dragHandlers };
}

export type { UseDrawerDragOptions, UseDrawerDragReturn };
