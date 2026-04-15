/**
 * @fileoverview Barrel export for all components.
 * @module components
 */

// ─── Slot ──────────────────────────────────────────────────────────
export { Slot } from './slot';
export type { SlotProps } from './slot';

// ─── Drawer Stack ──────────────────────────────────────────────────
export {
  DrawerContainer,
  DrawerHeader,
  DrawerContent,
  DrawerBody,
  DrawerFooter,
  DrawerSubHeader,
  DrawerStepper,
  DrawerSection,
  DrawerDivider,
  DrawerLoading,
  DrawerAlert,
  DrawerToolbar,
  DrawerEmpty,
  ScopedSlot,
  Drawer,
  SubViewNavigator,
  StackDots,
} from './drawer-stack';
export type {
  DrawerContentProps,
  DrawerBodyProps,
  DrawerFooterProps,
  DrawerSubHeaderProps,
  DrawerStepperProps,
  DrawerStepperStep,
  DrawerSectionProps,
  DrawerDividerProps,
  DrawerToolbarProps,
  ScopedSlotProps,
} from './drawer-stack';

// ─── Command Dock ──────────────────────────────────────────────────
export {
  DockContainer,
  DockBar,
  DockMenu,
  DockButton,
  DockPrimaryCTA,
  DockSeparator,
  Dock,
} from './command-dock';
export type { DockPrimaryCTAProps, DockSeparatorProps } from './command-dock';
