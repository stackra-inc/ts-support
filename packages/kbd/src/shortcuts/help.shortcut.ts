/**
 * @fileoverview Help keyboard shortcuts
 *
 * Shortcuts for accessing help and documentation including
 * showing the keyboard shortcuts panel and opening help docs.
 *
 * @module shortcuts/help
 */

import { HelpCircle, BookOpen } from 'lucide-react';
import type { KeyboardShortcut } from '@/interfaces/keyboard-shortcut.interface';
import { SHORTCUT_CATEGORIES, SHORTCUT_CONTEXTS } from '@/constants';

/**
 * Built-in Help Shortcuts
 */
export const HELP_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: 'help.show-shortcuts',
    name: 'Show Keyboard Shortcuts',
    description: 'Display all available keyboard shortcuts',
    category: SHORTCUT_CATEGORIES.HELP,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', '/'],
      windows: ['ctrl', '/'],
      linux: ['ctrl', '/'],
      default: ['ctrl', '/'],
    },
    alternativeKeys: [
      {
        mac: ['command', 'shift', '?'],
        windows: ['ctrl', 'shift', '?'],
        linux: ['ctrl', 'shift', '?'],
        default: ['ctrl', 'shift', '?'],
      },
    ],
    callback: () => {
      // Placeholder - should be implemented by the application
      console.log('Show shortcuts');
    },
    icon: HelpCircle,
    group: 'Help',
    order: 1,
    priority: 'high',
  },
  {
    id: 'help.open',
    name: 'Open Help',
    description: 'Open the help documentation',
    category: SHORTCUT_CATEGORIES.HELP,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', 'shift', 'H'],
      windows: ['F1'],
      linux: ['F1'],
      default: ['F1'],
    },
    callback: () => {
      // Placeholder - should be implemented by the application
      console.log('Open help');
    },
    icon: BookOpen,
    group: 'Help',
    order: 2,
  },
];
