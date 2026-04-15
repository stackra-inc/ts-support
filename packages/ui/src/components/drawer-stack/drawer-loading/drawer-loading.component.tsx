/**
 * @fileoverview DrawerLoading — loading state component for drawers.
 *
 * Supports three variants: spinner, skeleton, and overlay.
 *
 * @module drawer-stack/components/drawer-loading
 */

import React from 'react';
import type { DrawerLoadingProps } from '@/interfaces';

const Spinner = ({ className = 'size-6' }: { className?: string }) => (
  <svg
    className={`animate-spin text-muted ${className}`}
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

function SpinnerVariant({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 ${className ?? ''}`}>
      <Spinner />
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  );
}

function SkeletonVariant({ lines, className }: { lines: number; className?: string }) {
  const count = Math.max(1, lines);
  return (
    <div className={`flex flex-col gap-3 py-4 ${className ?? ''}`}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-muted/20 animate-pulse"
          style={{ width: i === count - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

function OverlayVariant({
  label,
  children,
  className,
}: {
  label?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ''}`}>
      {children}
      <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center gap-3 z-10">
        <Spinner />
        {label && <p className="text-sm text-muted">{label}</p>}
      </div>
    </div>
  );
}

/**
 * Loading state component for drawers.
 *
 * - `spinner`: centered spinner + optional label
 * - `skeleton`: animated pulse lines (configurable count)
 * - `overlay`: semi-transparent overlay + spinner over children
 *
 * Returns `null` when `isLoading` is false (or just children for overlay).
 */
export function DrawerLoading({
  isLoading,
  variant = 'spinner',
  label,
  lines = 5,
  className,
  children,
}: DrawerLoadingProps): React.JSX.Element | null {
  if (!isLoading) {
    // Overlay variant returns children when not loading
    if (variant === 'overlay' && children) {
      return <>{children}</>;
    }
    return null;
  }

  switch (variant) {
    case 'skeleton':
      return <SkeletonVariant lines={lines} className={className} />;
    case 'overlay':
      return (
        <OverlayVariant label={label} className={className}>
          {children}
        </OverlayVariant>
      );
    case 'spinner':
    default:
      return <SpinnerVariant label={label} className={className} />;
  }
}
