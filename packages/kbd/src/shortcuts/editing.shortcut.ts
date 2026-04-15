/**
 * @fileoverview Editing keyboard shortcuts
 *
 * Shortcuts for content editing actions including save, undo,
 * redo, copy, paste, and cut operations.
 *
 * @module shortcuts/editing
 */

import { Save, Undo, Redo, Copy, Clipboard, Scissors } from 'lucide-react';
import type { KeyboardShortcut } from '@/interfaces/keyboard-shortcut.interface';
import { SHORTCUT_CATEGORIES, SHORTCUT_CONTEXTS } from '@/constants';

/**
 * Built-in Editing Shortcuts
 */
export const EDITING_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: 'editing.save',
    name: 'Save',
    description: 'Save the current document or form',
    category: SHORTCUT_CATEGORIES.EDITING,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', 'S'],
      windows: ['ctrl', 'S'],
      linux: ['ctrl', 'S'],
      default: ['ctrl', 'S'],
    },
    callback: () => {
      // Placeholder - should be implemented by the application
      console.log('Save');
    },
    icon: Save,
    group: 'Editing',
    order: 1,
    priority: 'high',
  },
  {
    id: 'editing.undo',
    name: 'Undo',
    description: 'Undo the last action',
    category: SHORTCUT_CATEGORIES.EDITING,
    context: SHORTCUT_CONTEXTS.EDITOR,
    keys: {
      mac: ['command', 'Z'],
      windows: ['ctrl', 'Z'],
      linux: ['ctrl', 'Z'],
      default: ['ctrl', 'Z'],
    },
    callback: () => {
      // Placeholder - should be implemented by the application
      console.log('Undo');
    },
    allowInInput: true,
    icon: Undo,
    group: 'Editing',
    order: 2,
  },
  {
    id: 'editing.redo',
    name: 'Redo',
    description: 'Redo the last undone action',
    category: SHORTCUT_CATEGORIES.EDITING,
    context: SHORTCUT_CONTEXTS.EDITOR,
    keys: {
      mac: ['command', 'shift', 'Z'],
      windows: ['ctrl', 'Y'],
      linux: ['ctrl', 'Y'],
      default: ['ctrl', 'Y'],
    },
    alternativeKeys: [
      {
        mac: ['command', 'Y'],
        windows: ['ctrl', 'shift', 'Z'],
        linux: ['ctrl', 'shift', 'Z'],
        default: ['ctrl', 'shift', 'Z'],
      },
    ],
    callback: () => {
      // Placeholder - should be implemented by the application
      console.log('Redo');
    },
    allowInInput: true,
    icon: Redo,
    group: 'Editing',
    order: 3,
  },
  {
    id: 'editing.copy',
    name: 'Copy',
    description: 'Copy selected content',
    category: SHORTCUT_CATEGORIES.EDITING,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', 'C'],
      windows: ['ctrl', 'C'],
      linux: ['ctrl', 'C'],
      default: ['ctrl', 'C'],
    },
    callback: () => {
      // Let browser handle this
    },
    preventDefault: false,
    allowInInput: true,
    icon: Copy,
    group: 'Editing',
    order: 4,
  },
  {
    id: 'editing.paste',
    name: 'Paste',
    description: 'Paste copied content',
    category: SHORTCUT_CATEGORIES.EDITING,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', 'V'],
      windows: ['ctrl', 'V'],
      linux: ['ctrl', 'V'],
      default: ['ctrl', 'V'],
    },
    callback: () => {
      // Let browser handle this
    },
    preventDefault: false,
    allowInInput: true,
    icon: Clipboard,
    group: 'Editing',
    order: 5,
  },
  {
    id: 'editing.cut',
    name: 'Cut',
    description: 'Cut selected content',
    category: SHORTCUT_CATEGORIES.EDITING,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', 'X'],
      windows: ['ctrl', 'X'],
      linux: ['ctrl', 'X'],
      default: ['ctrl', 'X'],
    },
    callback: () => {
      // Let browser handle this
    },
    preventDefault: false,
    allowInInput: true,
    icon: Scissors,
    group: 'Editing',
    order: 6,
  },
];
