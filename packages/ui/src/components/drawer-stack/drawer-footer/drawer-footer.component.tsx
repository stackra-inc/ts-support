/**
 * @fileoverview DrawerFooter — sticky bottom bar for drawer actions.
 *
 * Slot positions:
 * - `drawer.footer.before` — above the footer border
 * - `drawer.footer.after` — below the footer
 * - `drawer.footer.before-actions` — inside, before children
 * - `drawer.footer.after-actions` — inside, after children
 *
 * @module drawer-stack/components/drawer-footer
 */

import React from 'react';
import { ScopedSlot } from '@/components/drawer-stack/scoped-slot';
import { DRAWER_SLOTS } from '@/constants';

export interface DrawerFooterProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Visual variant.
   * - `"default"` — border top, standard padding
   * - `"raised"` — shadow + border, elevated look
   * - `"transparent"` — no border/shadow
   * @default "default"
   */
  variant?: 'default' | 'raised' | 'transparent';
  /** When true, disables actions and shows a loading spinner. */
  isLoading?: boolean;
  /** Content rendered on the left side of the footer. */
  startContent?: React.ReactNode;
  /** Content rendered on the right side of the footer. */
  endContent?: React.ReactNode;
}

const FooterSpinner = () => (
  <svg
    className="size-4 animate-spin text-muted shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export function DrawerFooter({
  children,
  className,
  variant = 'default',
  isLoading = false,
  startContent,
  endContent,
}: DrawerFooterProps): React.JSX.Element {
  const base = 'shrink-0 px-6 py-3';
  const variants = {
    default: 'border-t border-separator bg-background',
    raised: 'border-t border-separator bg-surface shadow-[0_-2px_8px_rgba(0,0,0,0.06)]',
    transparent: '',
  };

  const hasZones = startContent !== undefined || endContent !== undefined;

  return (
    <>
      <ScopedSlot name={DRAWER_SLOTS.FOOTER.BEFORE} />
      <div
        className={`${base} ${variants[variant]} ${className ?? ''}`}
        {...(isLoading ? { 'aria-busy': 'true' as const } : {})}
      >
        <div
          className={`flex items-center ${hasZones ? 'justify-between' : 'gap-3'} ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
        >
          {hasZones ? (
            <>
              <div className="flex items-center gap-3">
                <ScopedSlot name={DRAWER_SLOTS.FOOTER.BEFORE_ACTIONS} />
                {startContent}
              </div>
              <div className="flex items-center gap-3">{children}</div>
              <div className="flex items-center gap-3">
                {endContent}
                <ScopedSlot name={DRAWER_SLOTS.FOOTER.AFTER_ACTIONS} />
              </div>
            </>
          ) : (
            <>
              <ScopedSlot name={DRAWER_SLOTS.FOOTER.BEFORE_ACTIONS} />
              {children}
              <ScopedSlot name={DRAWER_SLOTS.FOOTER.AFTER_ACTIONS} />
            </>
          )}
          {isLoading && <FooterSpinner />}
        </div>
      </div>
      <ScopedSlot name={DRAWER_SLOTS.FOOTER.AFTER} />
    </>
  );
}
