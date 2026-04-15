/**
 * @fileoverview Navigation keyboard shortcuts
 *
 * Shortcuts for navigating through the application including
 * back, forward, and home navigation.
 *
 * @module shortcuts/navigation
 */

import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import type { KeyboardShortcut } from '@/interfaces/keyboard-shortcut.interface';
import { SHORTCUT_CATEGORIES, SHORTCUT_CONTEXTS } from '@/constants';

/**
 * Built-in Navigation Shortcuts
 */
export const NAVIGATION_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: 'navigation.go-back',
    name: 'Go Back',
    description: 'Navigate to the previous page',
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', '['],
      windows: ['alt', 'left'],
      linux: ['alt', 'left'],
      default: ['alt', 'left'],
    },
    callback: () => {
      window.history.back();
    },
    icon: ArrowLeft,
    group: 'Navigation',
    order: 1,
  },
  {
    id: 'navigation.go-forward',
    name: 'Go Forward',
    description: 'Navigate to the next page',
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', ']'],
      windows: ['alt', 'right'],
      linux: ['alt', 'right'],
      default: ['alt', 'right'],
    },
    callback: () => {
      window.history.forward();
    },
    icon: ArrowRight,
    group: 'Navigation',
    order: 2,
  },
  {
    id: 'navigation.go-home',
    name: 'Go Home',
    description: 'Navigate to the home page',
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    context: SHORTCUT_CONTEXTS.GLOBAL,
    keys: {
      mac: ['command', 'shift', 'H'],
      windows: ['ctrl', 'shift', 'H'],
      linux: ['ctrl', 'shift', 'H'],
      default: ['ctrl', 'shift', 'H'],
    },
    callback: () => {
      window.location.href = '/';
    },
    icon: Home,
    group: 'Navigation',
    order: 3,
  },
];
