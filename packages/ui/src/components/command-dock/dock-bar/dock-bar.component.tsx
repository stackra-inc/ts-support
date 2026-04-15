/**
 * @fileoverview DockBar — the floating pill containing quick actions and primary CTA.
 *
 * Renders the main dock bar with:
 * - Left quick-action icon buttons (animated expand/collapse)
 * - Left separator
 * - Primary CTA button (center)
 * - Right separator
 * - Right utility buttons (menu toggle, etc.)
 *
 * Hover expands the bar to reveal quick actions.
 * The expand chevron toggles the DockMenu above.
 *
 * @module command-dock/components/dock-bar
 */

import React from 'react';
import { useCommandDock } from '@/hooks';
import { EXPAND_MS, STAGGER_MS, EASE, DOCK_SLOTS } from '@/constants';
import { DockButton } from '@/components/command-dock/dock-button';
import { DockSeparator } from '@/components/command-dock/dock-separator';
import { DockPrimaryCTA } from '@/components/command-dock/dock-primary-cta';
import { Slot } from '@/components/slot';

/**
 * The main floating dock bar.
 *
 * Contains quick-action buttons, primary CTA, and menu toggle.
 * Expands on hover to reveal quick actions with staggered animation.
 *
 * @example
 * ```tsx
 * <DockBar />
 * ```
 */
export function DockBar(): React.JSX.Element {
  const { primaryAction, quickActions, isExpanded, isMenuOpen, setExpanded, toggleMenu } =
    useCommandDock();

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="flex items-center bg-surface/95 backdrop-blur-xl border border-separator shadow-2xl rounded-2xl px-1.5 py-1.5 gap-0.5"
    >
      <Slot name={DOCK_SLOTS.BAR.BEFORE_LEFT} />

      {/* Left quick actions — staggered expand animation */}
      {quickActions.map((action, i) => (
        <div
          key={action.id}
          className="shrink-0 overflow-hidden"
          style={{
            width: isExpanded ? 36 : 0,
            opacity: isExpanded ? 1 : 0,
            transition: `width ${EXPAND_MS}ms ${EASE} ${i * STAGGER_MS}ms, opacity 120ms ease ${isExpanded ? i * STAGGER_MS : 0}ms`,
          }}
        >
          <DockButton
            icon={action.icon}
            label={action.label}
            onPress={action.onPress}
            disabled={action.disabled}
          />
        </div>
      ))}

      {/* Left separator */}
      {quickActions.length > 0 && <DockSeparator visible={isExpanded} />}

      <Slot name={DOCK_SLOTS.BAR.BEFORE_PRIMARY} />

      {/* Primary CTA */}
      <DockPrimaryCTA action={primaryAction} />

      <Slot name={DOCK_SLOTS.BAR.AFTER_PRIMARY} />

      {/* Right separator */}
      <DockSeparator visible={isExpanded} />

      {/* Menu toggle button */}
      <div
        className="shrink-0 overflow-hidden"
        style={{
          width: isExpanded ? 36 : 0,
          opacity: isExpanded ? 1 : 0,
          transition: `width ${EXPAND_MS}ms ${EASE}, opacity 120ms ease`,
        }}
      >
        <DockButton
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          }
          label="All Actions"
          onPress={toggleMenu}
        />
      </div>

      <Slot name={DOCK_SLOTS.BAR.AFTER_RIGHT} />
    </div>
  );
}
