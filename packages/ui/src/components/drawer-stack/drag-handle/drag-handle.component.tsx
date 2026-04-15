/**
 * @fileoverview DragHandle — visual affordance for mobile bottom sheet dragging.
 *
 * A small pill indicator at the top of the drawer that signals
 * the drawer can be swiped down to dismiss. Desktop drawers use
 * the left-edge grip handle instead (rendered by DrawerContainer).
 *
 * Hidden on desktop via `@media (pointer: fine)`.
 *
 * @module drawer-stack/components/drag-handle
 */

import React from 'react';

/**
 * Props for the DragHandle component.
 */
interface DragHandleProps {
  /** Visual variant — "hero" for dark overlay, "surface" for standard. */
  variant: 'hero' | 'surface';
}

/**
 * Drag handle pill — mobile/touch only.
 *
 * Uses `@media (pointer: fine)` to hide on devices with a mouse/trackpad.
 * Desktop drawers have a left-edge grip handle instead.
 */
export function DragHandle({ variant }: DragHandleProps): React.JSX.Element {
  const pillColor = variant === 'hero' ? 'bg-white/30' : 'bg-muted/20';
  const padding = variant === 'hero' ? 'pt-2 pb-1' : 'pt-2 pb-0';

  return (
    <>
      <style>{`@media (pointer: fine) { .drawer-drag-handle { display: none !important; } }`}</style>
      <div className={`drawer-drag-handle flex justify-center ${padding}`} aria-hidden="true">
        <div className={`w-8 h-1 rounded-full ${pillColor}`} />
      </div>
    </>
  );
}
