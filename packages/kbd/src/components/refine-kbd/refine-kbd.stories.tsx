/**
 * @fileoverview Storybook stories for RefineKbd component
 *
 * This file contains interactive examples and documentation for the RefineKbd component.
 *
 * @module @abdokouta/kbd
 * @category Stories
 */

import type { Meta, StoryObj } from '@storybook/react';

import { RefineKbd } from './refine-kbd.component';

/**
 * RefineKbd Component Stories
 *
 * The RefineKbd component displays keyboard shortcuts in a visually appealing way,
 * with automatic platform detection and proper accessibility attributes.
 */
const meta: Meta<typeof RefineKbd> = {
  title: 'Components/RefineKbd',
  component: RefineKbd,
  tags: ['autodocs'],
  argTypes: {
    keys: {
      description: 'Array of keyboard keys to display',
      control: 'object',
    },
    variant: {
      description: 'Visual variant of the keyboard key display',
      control: 'select',
      options: ['default', 'light'],
    },
    separator: {
      description: 'Custom separator to display between keys',
      control: 'text',
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RefineKbd>;

/**
 * Default RefineKbd
 *
 * Basic usage with a single modifier key and a regular key.
 */
export const Default: Story = {
  args: {
    keys: ['command', 'K'],
  },
};

/**
 * Multiple Modifier Keys
 *
 * Display multiple modifier keys with a regular key.
 */
export const MultipleModifiers: Story = {
  args: {
    keys: ['command', 'shift', 'P'],
  },
};

/**
 * Navigation Keys
 *
 * Display navigation keys like arrows.
 */
export const NavigationKeys: Story = {
  args: {
    keys: ['ctrl', 'left'],
  },
};

/**
 * Special Keys
 *
 * Display special keys like Enter, Escape, Tab.
 */
export const SpecialKeys: Story = {
  args: {
    keys: ['escape'],
  },
};

/**
 * Custom Separator
 *
 * Use a custom separator between keys.
 */
export const CustomSeparator: Story = {
  args: {
    keys: ['ctrl', 'alt', 'delete'],
    separator: ' + ',
  },
};

/**
 * Light Variant
 *
 * Use the light variant for different visual styling.
 */
export const LightVariant: Story = {
  args: {
    keys: ['command', 'S'],
    variant: 'light',
  },
};

/**
 * Save Shortcut
 *
 * Common save shortcut example.
 */
export const SaveShortcut: Story = {
  args: {
    keys: ['command', 'S'],
  },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span>Press</span>
      <RefineKbd {...args} />
      <span>to save</span>
    </div>
  ),
};

/**
 * Search Shortcut
 *
 * Common search shortcut example.
 */
export const SearchShortcut: Story = {
  args: {
    keys: ['command', 'K'],
  },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span>Press</span>
      <RefineKbd {...args} />
      <span>to open search</span>
    </div>
  ),
};

/**
 * Multiple Shortcuts
 *
 * Display multiple shortcuts in a list.
 */
export const MultipleShortcuts: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <RefineKbd keys={['command', 'S']} />
        <span>Save</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <RefineKbd keys={['command', 'Z']} />
        <span>Undo</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <RefineKbd keys={['command', 'shift', 'Z']} />
        <span>Redo</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <RefineKbd keys={['command', 'K']} />
        <span>Search</span>
      </div>
    </div>
  ),
};

/**
 * In Button
 *
 * Use RefineKbd inside a button.
 */
export const InButton: Story = {
  render: () => (
    <button
      style={{
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: '1px solid #ccc',
        borderRadius: '0.375rem',
        background: 'white',
        cursor: 'pointer',
      }}
    >
      <span>Save</span>
      <RefineKbd keys={['command', 'S']} />
    </button>
  ),
};

/**
 * In Menu Item
 *
 * Use RefineKbd in a menu item.
 */
export const InMenuItem: Story = {
  render: () => (
    <div
      style={{
        width: '200px',
        border: '1px solid #ccc',
        borderRadius: '0.375rem',
        overflow: 'hidden',
      }}
    >
      {[
        { label: 'Save', keys: ['command', 'S'] },
        { label: 'Undo', keys: ['command', 'Z'] },
        { label: 'Redo', keys: ['command', 'shift', 'Z'] },
        { label: 'Search', keys: ['command', 'K'] },
      ].map((item, index) => (
        <div
          key={index}
          style={{
            padding: '0.5rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: index < 3 ? '1px solid #eee' : 'none',
            cursor: 'pointer',
          }}
        >
          <span>{item.label}</span>
          <RefineKbd keys={item.keys as any} />
        </div>
      ))}
    </div>
  ),
};

/**
 * Empty Keys
 *
 * Component returns null when no keys are provided.
 */
export const EmptyKeys: Story = {
  args: {
    keys: [],
  },
};
