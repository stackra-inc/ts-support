/**
 * @fileoverview DrawerEmpty interface — props for the empty state component.
 * @module drawer-stack/interfaces/drawer-empty
 */

import type { ReactNode } from 'react';

export interface DrawerEmptyProps {
  /** Custom icon rendered above the title. Defaults to an empty-box SVG. */
  icon?: ReactNode;
  /** Heading text. */
  title?: string;
  /** Descriptive text below the title. */
  description?: string;
  /** Optional action element (e.g. a button) rendered below the description. */
  action?: ReactNode;
  /** Additional CSS class names. */
  className?: string;
}
