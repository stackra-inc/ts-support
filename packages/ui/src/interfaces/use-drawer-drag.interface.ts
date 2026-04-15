/**
 * @fileoverview Interfaces for the useDrawerDrag hook.
 *
 * @module drawer-stack/interfaces/use-drawer-drag
 */

/**
 * Options for the useDrawerDrag hook.
 */
export interface UseDrawerDragOptions {
  /** Whether drag-to-dismiss is enabled for this drawer. */
  enabled: boolean;

  /** Callback invoked when the user drags past the dismiss threshold. Returns whether the dismiss was allowed. */
  onDismiss: () => Promise<boolean> | boolean;
}

/**
 * Return value from the useDrawerDrag hook.
 */
export interface UseDrawerDragReturn {
  /** Ref to attach to the drawer panel element. */
  dragRef: React.RefObject<HTMLDivElement | null>;

  /** Pointer event handlers to spread onto the drawer panel. */
  dragHandlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  };
}
