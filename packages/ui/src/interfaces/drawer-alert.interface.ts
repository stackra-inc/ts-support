/**
 * @fileoverview DrawerAlert interfaces.
 *
 * @module drawer-stack/interfaces/drawer-alert
 */

import type { ReactNode } from 'react';

/** Visual variant for the DrawerAlert component. */
export type DrawerAlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface DrawerAlertProps {
  /** Color scheme and icon. */
  variant: DrawerAlertVariant;
  /** Optional bold title above children. */
  title?: string;
  /** Alert body content. */
  children: ReactNode;
  /** Whether to show a dismiss button. @default false */
  dismissible?: boolean;
  /** Called when dismiss button is clicked. */
  onDismiss?: () => void;
  /** Additional CSS class names. */
  className?: string;
}
