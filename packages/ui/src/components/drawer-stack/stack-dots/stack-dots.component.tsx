/**
 * @fileoverview StackDots — visual indicator showing position in the drawer stack.
 *
 * - ≤5 drawers: renders dots (active dot highlighted)
 * - >5 drawers: renders a compact "3/14" counter badge
 *
 * Two variants: "hero" (with backdrop blur) and "surface" (standard).
 *
 * @module drawer-stack/components/stack-dots
 */

import React from 'react';
import { DRAWER_DEFAULTS } from '@/constants';

interface StackDotsProps {
  /** Total number of drawers in the stack. */
  stackSize: number;
  /** 0-based index of the current drawer. */
  index: number;
  /** Visual variant — "hero" for dark overlay, "surface" for standard. */
  variant: 'hero' | 'surface';
  /** Override the default threshold for switching to counter mode. */
  maxDots?: number;
}

/**
 * Stack position indicator — dots for small stacks, counter for large ones.
 */
export function StackDots({
  stackSize,
  index,
  variant,
  maxDots,
}: StackDotsProps): React.JSX.Element {
  const threshold = maxDots ?? DRAWER_DEFAULTS.MAX_DOTS;

  // ── Counter mode for large stacks ──
  if (stackSize > threshold) {
    if (variant === 'hero') {
      return (
        <div className="px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-md text-[9px] font-bold text-white/70 tabular-nums">
          {index + 1}/{stackSize}
        </div>
      );
    }
    return (
      <div className="px-1.5 py-0.5 rounded-md bg-muted/10 text-[9px] font-bold text-muted tabular-nums shrink-0">
        {index + 1}/{stackSize}
      </div>
    );
  }

  // ── Dots mode for small stacks ──
  if (variant === 'hero') {
    return (
      <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-black/30 backdrop-blur-md">
        {Array.from({ length: stackSize }, (_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-200 ${
              i === index ? 'size-1.5 bg-accent' : 'size-1 bg-white/30'
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {Array.from({ length: stackSize }, (_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-200 ${
            i === index ? 'size-1.5 bg-accent' : 'size-1 bg-muted/20'
          }`}
        />
      ))}
    </div>
  );
}
