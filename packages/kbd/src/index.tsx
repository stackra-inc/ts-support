/**
 * @abdokouta/kbd
 *
 * Keyboard shortcut display component integration with HeroUI for Refine applications.
 * Provides components and utilities for displaying keyboard shortcuts in a visually
 * appealing and accessible way, fully integrated with HeroUI's design system.
 *
 * @example
 * Basic usage:
 * ```tsx
 * import { RefineKbd } from '@abdokouta/kbd';
 *
 * function MyComponent() {
 *   return (
 *     <p>
 *       Press <RefineKbd keys={['command', 'K']} /> to open search
 *     </p>
 *   );
 * }
 * ```
 *
 * @example
 * Using the keyboard shortcut hook:
 * ```tsx
 * import { RefineKbd, useKeyboardShortcut } from '@abdokouta/kbd';
 *
 * function MyComponent() {
 *   useKeyboardShortcut({
 *     keys: ['command', 'K'],
 *     callback: () => console.log('Shortcut triggered!'),
 *   });
 *
 *   return <RefineKbd keys={['command', 'K']} />;
 * }
 * ```
 *
 * @example
 * Using the shortcut registry:
 * ```tsx
 * import { shortcutRegistry, useShortcutRegistry } from '@abdokouta/kbd';
 *
 * // Register a shortcut
 * shortcutRegistry.register({
 *   id: 'search',
 *   keys: ['command', 'K'],
 *   description: 'Open search',
 *   category: 'navigation',
 * });
 *
 * // Use in component
 * function ShortcutList() {
 *   const { shortcuts } = useShortcutRegistry();
 *   return <div>{shortcuts.map(s => s.description)}</div>;
 * }
 * ```
 *
 * @module @abdokouta/kbd
 */

// ============================================================================
// Re-exports from HeroUI
// ============================================================================
export { Kbd } from '@heroui/react';

// ============================================================================
// Components
// ============================================================================
export {
  RefineKbd,
  ShortcutList,
  ShortcutHelp,
  ShortcutHint,
  KbdVisibilityProvider,
} from './components';

export type {
  ShortcutListProps,
  ShortcutHelpProps,
  ShortcutHintProps,
  KbdVisibilityProviderProps,
} from './components';

// ============================================================================
// Hooks
// ============================================================================
export {
  useKeyboardShortcut,
  useShortcut,
  useShortcuts,
  useShortcutRegistry,
  useKbdVisibility,
} from './hooks';

export type {
  UseKeyboardShortcutOptions,
  UseShortcutOptions,
  UseShortcutsOptions,
  UseShortcutRegistryReturn,
} from './hooks';

// ============================================================================
// Types
// ============================================================================
export type {
  KeyValue,
  KbdVariant,
  RefineKbdProps,
  KbdProps,
  KbdAbbrProps,
  KbdContentProps,
} from './types';

// ============================================================================
// Interfaces
// ============================================================================
export type {
  KeyboardShortcut,
  ShortcutCategory,
  ShortcutContext,
  Platform,
  PlatformKeys,
  ShortcutGroup,
  ShortcutConflict,
  ShortcutRegistrationOptions,
  ShortcutQueryOptions,
} from './interfaces';

// ============================================================================
// Registry
// ============================================================================
export { shortcutRegistry } from './registries/shortcut.registry';
export type { ShortcutRegistry } from './registries/shortcut.registry';

// ============================================================================
// Module (DI Configuration)
// ============================================================================
export { KbdModule } from './kbd.module';
export type { KbdModuleOptions } from './kbd.module';

// ============================================================================
// Constants
// ============================================================================
export * from './constants';

// ============================================================================
// Built-in Shortcuts
// ============================================================================
export {
  BUILT_IN_SHORTCUTS,
  BUILT_IN_GROUPS,
  NAVIGATION_SHORTCUTS,
  SEARCH_SHORTCUTS,
  EDITING_SHORTCUTS,
  VIEW_SHORTCUTS,
  HELP_SHORTCUTS,
  MODAL_SHORTCUTS,
} from './shortcuts/built-in-shortcuts';

// ============================================================================
// Contexts
// ============================================================================
export { KbdVisibilityContext } from './contexts/kbd-visibility.context';
export type { KbdVisibilityContextValue } from './contexts/kbd-visibility.context';

// ============================================================================
// Utilities
// ============================================================================
export { keyMappings, isKeyValue, getKeyMapping } from './utils/key-mappings.util';
