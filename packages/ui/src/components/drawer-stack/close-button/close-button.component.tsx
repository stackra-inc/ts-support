/**
 * @fileoverview CloseButton — drawer close/dismiss button.
 *
 * Two display modes:
 * - `"icon"` — always shows an X icon (useful when esc is disabled)
 * - `"kbd"`  — shows "esc" keyboard hint with X icon fallback on touch
 *
 * Two visual variants: "hero" (floating over dark content) and "surface" (standard).
 *
 * @module drawer-stack/components/close-button
 */

import React from 'react';

/** X icon SVG for close button. */
const XIcon = () => (
  <svg
    className="size-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

/**
 * Display mode for the close button.
 *
 * - `"kbd"` — Shows "esc" keyboard hint on desktop, X icon on touch devices.
 * - `"icon"` — Always shows an X icon regardless of device.
 */
export type CloseBtnDisplay = 'kbd' | 'icon';

/**
 * Props for the CloseButton component.
 */
interface CloseBtnProps {
  /** Click handler — typically calls `operations.pop()`. */
  onClick: () => void;

  /** Visual variant — "hero" for dark overlay, "surface" for standard. */
  variant: 'hero' | 'surface';

  /**
   * Display mode — "kbd" shows esc hint on desktop, "icon" always shows X.
   * @default "kbd"
   */
  display?: CloseBtnDisplay;
}

/**
 * Close button for drawer headers.
 *
 * Uses `@media (pointer: fine)` to detect desktop (mouse/trackpad) vs touch.
 * - `display="kbd"` (default): Shows "esc" on pointer devices, X on touch
 * - `display="icon"`: Always shows X icon
 * - Hero variant: floating with backdrop blur
 * - Surface variant: standard with border
 */
export function CloseBtn({ onClick, variant, display = 'kbd' }: CloseBtnProps): React.JSX.Element {
  // ── Hero variant — always X icon in a floating circle ──
  if (variant === 'hero') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="size-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
        aria-label="Close"
      >
        <XIcon />
      </button>
    );
  }

  // ── Icon-only mode ──
  if (display === 'icon') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="size-7 rounded-lg bg-surface-secondary/80 border border-separator/50 flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-secondary hover:border-separator transition-all shrink-0"
        aria-label="Close"
      >
        <XIcon />
      </button>
    );
  }

  // ── Kbd mode (default) — "esc" text on desktop, X on touch ──
  return (
    <>
      <style>{`
        .drawer-close-kbd .drawer-close-x { display: none; }
        .drawer-close-kbd .drawer-close-esc { display: inline; }
        @media (pointer: coarse) {
          .drawer-close-kbd .drawer-close-x { display: flex; }
          .drawer-close-kbd .drawer-close-esc { display: none; }
        }
      `}</style>
      <button
        type="button"
        onClick={onClick}
        className="drawer-close-kbd h-7 rounded-lg bg-surface-secondary/80 border border-separator/50 flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-secondary hover:border-separator transition-all shrink-0 px-2 gap-1"
        aria-label="Close (Escape)"
      >
        <span className="drawer-close-x">
          <XIcon />
        </span>
        <span className="drawer-close-esc text-[10px] font-bold tracking-wide">esc</span>
      </button>
    </>
  );
}
