// @ts-nocheck
/**
 * @fileoverview SubViewNavigator — internal sub-view stack for a single drawer.
 *
 * Wraps drawer body content and maintains an internal viewId[] stack.
 * Provides goTo/goBack with CSS keyframe slide transitions.
 *
 * @module drawer-stack/components/sub-view-navigator
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { SubViewContext } from '@/contexts/drawer-stack';
import type { SubViewNavigatorProps, SubViewContextValue } from '@/interfaces';
import { DRAWER_DEFAULTS } from '@/constants';

const ANIM_MS = DRAWER_DEFAULTS.ANIMATION_DURATION_MS;

/**
 * SubViewNavigator — enables multi-view navigation within a single drawer.
 *
 * Maintains an internal view stack with forward/back navigation
 * and CSS keyframe slide transitions (no flash).
 */
export function SubViewNavigator<TView extends string = string>({
  initialView,
  views,
  onViewChange,
  children,
}: SubViewNavigatorProps<TView>): React.JSX.Element {
  const [viewStack, setViewStack] = useState<TView[]>([initialView]);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animKey, setAnimKey] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const currentView = viewStack[viewStack.length - 1];
  const canGoBack = viewStack.length > 1;

  const goTo = useCallback(
    (viewId: TView) => {
      setDirection('forward');
      setAnimating(true);
      setAnimKey((k) => k + 1);
      setViewStack((prev) => [...prev, viewId]);
      onViewChange?.(viewId);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setAnimating(false), ANIM_MS);
    },
    [onViewChange]
  );

  const goBack = useCallback(() => {
    if (viewStack.length <= 1) return;
    setDirection('back');
    setAnimating(true);
    setAnimKey((k) => k + 1);
    setViewStack((prev) => {
      const next = prev.slice(0, -1);
      onViewChange?.(next[next.length - 1]);
      return next;
    });
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAnimating(false), ANIM_MS);
  }, [viewStack.length, onViewChange]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const contextValue = useMemo<SubViewContextValue<TView>>(
    () => ({ currentView, viewHistory: viewStack, canGoBack, goTo, goBack }),
    [currentView, viewStack, canGoBack, goTo, goBack]
  );

  return (
    <SubViewContext.Provider value={contextValue as unknown as SubViewContextValue}>
      <style>{`
        @keyframes drawer-slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes drawer-slide-in-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
      <div className="flex flex-col h-full overflow-hidden">
        <div
          key={animKey}
          className="flex-1 overflow-hidden"
          style={
            animating
              ? {
                  animationName:
                    direction === 'forward' ? 'drawer-slide-in-right' : 'drawer-slide-in-left',
                  animationDuration: `${ANIM_MS}ms`,
                  animationTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
                  animationFillMode: 'both',
                }
              : undefined
          }
        >
          {views[currentView]}
        </div>
        {children}
      </div>
    </SubViewContext.Provider>
  );
}
