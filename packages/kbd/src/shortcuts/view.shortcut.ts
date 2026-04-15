/**
 * @fileoverview View keyboard shortcuts
 *
 * Shortcuts for controlling the application view and layout
 * including sidebar toggle, fullscreen, and zoom controls.
 *
 * @module shortcuts/view
 */

import { PanelLeft, Maximize, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { KeyboardShortcut } from '@/interfaces/keyboard-shortcut.interface';
import { SHORTCUT_CATEGORIES, SHORTCUT_CONTEXTS } from '@/constants';

/**
 * Built-in View Shortcuts
 */
export const VIEW_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: 'view.toggle-sidebar',
    name: 'Toggle Sidebar',
    description: 'Show or hide the sidebar',
    category: SHORTCUT_CATEGORIES.VIEW,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', 'B'],
      windows: ['ctrl', 'B'],
      linux: ['ctrl', 'B'],
      default: ['ctrl', 'B'],
    },
    callback: () => {
      // Placeholder - should be implemented by the application
      console.log('Toggle sidebar');
    },
    icon: PanelLeft,
    group: 'View',
    order: 1,
  },
  {
    id: 'view.toggle-fullscreen',
    name: 'Toggle Fullscreen',
    description: 'Enter or exit fullscreen mode',
    category: SHORTCUT_CATEGORIES.VIEW,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', 'ctrl', 'F'],
      windows: ['F11'],
      linux: ['F11'],
      default: ['F11'],
    },
    callback: () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    },
    icon: Maximize,
    group: 'View',
    order: 2,
  },
  {
    id: 'view.zoom-in',
    name: 'Zoom In',
    description: 'Increase zoom level',
    category: SHORTCUT_CATEGORIES.VIEW,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', '+'],
      windows: ['ctrl', '+'],
      linux: ['ctrl', '+'],
      default: ['ctrl', '+'],
    },
    alternativeKeys: [
      {
        mac: ['command', '='],
        windows: ['ctrl', '='],
        linux: ['ctrl', '='],
        default: ['ctrl', '='],
      },
    ],
    callback: () => {
      // Let browser handle this
    },
    preventDefault: false,
    icon: ZoomIn,
    group: 'View',
    order: 3,
  },
  {
    id: 'view.zoom-out',
    name: 'Zoom Out',
    description: 'Decrease zoom level',
    category: SHORTCUT_CATEGORIES.VIEW,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', '-'],
      windows: ['ctrl', '-'],
      linux: ['ctrl', '-'],
      default: ['ctrl', '-'],
    },
    callback: () => {
      // Let browser handle this
    },
    preventDefault: false,
    icon: ZoomOut,
    group: 'View',
    order: 4,
  },
  {
    id: 'view.reset-zoom',
    name: 'Reset Zoom',
    description: 'Reset zoom to 100%',
    category: SHORTCUT_CATEGORIES.VIEW,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', '0'],
      windows: ['ctrl', '0'],
      linux: ['ctrl', '0'],
      default: ['ctrl', '0'],
    },
    callback: () => {
      // Let browser handle this
    },
    preventDefault: false,
    icon: RotateCcw,
    group: 'View',
    order: 5,
  },
];
