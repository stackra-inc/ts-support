/**
 * @fileoverview DockPrimaryCTA — the prominent center button of the dock bar.
 *
 * Renders the primary action as a large, accented button with icon and label.
 * Contextually changes based on the current state (e.g. "New Order" → "Pay $42").
 *
 * @module command-dock/components/dock-primary-cta
 */

import React from 'react';
import type { DockAction } from '@/interfaces';

/**
 * Props for the DockPrimaryCTA component.
 */
export interface DockPrimaryCTAProps {
  /** The primary action to render. If `undefined`, renders a fallback. */
  action: DockAction | undefined;

  /** Fallback label when no primary action is set. */
  fallbackLabel?: string;

  /** Fallback icon when no primary action is set. */
  fallbackIcon?: React.ReactNode;

  /** Fallback onPress when no primary action is set. */
  fallbackOnPress?: () => void;
}

/**
 * Prominent center button of the dock bar.
 *
 * @example
 * ```tsx
 * <DockPrimaryCTA action={primaryAction} />
 * ```
 */
export function DockPrimaryCTA({
  action,
  fallbackLabel = 'Action',
  fallbackIcon,
  fallbackOnPress,
}: DockPrimaryCTAProps): React.JSX.Element {
  const label = action?.label ?? fallbackLabel;
  const icon = action?.icon ?? fallbackIcon;
  const onPress = action?.onPress ?? fallbackOnPress;
  const disabled = action?.disabled ?? false;

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      className={[
        'flex items-center gap-2 px-5 py-2 rounded-xl',
        'bg-accent text-accent-foreground text-sm font-bold',
        'hover:opacity-90 active:scale-95 transition-all shrink-0',
        disabled && 'opacity-50 pointer-events-none',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}
