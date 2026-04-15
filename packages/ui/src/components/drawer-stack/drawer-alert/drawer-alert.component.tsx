/**
 * @fileoverview DrawerAlert — inline alert/banner component for drawers.
 *
 * Supports info, success, warning, and danger variants with
 * optional title, dismiss button, and scoped slot positions.
 *
 * @module drawer-stack/components/drawer-alert
 */

import React from 'react';
import { ScopedSlot } from '@/components/drawer-stack/scoped-slot';
import { DRAWER_SLOTS } from '@/constants';
import type { DrawerAlertProps, DrawerAlertVariant } from '@/interfaces';

const VARIANT_STYLES: Record<
  DrawerAlertVariant,
  { bg: string; border: string; text: string; icon: string }
> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    icon: 'text-blue-500',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    icon: 'text-green-500',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-200',
    icon: 'text-amber-500',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    icon: 'text-red-500',
  },
};

const InfoIcon = () => (
  <svg
    className="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    className="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const WarningIcon = () => (
  <svg
    className="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const DangerIcon = () => (
  <svg
    className="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

const VARIANT_ICONS: Record<DrawerAlertVariant, React.FC> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: DangerIcon,
};

const CloseIcon = () => (
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
 * Inline alert/banner for drawers.
 *
 * @example
 * ```tsx
 * <Drawer.Alert variant="warning" title="Unsaved changes">
 *   You have unsaved changes that will be lost.
 * </Drawer.Alert>
 * ```
 */
export function DrawerAlert({
  variant,
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
}: DrawerAlertProps): React.JSX.Element {
  const styles = VARIANT_STYLES[variant];
  const Icon = VARIANT_ICONS[variant];

  return (
    <>
      <ScopedSlot name={DRAWER_SLOTS.ALERT.BEFORE} />
      <div
        className={`flex items-start gap-3 px-4 py-3 border rounded-lg ${styles.bg} ${styles.border} ${className ?? ''}`}
        role="alert"
      >
        <span className={styles.icon}>
          <Icon />
        </span>
        <div className={`flex-1 min-w-0 text-sm ${styles.text}`}>
          {title && <p className="font-bold mb-0.5">{title}</p>}
          <div>{children}</div>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className={`shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${styles.text}`}
            aria-label="Dismiss"
          >
            <CloseIcon />
          </button>
        )}
      </div>
      <ScopedSlot name={DRAWER_SLOTS.ALERT.AFTER} />
    </>
  );
}
