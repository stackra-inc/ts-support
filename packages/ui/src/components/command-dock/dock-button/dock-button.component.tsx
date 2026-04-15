/**
 * @fileoverview DockButton — icon button used in the dock bar.
 *
 * Renders a compact, rounded icon button with hover/active states.
 * Used for quick-action slots and utility buttons (voice, menu toggle).
 *
 * @module command-dock/components/dock-button
 */

import React from 'react';
import type { DockButtonProps } from '@/interfaces';

/**
 * Compact icon button for the dock bar.
 *
 * @example
 * ```tsx
 * <DockButton
 *   icon={<Search size={16} />}
 *   label="Search"
 *   onPress={() => openSpotlight()}
 * />
 * ```
 */
export function DockButton({
  icon,
  label,
  onPress,
  disabled = false,
  className,
}: DockButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onPress}
      className={[
        'size-9 rounded-xl flex items-center justify-center',
        'text-muted hover:text-foreground hover:bg-white/10',
        'active:scale-90 transition-all duration-150 shrink-0',
        disabled && 'opacity-40 pointer-events-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon}
    </button>
  );
}
