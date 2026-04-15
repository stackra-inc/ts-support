/**
 * @fileoverview CommandDockProvider — context provider for the command dock.
 *
 * Manages dock state: actions, zone, expanded/menu state, drawer detection.
 * Wraps children with `CommandDockContext` so descendant components can
 * consume dock state via `useCommandDock`.
 *
 * @module command-dock/providers/command-dock
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { CommandDockContext } from '@/contexts/command-dock';
import { DOCK_DEFAULTS } from '@/constants';
import { useIsDrawerOpen } from '@/hooks';
import type { DockConfig } from '@/interfaces';
import type { DockAction } from '@/interfaces';
import type { DockContextValue } from '@/interfaces';
import type { DockZone } from '@/types';

// ─── Props ─────────────────────────────────────────────────────────

/**
 * Props for the `CommandDockProvider` component.
 */
export interface CommandDockProviderProps {
  /** Dock configuration. */
  config: DockConfig;

  /** Child components that can consume the dock context. */
  children: ReactNode;
}

// ─── Provider ──────────────────────────────────────────────────────

/**
 * Context provider for the command dock system.
 *
 * Resolves actions, manages expand/menu state, detects drawer presence,
 * and exposes imperative methods for runtime updates.
 *
 * @example
 * ```tsx
 * <CommandDockProvider config={{ actions, categories, zone: "default" }}>
 *   <CommandDock />
 * </CommandDockProvider>
 * ```
 */
export function CommandDockProvider({
  config,
  children,
}: CommandDockProviderProps): React.JSX.Element {
  // ── State ──
  const [actions, setActions] = useState<DockAction[]>(config.actions);
  const [zone, setZone] = useState<DockZone>(config.zone ?? DOCK_DEFAULTS.ZONE);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(config.anchorRect ?? null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /** Drawer detection via DOM observer. */
  const isDrawerOpen = useIsDrawerOpen();

  /** Hover debounce timer ref. */
  const hoverTimer = useRef<number>(0);

  // ── Sync config changes ──
  useEffect(() => {
    setActions(config.actions);
  }, [config.actions]);

  useEffect(() => {
    if (config.zone !== undefined) setZone(config.zone);
  }, [config.zone]);

  useEffect(() => {
    if (config.anchorRect !== undefined) setAnchorRect(config.anchorRect ?? null);
  }, [config.anchorRect]);

  // ── Collapse when drawer opens ──
  useEffect(() => {
    if (isDrawerOpen && (config.hideOnDrawerOpen ?? DOCK_DEFAULTS.HIDE_ON_DRAWER_OPEN)) {
      setIsExpanded(false);
      setIsMenuOpen(false);
    }
  }, [isDrawerOpen, config.hideOnDrawerOpen]);

  // ── Collapse when zone changes ──
  useEffect(() => {
    setIsExpanded(false);
    setIsMenuOpen(false);
  }, [zone]);

  // ── Derived values ──

  /** Visible (non-hidden) actions. */
  const visibleActions = useMemo(() => actions.filter((a) => !a.hidden), [actions]);

  /** The primary action. */
  const primaryAction = useMemo(() => visibleActions.find((a) => a.primary), [visibleActions]);

  /** Quick-access actions resolved from IDs. */
  const quickActions = useMemo(() => {
    const ids = config.quickActionIds ?? [];
    return ids
      .map((id) => visibleActions.find((a) => a.id === id))
      .filter((a): a is DockAction => a !== undefined && !a.primary)
      .slice(0, DOCK_DEFAULTS.MAX_QUICK_ACTIONS);
  }, [visibleActions, config.quickActionIds]);

  // ── Methods ──

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const setExpandedWithDebounce = useCallback((expanded: boolean) => {
    window.clearTimeout(hoverTimer.current);
    if (expanded) {
      setIsExpanded(true);
    } else {
      hoverTimer.current = window.setTimeout(() => {
        setIsExpanded(false);
      }, DOCK_DEFAULTS.HOVER_DEBOUNCE_MS);
    }
  }, []);

  // ── Context value ──

  const value = useMemo<DockContextValue>(
    () => ({
      actions: visibleActions,
      categories: config.categories,
      primaryAction,
      quickActions,
      zone,
      anchorRect,
      isExpanded: (isExpanded || isMenuOpen) && !isDrawerOpen,
      isMenuOpen: isMenuOpen && !isDrawerOpen,
      isDrawerOpen,
      bottomOffset: config.bottomOffset ?? DOCK_DEFAULTS.BOTTOM_OFFSET,
      toggleMenu,
      closeMenu,
      setExpanded: setExpandedWithDebounce,
      setZone,
      setAnchorRect,
      setActions,
    }),
    [
      visibleActions,
      config.categories,
      config.bottomOffset,
      primaryAction,
      quickActions,
      zone,
      anchorRect,
      isExpanded,
      isMenuOpen,
      isDrawerOpen,
      toggleMenu,
      closeMenu,
      setExpandedWithDebounce,
    ]
  );

  return <CommandDockContext.Provider value={value}>{children}</CommandDockContext.Provider>;
}
