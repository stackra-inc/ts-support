/**
 * @fileoverview Built-in keyboard shortcuts aggregator
 *
 * Imports all individual shortcut sets and re-exports the
 * combined BUILT_IN_SHORTCUTS array and BUILT_IN_GROUPS.
 *
 * @module shortcuts
 */

import { ArrowRight, Search, Save, Maximize, HelpCircle, X } from 'lucide-react';
import type { KeyboardShortcut } from '@/interfaces/keyboard-shortcut.interface';
import { NAVIGATION_SHORTCUTS } from './navigation.shortcut';
import { SEARCH_SHORTCUTS } from './search.shortcut';
import { EDITING_SHORTCUTS } from './editing.shortcut';
import { VIEW_SHORTCUTS } from './view.shortcut';
import { HELP_SHORTCUTS } from './help.shortcut';
import { MODAL_SHORTCUTS } from './modal.shortcut';

export { NAVIGATION_SHORTCUTS } from './navigation.shortcut';
export { SEARCH_SHORTCUTS } from './search.shortcut';
export { EDITING_SHORTCUTS } from './editing.shortcut';
export { VIEW_SHORTCUTS } from './view.shortcut';
export { HELP_SHORTCUTS } from './help.shortcut';
export { MODAL_SHORTCUTS } from './modal.shortcut';

/**
 * All built-in shortcuts
 */
export const BUILT_IN_SHORTCUTS: KeyboardShortcut[] = [
  ...NAVIGATION_SHORTCUTS,
  ...SEARCH_SHORTCUTS,
  ...EDITING_SHORTCUTS,
  ...VIEW_SHORTCUTS,
  ...HELP_SHORTCUTS,
  ...MODAL_SHORTCUTS,
];

/**
 * Built-in shortcut groups
 */
export const BUILT_IN_GROUPS = [
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'Navigate through the application',
    icon: ArrowRight,
    order: 1,
    shortcuts: NAVIGATION_SHORTCUTS,
  },
  {
    id: 'search',
    name: 'Search',
    description: 'Search and find content',
    icon: Search,
    order: 2,
    shortcuts: SEARCH_SHORTCUTS,
  },
  {
    id: 'editing',
    name: 'Editing',
    description: 'Edit and modify content',
    icon: Save,
    order: 3,
    shortcuts: EDITING_SHORTCUTS,
  },
  {
    id: 'view',
    name: 'View',
    description: 'Control the view and layout',
    icon: Maximize,
    order: 4,
    shortcuts: VIEW_SHORTCUTS,
  },
  {
    id: 'help',
    name: 'Help',
    description: 'Get help and documentation',
    icon: HelpCircle,
    order: 5,
    shortcuts: HELP_SHORTCUTS,
  },
  {
    id: 'modals',
    name: 'Modals & Dialogs',
    description: 'Interact with modals and dialogs',
    icon: X,
    order: 6,
    shortcuts: MODAL_SHORTCUTS,
  },
];
