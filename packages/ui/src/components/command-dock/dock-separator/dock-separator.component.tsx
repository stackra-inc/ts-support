/**
 * @fileoverview DockSeparator — vertical divider between dock sections.
 *
 * Renders a thin vertical line that animates in/out with the dock expansion.
 * Used to visually separate quick actions from the primary CTA.
 *
 * @module command-dock/components/dock-separator
 */

import React from 'react';
import { EXPAND_MS, EASE } from '@/constants';

/**
 * Props for the DockSeparator component.
 */
export interface DockSeparatorProps {
  /** Whether the separator is visible (dock is expanded). */
  visible: boolean;
}

/**
 * Animated vertical separator for the dock bar.
 *
 * @example
 * ```tsx
 * <DockSeparator visible={isExpanded} />
 * ```
 */
export function DockSeparator({ visible }: DockSeparatorProps): React.JSX.Element {
  return (
    <div
      className="shrink-0 overflow-hidden"
      style={{
        width: visible ? 9 : 0,
        opacity: visible ? 0.5 : 0,
        transition: `width ${EXPAND_MS}ms ${EASE}, opacity 120ms ease`,
      }}
      aria-hidden="true"
    >
      <div className="w-px h-6 bg-separator mx-1" />
    </div>
  );
}
