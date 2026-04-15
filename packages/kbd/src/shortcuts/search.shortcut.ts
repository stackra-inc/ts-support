/**
 * @fileoverview Search keyboard shortcuts
 *
 * Shortcuts for search-related actions including opening
 * the global search dialog and finding content in page.
 *
 * @module shortcuts/search
 */

import { Search, FileSearch } from 'lucide-react';
import type { KeyboardShortcut } from '@/interfaces/keyboard-shortcut.interface';
import { SHORTCUT_CATEGORIES, SHORTCUT_CONTEXTS } from '@/constants';

/**
 * Built-in Search Shortcuts
 */
export const SEARCH_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: 'search.open',
    name: 'Open Search',
    description: 'Open the global search dialog',
    category: SHORTCUT_CATEGORIES.SEARCH,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', 'K'],
      windows: ['ctrl', 'K'],
      linux: ['ctrl', 'K'],
      default: ['ctrl', 'K'],
    },
    alternativeKeys: [
      {
        mac: ['command', '/'],
        windows: ['ctrl', '/'],
        linux: ['ctrl', '/'],
        default: ['ctrl', '/'],
      },
    ],
    callback: () => {
      // Placeholder - should be implemented by the application
      console.log('Open search');
    },
    icon: Search,
    group: 'Search',
    order: 1,
    priority: 'high',
  },
  {
    id: 'search.find-in-page',
    name: 'Find in Page',
    description: 'Search within the current page',
    category: SHORTCUT_CATEGORIES.SEARCH,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', 'F'],
      windows: ['ctrl', 'F'],
      linux: ['ctrl', 'F'],
      default: ['ctrl', 'F'],
    },
    callback: () => {
      // Let browser handle this
    },
    preventDefault: false,
    icon: FileSearch,
    group: 'Search',
    order: 2,
  },
];
