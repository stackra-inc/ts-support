/**
 * @fileoverview Dock — composite namespace for all dock sub-components.
 *
 * Usage:
 * ```tsx
 * <Dock.Provider config={config}>
 *   <Dock.Container />
 * </Dock.Provider>
 * ```
 *
 * Or access individual sub-components:
 * ```tsx
 * <Dock.Bar />
 * <Dock.Menu />
 * <Dock.Button icon={...} label="..." onPress={...} />
 * <Dock.PrimaryCTA action={primaryAction} />
 * <Dock.Separator visible={true} />
 * ```
 *
 * @module command-dock/components/dock
 */

import { CommandDockProvider } from '@/providers/command-dock';
import { DockContainer } from '@/components/command-dock/dock-container';
import { DockBar } from '@/components/command-dock/dock-bar';
import { DockMenu } from '@/components/command-dock/dock-menu';
import { DockButton } from '@/components/command-dock/dock-button';
import { DockPrimaryCTA } from '@/components/command-dock/dock-primary-cta';
import { DockSeparator } from '@/components/command-dock/dock-separator';

/**
 * Composite Dock namespace — access all dock sub-components via dot notation.
 *
 * @example
 * ```tsx
 * <Dock.Provider config={config}>
 *   <App />
 *   <Dock.Container />
 * </Dock.Provider>
 * ```
 */
export const Dock = {
  /** Context provider — wraps the app and provides dock state. */
  Provider: CommandDockProvider,
  /** Positioned container rendering the bar and menu. */
  Container: DockContainer,
  /** The floating pill bar with quick actions and primary CTA. */
  Bar: DockBar,
  /** Expanded categorized action grid above the bar. */
  Menu: DockMenu,
  /** Compact icon button for quick actions. */
  Button: DockButton,
  /** Prominent center CTA button. */
  PrimaryCTA: DockPrimaryCTA,
  /** Vertical divider between dock sections. */
  Separator: DockSeparator,
} as const;
