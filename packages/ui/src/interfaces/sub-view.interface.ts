/**
 * @fileoverview Sub-view interfaces — types for the internal sub-view navigator.
 *
 * The sub-view navigator allows a single drawer to have multiple
 * internal views with stack-based navigation (goTo/goBack).
 *
 * @module drawer-stack/interfaces/sub-view
 */

import type { ReactNode } from 'react';

/**
 * Props for the SubViewNavigator component.
 *
 * @template TView - String literal union of view identifiers.
 *
 * @example
 * ```tsx
 * <SubViewNavigator
 *   initialView="list"
 *   views={{ list: <ListView />, detail: <DetailView /> }}
 *   onViewChange={(id) => console.log("View changed:", id)}
 * />
 * ```
 */
export interface SubViewNavigatorProps<TView extends string = string> {
  /** The view id to show when the drawer first opens. */
  initialView: TView;

  /** Map of view ids to their React node content. */
  views: Record<TView, ReactNode>;

  /** Optional callback fired when the active view changes. */
  onViewChange?: (viewId: TView) => void;

  /** Optional children rendered below the view content (e.g. footer). */
  children?: ReactNode;
}

/**
 * Context value for the sub-view navigator.
 *
 * Provides the current view state and navigation operations
 * to child components via `useSubView()`.
 *
 * @template TView - String literal union of view identifiers.
 */
export interface SubViewContextValue<TView extends string = string> {
  /** The currently active view id. */
  currentView: TView;

  /** Full history stack of visited views (bottom = first, top = current). */
  viewHistory: ReadonlyArray<TView>;

  /** Whether there are previous views to go back to. */
  canGoBack: boolean;

  /** Navigate forward to a new view (pushes onto the view stack). */
  goTo: (viewId: TView) => void;

  /** Navigate back to the previous view (pops the view stack). */
  goBack: () => void;
}
