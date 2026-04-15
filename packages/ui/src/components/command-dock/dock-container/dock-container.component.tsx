/**
 * @fileoverview DockContainer — positioned wrapper for the dock bar and menu.
 *
 * Handles zone-aware positioning, drawer-open fading, and renders
 * both the DockMenu (above) and DockBar (below) in a fixed container.
 *
 * @module command-dock/components/dock-container
 */

import React from 'react';
import { useCommandDock } from '@/hooks';
import { getDockPosition } from '@/utils';
import { FADED_OPACITY, DOCK_SLOTS } from '@/constants';
import { DockBar } from '@/components/command-dock/dock-bar';
import { DockMenu } from '@/components/command-dock/dock-menu';
import { Slot } from '@/components/slot';

/**
 * Positioned container for the command dock.
 *
 * Renders the dock bar and expanded menu in a fixed-position wrapper.
 * Handles zone-aware positioning and drawer-open opacity fading.
 *
 * @example
 * ```tsx
 * <CommandDockProvider config={config}>
 *   <DockContainer />
 * </CommandDockProvider>
 * ```
 */
export function DockContainer(): React.JSX.Element | null {
  const { zone, anchorRect, bottomOffset, isDrawerOpen } = useCommandDock();

  // Don't render when zone is hidden
  if (zone === 'hidden') return null;

  const positionStyle = getDockPosition(zone, bottomOffset, anchorRect);

  return (
    <div
      className="z-40"
      style={{
        ...positionStyle,
        transition: `${positionStyle.transition ?? ''}, opacity 200ms`,
        opacity: isDrawerOpen ? FADED_OPACITY : 1,
        pointerEvents: isDrawerOpen ? 'none' : 'auto',
      }}
      data-command-dock=""
      role="toolbar"
      aria-label="Command Dock"
    >
      <Slot name={DOCK_SLOTS.BAR.BEFORE} />
      <DockMenu />
      <DockBar />
      <Slot name={DOCK_SLOTS.BAR.AFTER} />
    </div>
  );
}
