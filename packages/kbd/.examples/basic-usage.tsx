/**
 * Basic usage examples for @abdokouta/kbd
 *
 * This file demonstrates various ways to use the Kbd component
 * in your refine application.
 */

import React from 'react';
import { RefineKbd, Kbd, useKeyboardShortcut } from '@abdokouta/kbd';

/**
 * Example 1: Simple keyboard shortcut display
 */
export const SimpleExample = () => {
  return (
    <div>
      <p>
        Press <RefineKbd keys={['command', 'K']} /> to open search
      </p>
    </div>
  );
};

/**
 * Example 2: Multiple keyboard shortcuts
 */
export const MultipleShortcutsExample = () => {
  return (
    <div className="space-y-2">
      <p>
        Save: <RefineKbd keys={['command', 'S']} />
      </p>
      <p>
        Copy: <RefineKbd keys={['command', 'C']} />
      </p>
      <p>
        Paste: <RefineKbd keys={['command', 'V']} />
      </p>
      <p>
        Undo: <RefineKbd keys={['command', 'Z']} />
      </p>
    </div>
  );
};

/**
 * Example 3: Navigation keys
 */
export const NavigationExample = () => {
  return (
    <div className="space-y-2">
      <p>
        Navigate: <RefineKbd keys={['up']} /> <RefineKbd keys={['down']} />{' '}
        <RefineKbd keys={['left']} /> <RefineKbd keys={['right']} />
      </p>
      <p>
        Page Up: <RefineKbd keys={['pageup']} />
      </p>
      <p>
        Page Down: <RefineKbd keys={['pagedown']} />
      </p>
    </div>
  );
};

/**
 * Example 4: Light variant
 */
export const LightVariantExample = () => {
  return (
    <div className="space-y-2">
      <p>
        Default: <RefineKbd keys={['command', 'K']} />
      </p>
      <p>
        Light: <RefineKbd keys={['command', 'K']} variant="light" />
      </p>
    </div>
  );
};

/**
 * Example 5: Custom separator
 */
export const CustomSeparatorExample = () => {
  return (
    <div className="space-y-2">
      <p>
        Default separator: <RefineKbd keys={['ctrl', 'shift', 'P']} />
      </p>
      <p>
        Custom separator: <RefineKbd keys={['ctrl', 'shift', 'P']} separator=" + " />
      </p>
      <p>
        Arrow separator: <RefineKbd keys={['ctrl', 'shift', 'P']} separator=" → " />
      </p>
    </div>
  );
};

/**
 * Example 6: Using the base Kbd component directly
 */
export const DirectKbdExample = () => {
  return (
    <div>
      <p>
        Press{' '}
        <Kbd>
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>K</Kbd.Content>
        </Kbd>{' '}
        to open search
      </p>
    </div>
  );
};

/**
 * Example 7: Keyboard shortcut with hook
 */
export const KeyboardShortcutHookExample = () => {
  const [count, setCount] = React.useState(0);

  // Register keyboard shortcut
  useKeyboardShortcut({
    keys: ['command', 'K'],
    callback: () => {
      setCount((prev) => prev + 1);
      console.log('Command+K pressed!');
    },
  });

  return (
    <div>
      <p>
        Press <RefineKbd keys={['command', 'K']} /> to increment counter
      </p>
      <p>Count: {count}</p>
    </div>
  );
};

/**
 * Example 8: Conditional keyboard shortcut
 */
export const ConditionalShortcutExample = () => {
  const [isEnabled, setIsEnabled] = React.useState(true);
  const [message, setMessage] = React.useState('');

  useKeyboardShortcut({
    keys: ['command', 'S'],
    callback: () => {
      setMessage('Saved!');
      setTimeout(() => setMessage(''), 2000);
    },
    enabled: isEnabled,
  });

  return (
    <div className="space-y-2">
      <p>
        Press <RefineKbd keys={['command', 'S']} /> to save
      </p>
      <button onClick={() => setIsEnabled(!isEnabled)}>
        {isEnabled ? 'Disable' : 'Enable'} Shortcut
      </button>
      {message && <p className="text-green-600">{message}</p>}
    </div>
  );
};

/**
 * Example 9: Keyboard shortcuts documentation panel
 */
export const ShortcutsDocumentationExample = () => {
  return (
    <div className="rounded-lg bg-surface p-4">
      <h3 className="mb-4 text-lg font-semibold">Keyboard Shortcuts</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Open search</span>
          <RefineKbd keys={['command', 'K']} />
        </div>
        <div className="flex items-center justify-between">
          <span>Toggle sidebar</span>
          <RefineKbd keys={['command', 'B']} />
        </div>
        <div className="flex items-center justify-between">
          <span>New file</span>
          <RefineKbd keys={['command', 'N']} />
        </div>
        <div className="flex items-center justify-between">
          <span>Save</span>
          <RefineKbd keys={['command', 'S']} />
        </div>
        <div className="flex items-center justify-between">
          <span>Close tab</span>
          <RefineKbd keys={['command', 'W']} />
        </div>
      </div>
    </div>
  );
};

/**
 * Example 10: Complex keyboard combinations
 */
export const ComplexCombinationsExample = () => {
  return (
    <div className="space-y-2">
      <p>
        Redo: <RefineKbd keys={['command', 'shift', 'Z']} />
      </p>
      <p>
        Force quit: <RefineKbd keys={['command', 'option', 'escape']} />
      </p>
      <p>
        Screenshot: <RefineKbd keys={['command', 'shift', '4']} />
      </p>
    </div>
  );
};
