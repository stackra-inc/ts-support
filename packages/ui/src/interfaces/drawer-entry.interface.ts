/**
 * @fileoverview DrawerEntry interface — a single entry in the drawer stack.
 *
 * Represents a drawer that has been pushed onto the stack, including
 * its configuration, rendered component, and tracking metadata.
 *
 * @module drawer-stack/interfaces/drawer-entry
 */

import type { ReactNode } from 'react';
import type { DrawerConfig } from './drawer-config.interface';

/**
 * A single entry in the drawer stack.
 *
 * Created when `operations.push()` is called. Contains the drawer's
 * configuration, the React component to render, and internal tracking data.
 *
 * @template TId - String literal type for the drawer identifier.
 */
export interface DrawerEntry<TId extends string = string> {
  /**
   * Unique instance key (UUID) for React key and internal tracking.
   * Different from `config.id` — multiple instances of the same drawer
   * type would have the same `config.id` but different `instanceId`s
   * (unless singleton mode is enabled).
   */
  instanceId: string;

  /**
   * The drawer configuration that was passed when pushing this entry.
   */
  config: DrawerConfig<TId>;

  /**
   * The React node to render inside the drawer panel.
   * This is the content passed as the second argument to `operations.push()`.
   */
  component: ReactNode;

  /**
   * The DOM element that had focus when this drawer was opened.
   * Used for focus restoration when the drawer is closed.
   * Captured automatically from `document.activeElement` at push time.
   */
  triggerElement: Element | null;
}
