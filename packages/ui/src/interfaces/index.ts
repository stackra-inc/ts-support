/**
 * @fileoverview Barrel export for all interfaces.
 * @module interfaces
 */

// ─── Slot ──────────────────────────────────────────────────────────
export type { SlotEntry, SlotEntryOptions } from './slot-entry.interface';

// ─── Drawer Stack ──────────────────────────────────────────────────
export type { DrawerConfig } from './drawer-config.interface';
export type { DrawerEntry } from './drawer-entry.interface';
export type { StackOperations, DrawerStackContextValue } from './stack-operations.interface';
export type {
  DrawerHeaderVariant,
  DrawerHeaderPill,
  DrawerHeaderProps,
} from './drawer-header.interface';
export type { DrawerPositionValue } from './drawer-position.interface';
export type { UseDrawerDragOptions, UseDrawerDragReturn } from './use-drawer-drag.interface';
export type { DrawerLoadingProps, DrawerLoadingVariant } from './drawer-loading.interface';
export type { DrawerAlertProps, DrawerAlertVariant } from './drawer-alert.interface';
export type { DrawerEmptyProps } from './drawer-empty.interface';
export type { SubViewNavigatorProps, SubViewContextValue } from './sub-view.interface';

// ─── Command Dock ──────────────────────────────────────────────────
export type { DockAction } from './dock-action.interface';
export type { DockCategory } from './dock-category.interface';
export type { DockConfig } from './dock-config.interface';
export type { DockContextValue } from './dock-context-value.interface';
export type { DockButtonProps } from './dock-button-props.interface';
