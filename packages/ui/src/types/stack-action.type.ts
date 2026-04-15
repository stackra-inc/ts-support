/**
 * @fileoverview StackAction — discriminated union of all stack reducer actions.
 *
 * Used internally by the DrawerStackProvider's useReducer to handle
 * all possible state transitions for the drawer stack.
 *
 * @module drawer-stack/types/stack-action
 */

import type { ReactNode } from 'react';
import type { DrawerEntry } from '@/interfaces';

/**
 * Discriminated union of all actions the stack reducer can process.
 *
 * @template TId - String literal type for drawer identifiers.
 *
 * | Action        | Description                                      |
 * |---------------|--------------------------------------------------|
 * | `PUSH`        | Add a new drawer to the top of the stack.        |
 * | `POP`         | Remove the topmost drawer.                       |
 * | `REPLACE`     | Replace the topmost drawer with a new one.       |
 * | `UPDATE`      | Update the component of an existing drawer.      |
 * | `CLEAR`       | Remove all drawers from the stack.               |
 * | `POP_TO`      | Pop all drawers above the specified id.          |
 * | `BRING_TO_TOP`| Move an existing drawer to the top of the stack. |
 */
export type StackAction<TId extends string = string> =
  | { type: 'PUSH'; entry: DrawerEntry<TId> }
  | { type: 'POP' }
  | { type: 'REPLACE'; entry: DrawerEntry<TId> }
  | { type: 'UPDATE'; id: TId; component: ReactNode }
  | { type: 'CLEAR' }
  | { type: 'POP_TO'; id: TId }
  | { type: 'BRING_TO_TOP'; id: TId };
