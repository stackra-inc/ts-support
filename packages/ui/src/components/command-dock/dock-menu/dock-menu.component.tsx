/**
 * @fileoverview DockMenu — expanded categorized action grid above the dock bar.
 *
 * Opens above the dock bar when the user clicks the expand chevron.
 * Displays all non-primary actions grouped by category in a 3-column grid.
 * Closes on outside click, Escape key, or action selection.
 *
 * @module command-dock/components/dock-menu
 */

import React, { useEffect, useRef } from 'react';
import { useCommandDock } from '@/hooks';
import { groupByCategory } from '@/utils';
import { MENU_MS, DOCK_SLOTS } from '@/constants';
import { Slot } from '@/components/slot';

/**
 * Expanded action menu rendered above the dock bar.
 *
 * @example
 * ```tsx
 * <DockMenu />
 * ```
 */
export function DockMenu(): React.JSX.Element | null {
  const { actions, categories, isMenuOpen, closeMenu } = useCommandDock();

  const menuRef = useRef<HTMLDivElement>(null);

  // ── Close on outside click / Escape ──
  useEffect(() => {
    if (!isMenuOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen, closeMenu]);

  const grouped = groupByCategory(actions, categories);

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[380px]"
      style={{
        transition: `opacity ${MENU_MS}ms ease, transform ${MENU_MS}ms ease`,
        opacity: isMenuOpen ? 1 : 0,
        transform: `translateY(${isMenuOpen ? 0 : 8}px)`,
        pointerEvents: isMenuOpen ? 'auto' : 'none',
      }}
      role="menu"
      aria-label="All Actions"
    >
      <div className="bg-surface border border-separator rounded-2xl shadow-2xl p-4 space-y-3">
        {/* Menu header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">All Actions</p>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-secondary text-muted border border-separator">
            esc
          </kbd>
        </div>

        <Slot name={DOCK_SLOTS.MENU.BEFORE} />

        {/* Category groups */}
        {Array.from(grouped.entries()).map(([catId, catActions]) => {
          const category = categories.find((c) => c.id === catId);
          if (!category) return null;

          return (
            <div key={catId}>
              <Slot name={DOCK_SLOTS.MENU.BEFORE_CATEGORY} />
              <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                {category.icon}
                {category.label}
              </p>
              <div className="grid grid-cols-3 gap-1">
                {catActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    role="menuitem"
                    disabled={action.disabled}
                    onClick={() => {
                      action.onPress();
                      closeMenu();
                    }}
                    className={[
                      'flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors text-left',
                      action.danger
                        ? 'text-danger hover:bg-danger/10'
                        : 'text-foreground hover:bg-surface-secondary',
                      action.disabled && 'opacity-40 pointer-events-none',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className="text-muted shrink-0">{action.icon}</span>
                    <span className="truncate">{action.label}</span>
                  </button>
                ))}
              </div>
              <Slot name={DOCK_SLOTS.MENU.AFTER_CATEGORY} />
            </div>
          );
        })}

        <Slot name={DOCK_SLOTS.MENU.AFTER} />
      </div>
    </div>
  );
}
