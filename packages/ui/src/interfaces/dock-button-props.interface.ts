/**
 * @fileoverview DockButtonProps interface — props for the DockButton component.
 *
 * @module command-dock/interfaces/dock-button-props
 */

import type { ReactNode } from 'react';

/**
 * Props for the `DockButton` icon button used in the dock bar.
 */
export interface DockButtonProps {
  /** Icon element rendered inside the button. */
  icon: ReactNode;

  /** Accessible label (used as `title` and `aria-label`). */
  label: string;

  /** Click handler. */
  onPress: () => void;

  /** When `true`, the button is non-interactive. */
  disabled?: boolean;

  /** Additional CSS class names. */
  className?: string;
}
