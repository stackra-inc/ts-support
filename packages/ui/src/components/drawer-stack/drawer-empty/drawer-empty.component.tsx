/**
 * @fileoverview DrawerEmpty — centered empty state for drawer content areas.
 *
 * Displays an icon, title, description, and optional action when there is
 * no content to show inside a drawer panel.
 *
 * @module drawer-stack/components/drawer-empty
 */

import React from 'react';
import type { DrawerEmptyProps } from '@/interfaces';

/** Default empty-box SVG icon. */
function DefaultIcon(): React.JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted/40"
      aria-hidden="true"
    >
      <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
      <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
      <path d="M4 12h16" />
      <path d="M9 8v8" />
      <path d="M15 8v8" />
    </svg>
  );
}

/**
 * Centered empty state for drawer content areas.
 *
 * @example
 * ```tsx
 * <Drawer.Content>
 *   <Drawer.Empty
 *     title="No items yet"
 *     description="Add your first item to get started."
 *     action={<Button size="sm">Add Item</Button>}
 *   />
 * </Drawer.Content>
 * ```
 */
export function DrawerEmpty({
  icon,
  title,
  description,
  action,
  className,
}: DrawerEmptyProps): React.JSX.Element {
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center ${className ?? ''}`}
    >
      {icon ?? <DefaultIcon />}
      {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
      {description && <p className="text-xs text-muted max-w-[240px]">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
