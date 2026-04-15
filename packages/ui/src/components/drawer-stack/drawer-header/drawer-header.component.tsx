/**
 * @fileoverview DrawerHeader — reusable header for drawers with stack awareness.
 *
 * 3 variants: "default", "hero", "compact"
 *
 * Slot positions:
 * - `drawer.header.before` — above the header (above drag handle)
 * - `drawer.header.after` — below the header border
 * - `drawer.header.before-title` — inside, before the title
 * - `drawer.header.after-title` — inside, after the title (before actions)
 * - `drawer.header.after-actions` — inside, after actions (before close)
 *
 * @module drawer-stack/components/drawer-header
 */

import React from 'react';
import { useDrawerPosition } from '@/hooks';
import { useDrawerStack } from '@/hooks';
import { DragHandle } from '@/components/drawer-stack/drag-handle';
import { CloseBtn } from '@/components/drawer-stack/close-button';
import { StackDots } from '@/components/drawer-stack/stack-dots';
import { SubViewContext } from '@/contexts/drawer-stack';
import { ScopedSlot } from '@/components/drawer-stack/scoped-slot';
import { DRAWER_SLOTS } from '@/constants';
import type { DrawerHeaderProps } from '@/interfaces';

const ChevronLeft = () => (
  <svg
    className="size-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const HeaderSpinner = () => (
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

export function DrawerHeader({
  title,
  subtitle,
  icon,
  variant = 'default',
  onClose,
  actions,
  className,
  hideClose = false,
  hideHandle = false,
  pills,
  closeDisplay = 'kbd',
  isLoading = false,
}: DrawerHeaderProps): React.JSX.Element {
  const { isStacked, stackSize, index } = useDrawerPosition();
  const { operations } = useDrawerStack();
  const handleClose = onClose ?? (() => operations.pop());

  const subViewCtx = React.useContext(SubViewContext);
  const subViewCanGoBack = subViewCtx?.canGoBack ?? false;
  const subViewGoBack = subViewCtx?.goBack;
  const showBack = isStacked || subViewCanGoBack;
  const handleBack = subViewCanGoBack ? () => subViewGoBack?.() : handleClose;

  // ── Hero variant ──
  if (variant === 'hero') {
    return (
      <>
        <ScopedSlot name={DRAWER_SLOTS.HEADER.BEFORE} />
        {!hideHandle && <DragHandle variant="hero" />}
        <div
          className={`absolute top-3 left-3 right-3 z-20 flex items-center justify-between ${className ?? ''}`}
        >
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/60 text-xs font-bold transition-all"
              >
                <ChevronLeft /> Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLoading && <HeaderSpinner />}
            {isStacked && <StackDots stackSize={stackSize} index={index} variant="hero" />}
            {!hideClose && <CloseBtn onClick={handleClose} variant="hero" display={closeDisplay} />}
          </div>
        </div>
        <ScopedSlot name={DRAWER_SLOTS.HEADER.AFTER} />
      </>
    );
  }

  // ── Compact variant ──
  if (variant === 'compact') {
    return (
      <div className={`shrink-0 ${className ?? ''}`}>
        <ScopedSlot name={DRAWER_SLOTS.HEADER.BEFORE} />
        {!hideHandle && <DragHandle variant="surface" />}
        <div className="px-4 md:px-5 py-2 md:py-2.5 border-b border-separator flex items-center gap-2">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-[10px] font-bold text-muted hover:text-foreground transition-colors shrink-0"
            >
              <ChevronLeft /> Back
            </button>
          )}
          <ScopedSlot name={DRAWER_SLOTS.HEADER.BEFORE_TITLE} />
          {icon && <span className="shrink-0">{icon}</span>}
          <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
            {title && (
              <p className="text-sm font-black text-foreground whitespace-nowrap text-ellipsis overflow-hidden shrink min-w-0">
                {title}
              </p>
            )}
            {isLoading && <HeaderSpinner />}
            {pills && pills.length > 0 && (
              <div className="hidden md:flex items-center gap-1 shrink-0">
                {pills.map((pill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border whitespace-nowrap"
                    style={
                      pill.color
                        ? {
                            color: pill.color,
                            borderColor: pill.color + '40',
                            backgroundColor: pill.color + '15',
                          }
                        : undefined
                    }
                  >
                    {pill.icon && <span className="normal-case">{pill.icon}</span>}
                    {pill.label}
                  </span>
                ))}
              </div>
            )}
            {subtitle && !(pills && pills.length > 0) && (
              <span className="hidden md:inline text-[10px] text-muted font-bold whitespace-nowrap shrink-0">
                {subtitle}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="md:hidden text-[10px] text-muted font-bold whitespace-nowrap text-ellipsis overflow-hidden shrink min-w-0">
              {subtitle}
            </span>
          )}
          <ScopedSlot name={DRAWER_SLOTS.HEADER.AFTER_TITLE} />
          {actions}
          <ScopedSlot name={DRAWER_SLOTS.HEADER.AFTER_ACTIONS} />
          {isStacked && <StackDots stackSize={stackSize} index={index} variant="surface" />}
          {!hideClose && (
            <CloseBtn onClick={handleClose} variant="surface" display={closeDisplay} />
          )}
        </div>
        <ScopedSlot name={DRAWER_SLOTS.HEADER.AFTER} />
      </div>
    );
  }

  // ── Default variant ──
  return (
    <div className={`shrink-0 ${className ?? ''}`}>
      <ScopedSlot name={DRAWER_SLOTS.HEADER.BEFORE} />
      {!hideHandle && <DragHandle variant="surface" />}
      <div className="px-6 py-4 border-b border-separator flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 text-xs font-bold text-muted hover:text-foreground transition-colors shrink-0"
          >
            <ChevronLeft /> Back
          </button>
        )}
        <ScopedSlot name={DRAWER_SLOTS.HEADER.BEFORE_TITLE} />
        {icon && <span className="shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {title && <h2 className="text-base font-black text-foreground truncate">{title}</h2>}
            {isLoading && <HeaderSpinner />}
          </div>
          {subtitle && <p className="text-[10px] text-muted mt-0.5">{subtitle}</p>}
        </div>
        <ScopedSlot name={DRAWER_SLOTS.HEADER.AFTER_TITLE} />
        {actions}
        <ScopedSlot name={DRAWER_SLOTS.HEADER.AFTER_ACTIONS} />
        {isStacked && <StackDots stackSize={stackSize} index={index} variant="surface" />}
        {!hideClose && <CloseBtn onClick={handleClose} variant="surface" display={closeDisplay} />}
      </div>
      <ScopedSlot name={DRAWER_SLOTS.HEADER.AFTER} />
    </div>
  );
}
