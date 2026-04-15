/**
 * @fileoverview Supported keyboard key values for the Kbd component
 *
 * These values represent common keyboard keys including modifiers,
 * navigation, and special keys.
 *
 * @module types/KeyValue
 */

/**
 * Supported keyboard key values for the Kbd component.
 * These values represent common keyboard keys including modifiers, navigation, and special keys.
 *
 * @category Types
 * @public
 */
export type KeyValue =
  // Modifier keys
  | 'command'
  | 'shift'
  | 'ctrl'
  | 'option'
  | 'alt'
  | 'win'
  // Special keys
  | 'enter'
  | 'delete'
  | 'escape'
  | 'tab'
  | 'space'
  | 'capslock'
  | 'help'
  | 'fn'
  // Navigation keys
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'pageup'
  | 'pagedown'
  | 'home'
  | 'end';
