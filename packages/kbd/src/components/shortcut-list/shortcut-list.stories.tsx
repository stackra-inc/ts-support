/**
 * @fileoverview Storybook stories for ShortcutList component
 *
 * This file contains interactive examples and documentation for the ShortcutList component.
 *
 * @module @abdokouta/kbd
 * @category Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ShortcutList } from './shortcut-list.component';
import { shortcutRegistry } from '@/registries/shortcut.registry';
import { BUILT_IN_SHORTCUTS, BUILT_IN_GROUPS } from '@/shortcuts/built-in-shortcuts';
import { useEffect } from 'react';

/**
 * ShortcutList Component Stories
 *
 * The ShortcutList component displays a searchable, filterable list of keyboard shortcuts
 * from the registry, with support for grouping by category or context.
 */
const meta: Meta<typeof ShortcutList> = {
  title: 'Components/ShortcutList',
  component: ShortcutList,
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
    category: {
      description: 'Filter shortcuts by category',
      control: 'select',
      options: ['navigation', 'editing', 'search', 'view', 'help', 'custom'],
    },
    context: {
      description: 'Filter shortcuts by context',
      control: 'select',
      options: ['global', 'editor', 'list', 'modal', 'form', 'custom'],
    },
    showSearch: {
      description: 'Show search input',
      control: 'boolean',
    },
    groupByCategory: {
      description: 'Group shortcuts by category',
      control: 'boolean',
    },
    showDisabled: {
      description: 'Show disabled shortcuts',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ShortcutList>;

/**
 * Default ShortcutList
 *
 * Basic usage showing all shortcuts with search.
 */
export const Default: Story = {
  args: {
    showSearch: true,
    groupByCategory: false,
    showDisabled: false,
  },
};

/**
 * Grouped by Category
 *
 * Display shortcuts grouped by their category.
 */
export const GroupedByCategory: Story = {
  args: {
    showSearch: true,
    groupByCategory: true,
    showDisabled: false,
  },
};

/**
 * Navigation Shortcuts Only
 *
 * Filter to show only navigation shortcuts.
 */
export const NavigationOnly: Story = {
  args: {
    category: 'navigation',
    showSearch: false,
    groupByCategory: false,
  },
};

/**
 * Search Shortcuts Only
 *
 * Filter to show only search shortcuts.
 */
export const SearchOnly: Story = {
  args: {
    category: 'search',
    showSearch: false,
    groupByCategory: false,
  },
};

/**
 * Editing Shortcuts Only
 *
 * Filter to show only editing shortcuts.
 */
export const EditingOnly: Story = {
  args: {
    category: 'editing',
    showSearch: false,
    groupByCategory: false,
  },
};

/**
 * Global Context Only
 *
 * Filter to show only global context shortcuts.
 */
export const GlobalContextOnly: Story = {
  args: {
    context: 'global',
    showSearch: true,
    groupByCategory: true,
  },
};

/**
 * Modal Context Only
 *
 * Filter to show only modal context shortcuts.
 */
export const ModalContextOnly: Story = {
  args: {
    context: 'modal',
    showSearch: false,
    groupByCategory: false,
  },
};

/**
 * Without Search
 *
 * Display shortcuts without the search input.
 */
export const WithoutSearch: Story = {
  args: {
    showSearch: false,
    groupByCategory: false,
  },
};

/**
 * Custom Styling
 *
 * Apply custom CSS classes to the list.
 */
export const CustomStyling: Story = {
  args: {
    showSearch: true,
    groupByCategory: false,
    className: 'custom-shortcut-list',
    itemClassName: 'custom-shortcut-item',
  },
  render: (args) => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <style>{`
        .custom-shortcut-list {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
        }
        .custom-shortcut-item {
          background: white;
          margin-bottom: 0.5rem;
          border-radius: 0.375rem;
        }
      `}</style>
      <ShortcutList {...args} />
    </div>
  ),
};

/**
 * In Sidebar
 *
 * Display shortcuts in a sidebar layout.
 */
export const InSidebar: Story = {
  render: () => (
    <div style={{ display: 'flex', height: '600px' }}>
      <div
        style={{
          width: '300px',
          borderRight: '1px solid #e5e7eb',
          padding: '1rem',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Keyboard Shortcuts</h3>
        <ShortcutList groupByCategory showSearch={false} />
      </div>
      <div style={{ flex: 1, padding: '1rem' }}>
        <h2>Main Content</h2>
        <p>Your application content goes here.</p>
      </div>
    </div>
  ),
};

/**
 * Compact View
 *
 * Display shortcuts in a compact view.
 */
export const CompactView: Story = {
  args: {
    showSearch: false,
    groupByCategory: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '400px' }}>
      <ShortcutList {...args} />
    </div>
  ),
};
