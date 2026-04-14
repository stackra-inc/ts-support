/**
 * @fileoverview Component for displaying a list of keyboard shortcuts with filtering.
 *
 * This component renders a searchable, filterable list of keyboard shortcuts
 * from the registry, with support for grouping by category or context.
 *
 * @module @abdokouta/kbd
 * @category Components
 */

import React, { useState, useMemo } from 'react';
import { RefineKbd } from '@/components/refine-kbd';
import { useShortcutRegistry } from '@/hooks/use-shortcut-registry';
import { shortcutRegistry } from '@/registries/shortcut.registry';
import type { KeyboardShortcut } from '@/interfaces/keyboard-shortcut.interface';
import { ShortcutCategory, ShortcutContext } from '@/interfaces';

/**
 * Props for the ShortcutList component.
 *
 * @category Props
 * @public
 */
export interface ShortcutListProps {
  /**
   * Filter shortcuts by category.
   */
  category?: ShortcutCategory;

  /**
   * Filter shortcuts by context.
   */
  context?: ShortcutContext;

  /**
   * Filter shortcuts by tags.
   */
  tags?: string[];

  /**
   * Whether to show a search input.
   *
   * @defaultValue true
   */
  showSearch?: boolean;

  /**
   * Whether to group shortcuts by category.
   *
   * @defaultValue false
   */
  groupByCategory?: boolean;

  /**
   * Whether to show disabled shortcuts.
   *
   * @defaultValue false
   */
  showDisabled?: boolean;

  /**
   * Custom render function for each shortcut item.
   */
  renderItem?: (shortcut: KeyboardShortcut) => React.ReactNode;

  /**
   * Additional CSS classes for the container.
   */
  className?: string;

  /**
   * Additional CSS classes for each item.
   */
  itemClassName?: string;
}

/**
 * Component for displaying a list of keyboard shortcuts.
 *
 * This component provides a searchable, filterable list of shortcuts
 * with support for grouping and custom rendering.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <ShortcutList />
 * ```
 *
 * @example
 * Filtered by category:
 * ```tsx
 * <ShortcutList category="navigation" />
 * ```
 *
 * @example
 * Grouped by category:
 * ```tsx
 * <ShortcutList groupByCategory showSearch />
 * ```
 *
 * @example
 * Custom rendering:
 * ```tsx
 * <ShortcutList
 *   renderItem={(shortcut) => (
 *     <div>
 *       <strong>{shortcut.name}</strong>
 *       <RefineKbd keys={shortcut.keys} />
 *     </div>
 *   )}
 * />
 * ```
 *
 * @param props - Component props
 * @returns A rendered list of keyboard shortcuts
 *
 * @category Components
 * @public
 */
export const ShortcutList: React.FC<ShortcutListProps> = ({
  category,
  context,
  tags,
  showSearch = true,
  groupByCategory = false,
  showDisabled = false,
  renderItem,
  className,
  itemClassName,
}) => {
  const registry = useShortcutRegistry();
  const [searchQuery, setSearchQuery] = useState('');

  // Get filtered shortcuts
  const shortcuts = useMemo(() => {
    let result = registry.query({
      category,
      context,
      tags,
      enabled: showDisabled ? undefined : true,
    });

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (shortcut) =>
          shortcut.name.toLowerCase().includes(query) ||
          shortcut.description?.toLowerCase().includes(query) ||
          shortcut.id.toLowerCase().includes(query) ||
          shortcut.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [registry, category, context, tags, showDisabled, searchQuery]);

  // Group shortcuts by category if requested
  const groupedShortcuts = useMemo(() => {
    if (!groupByCategory) return { all: shortcuts };

    const groups: Record<string, KeyboardShortcut[]> = {};
    shortcuts.forEach((shortcut) => {
      const cat = shortcut.category || 'other';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(shortcut);
    });

    return groups;
  }, [shortcuts, groupByCategory]);

  // Default item renderer
  const defaultRenderItem = (shortcut: KeyboardShortcut) => {
    // Resolve platform-specific keys
    const resolvedKeys = shortcutRegistry.resolveKeys(shortcut.keys);

    return (
      <div
        key={shortcut.id}
        className={itemClassName}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem',
          borderBottom: '1px solid var(--color-border, #e5e7eb)',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{shortcut.name}</div>
          {shortcut.description && (
            <div
              style={{ fontSize: '0.875rem', color: 'var(--color-foreground-secondary, #6b7280)' }}
            >
              {shortcut.description}
            </div>
          )}
        </div>
        <RefineKbd keys={resolvedKeys} />
      </div>
    );
  };

  const itemRenderer = renderItem || defaultRenderItem;

  return (
    <div className={className} style={{ width: '100%' }}>
      {showSearch && (
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
            }}
          />
        </div>
      )}

      {groupByCategory ? (
        Object.entries(groupedShortcuts).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: '1.5rem' }}>
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--color-foreground-secondary, #6b7280)',
                marginBottom: '0.5rem',
              }}
            >
              {cat}
            </h3>
            <div
              style={{
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: '0.375rem',
                overflow: 'hidden',
              }}
            >
              {items.map(itemRenderer)}
            </div>
          </div>
        ))
      ) : (
        <div
          style={{
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '0.375rem',
            overflow: 'hidden',
          }}
        >
          {shortcuts.length > 0 ? (
            shortcuts.map(itemRenderer)
          ) : (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--color-foreground-secondary, #6b7280)',
              }}
            >
              No shortcuts found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ShortcutList.displayName = 'ShortcutList';
