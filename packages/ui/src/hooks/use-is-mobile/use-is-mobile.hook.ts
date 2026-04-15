/**
 * @fileoverview useIsMobile — responsive breakpoint hook for drawer rendering.
 *
 * @module drawer-stack/hooks/use-is-mobile
 */

import { useState, useEffect } from 'react';
import { MOBILE_QUERY } from '@/constants';

/**
 * Returns true when the viewport width is below 768px.
 *
 * Uses `window.matchMedia` for efficient, event-driven detection.
 *
 * @returns Whether the current viewport is mobile-sized.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_QUERY).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
