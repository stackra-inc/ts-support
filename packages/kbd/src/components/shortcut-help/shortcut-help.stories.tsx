/**
 * @fileoverview Storybook stories for ShortcutHelp component
 *
 * This file contains interactive examples and documentation for the ShortcutHelp component.
 *
 * @module @abdokouta/kbd
 * @category Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { ShortcutHelp } from './shortcut-help.component';
import { shortcutRegistry } from '@/registries/shortcut.registry';
import { BUILT_IN_SHORTCUTS, BUILT_IN_GROUPS } from '@/shortcuts/built-in-shortcuts';

/**
 * ShortcutHelp Component Stories
 *
 * The ShortcutHelp component displays a modal/dialog with a searchable list of all
 * keyboard shortcuts, with automatic registration of the help shortcut.
 */
const meta: Meta<typeof ShortcutHelp> = {
  title: 'Components/ShortcutHelp',
  component: ShortcutHelp,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      // Initialize KBD module with built-in shortcuts
      useEffect(() => {
        for (const s of BUILT_IN_SHORTCUTS) shortcutRegistry.register(s, { onConflict: 'skip' });
        for (const g of BUILT_IN_GROUPS) shortcutRegistry.registerGroup(g);
      }, []);

      return <Story />;
    },
  ],
  argTypes: {
    isOpen: {
      description: 'Whether the help modal is open',
      control: 'boolean',
    },
    registerShortcut: {
      description: 'Whether to register the help shortcut',
      control: 'boolean',
    },
    title: {
      description: 'Title for the help modal',
      control: 'text',
    },
    groupByCategory: {
      description: 'Whether to group shortcuts by category',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ShortcutHelp>;

/**
 * Controlled Modal
 *
 * Use ShortcutHelp as a controlled component.
 */
export const Controlled: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '0.375rem',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          Show Keyboard Shortcuts
        </button>
        <ShortcutHelp isOpen={isOpen} onClose={() => setIsOpen(false)} registerShortcut={false} />
      </>
    );
  },
};

/**
 * Grouped by Category
 *
 * Display shortcuts grouped by category.
 */
export const GroupedByCategory: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '0.375rem',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          Show Shortcuts (Grouped)
        </button>
        <ShortcutHelp
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          groupByCategory={true}
          registerShortcut={false}
        />
      </>
    );
  },
};

/**
 * Custom Title
 *
 * Use a custom title for the modal.
 */
export const CustomTitle: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '0.375rem',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          Show Help
        </button>
        <ShortcutHelp
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Available Shortcuts"
          registerShortcut={false}
        />
      </>
    );
  },
};

/**
 * With Auto Shortcut
 *
 * Automatically register the help shortcut (Cmd+/ or Ctrl+/).
 */
export const WithAutoShortcut: Story = {
  render: () => {
    return (
      <div>
        <p>
          Press <kbd>Cmd+/</kbd> (Mac) or <kbd>Ctrl+/</kbd> (Windows/Linux) to open the shortcuts
          help.
        </p>
        <ShortcutHelp registerShortcut={true} />
      </div>
    );
  },
};

/**
 * Custom Styling
 *
 * Apply custom CSS classes to the modal.
 */
export const CustomStyling: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <style>{`
          .custom-modal {
            border: 2px solid #3b82f6;
          }
          .custom-overlay {
            background-color: rgba(59, 130, 246, 0.1);
          }
        `}</style>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '0.375rem',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          Show Custom Styled Modal
        </button>
        <ShortcutHelp
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="custom-modal"
          overlayClassName="custom-overlay"
          registerShortcut={false}
        />
      </>
    );
  },
};

/**
 * In Application
 *
 * Example of using ShortcutHelp in a full application.
 */
export const InApplication: Story = {
  render: () => {
    const [helpOpen, setHelpOpen] = useState(false);

    return (
      <div style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div
          style={{
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>My Application</h1>
          <button
            onClick={() => setHelpOpen(true)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '0.375rem',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            Keyboard Shortcuts
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '1rem' }}>
          <h2>Welcome!</h2>
          <p>
            This is an example application. Click the "Keyboard Shortcuts" button in the header to
            see all available shortcuts.
          </p>
          <p>
            You can also press <kbd>Cmd+/</kbd> or <kbd>Ctrl+/</kbd> to open the shortcuts help.
          </p>
        </div>

        {/* ShortcutHelp */}
        <ShortcutHelp
          isOpen={helpOpen}
          onClose={() => setHelpOpen(false)}
          groupByCategory={true}
          registerShortcut={true}
        />
      </div>
    );
  },
};
