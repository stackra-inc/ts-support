/**
 * @fileoverview usePreventScroll — prevents background page scrolling when drawers are open.
 *
 * Uses a window-level singleton for reference-counted locking so that
 * multiple DrawerContainer instances or bundle chunks share the same state.
 *
 * @module drawer-stack/hooks/use-prevent-scroll
 */

import { useEffect, useRef } from 'react';
import { isIOS } from '@/utils';
import { isSafari } from '@/utils';
import { getScrollParent } from '@/utils';

// ─── Shared singleton (window-level, survives multiple bundle chunks) ──

const SCROLL_LOCK_KEY = '__drawerStackScrollLock';

interface ScrollLockState {
  lockCount: number;
  savedScrollY: number;
  savedBodyStyles: Partial<CSSStyleDeclaration> | null;
  cleanupFns: Array<() => void>;
}

function getSharedState(): ScrollLockState {
  const win = window as unknown as Record<string, unknown>;
  if (!win[SCROLL_LOCK_KEY]) {
    win[SCROLL_LOCK_KEY] = {
      lockCount: 0,
      savedScrollY: 0,
      savedBodyStyles: null,
      cleanupFns: [],
    };
  }
  return win[SCROLL_LOCK_KEY] as ScrollLockState;
}

// ─── iOS touch prevention ──────────────────────────────────────────

function preventScrollIOS(): () => void {
  let lastTouchY = 0;
  const onTouchStart = (e: TouchEvent) => {
    lastTouchY = e.changedTouches[0]!.pageY;
  };
  const onTouchMove = (e: TouchEvent) => {
    const scrollable = getScrollParent(e.target as Element);
    if (!scrollable || scrollable === document.documentElement || scrollable === document.body) {
      e.preventDefault();
      return;
    }
    const y = e.changedTouches[0]!.pageY;
    const { scrollTop, scrollHeight, clientHeight } = scrollable;
    if (
      (scrollTop <= 0 && y > lastTouchY) ||
      (scrollTop >= scrollHeight - clientHeight && y < lastTouchY)
    ) {
      e.preventDefault();
    }
    lastTouchY = y;
  };
  document.addEventListener('touchstart', onTouchStart, {
    passive: false,
    capture: true,
  });
  document.addEventListener('touchmove', onTouchMove, {
    passive: false,
    capture: true,
  });
  return () => {
    document.removeEventListener('touchstart', onTouchStart, {
      capture: true,
    } as EventListenerOptions);
    document.removeEventListener('touchmove', onTouchMove, {
      capture: true,
    } as EventListenerOptions);
  };
}

function lockBodySafari(): () => void {
  if (!isSafari()) return () => {};
  const state = getSharedState();
  state.savedScrollY = window.scrollY;
  state.savedBodyStyles = {
    position: document.body.style.position,
    top: document.body.style.top,
    left: document.body.style.left,
    right: document.body.style.right,
    height: document.body.style.height,
    overflow: document.body.style.overflow,
  };
  Object.assign(document.body.style, {
    position: 'fixed',
    top: `${-state.savedScrollY}px`,
    left: '0',
    right: '0',
    height: 'auto',
    overflow: 'hidden',
  });
  return () => {
    if (state.savedBodyStyles) {
      Object.assign(document.body.style, state.savedBodyStyles);
      window.scrollTo(0, state.savedScrollY);
      state.savedBodyStyles = null;
    }
  };
}

function lockBodyStandard(): () => void {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  const prev = {
    overflow: document.body.style.overflow,
    paddingRight: document.body.style.paddingRight,
  };
  document.body.style.overflow = 'hidden';
  if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
  return () => {
    document.body.style.overflow = prev.overflow;
    document.body.style.paddingRight = prev.paddingRight;
  };
}

// ─── Hook ──────────────────────────────────────────────────────────

/**
 * Prevent background page scrolling when drawers are open.
 * Uses window-level singleton for instance-safe reference counting.
 */
export function usePreventScroll(isLocked: boolean): void {
  const wasLocked = useRef(false);
  useEffect(() => {
    const state = getSharedState();
    if (isLocked && !wasLocked.current) {
      wasLocked.current = true;
      state.lockCount++;
      if (state.lockCount === 1) {
        if (isIOS()) {
          state.cleanupFns.push(preventScrollIOS());
          state.cleanupFns.push(lockBodySafari());
        } else {
          state.cleanupFns.push(lockBodyStandard());
        }
      }
    }
    return () => {
      if (wasLocked.current) {
        wasLocked.current = false;
        state.lockCount--;
        if (state.lockCount === 0) {
          for (const fn of state.cleanupFns) fn();
          state.cleanupFns = [];
        }
      }
    };
  }, [isLocked]);
}
