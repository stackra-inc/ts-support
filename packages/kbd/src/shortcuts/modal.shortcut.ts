/**
 * @fileoverview Modal/Dialog keyboard shortcuts
 *
 * Shortcuts for interacting with modals and dialogs including
 * closing and confirming modal actions.
 *
 * @module shortcuts/modal
 */

import { X, Check } from 'lucide-react';
import type { KeyboardShortcut } from '@/interfaces/keyboard-shortcut.interface';
import { SHORTCUT_CATEGORIES, SHORTCUT_CONTEXTS } from '@/constants';

/**
 * Built-in Modal/Dialog Shortcuts
 */
export const MODAL_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: 'modal.close',
    name: 'Close Modal',
    description: 'Close the current modal or dialog',
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    context: SHORTCUT_CONTEXTS.MODAL,
    keys: ['escape'],
    callback: () => {
      // Placeholder - should be implemented by the application
      console.log('Close modal');
    },
    icon: X,
    group: 'Modals',
    order: 1,
    priority: 'high',
  },
  {
    id: 'modal.confirm',
    name: 'Confirm',
    description: 'Confirm the current modal action',
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    context: SHORTCUT_CONTEXTS.MODAL,
    keys: ['enter'],
    callback: () => {
      // Placeholder - should be implemented by the application
      console.log('Confirm modal');
    },
    icon: Check,
    group: 'Modals',
    order: 2,
  },
];
