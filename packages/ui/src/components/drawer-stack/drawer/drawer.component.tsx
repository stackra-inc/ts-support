/**
 * @fileoverview Drawer — composite namespace for all drawer sub-components.
 *
 * Usage:
 * ```tsx
 * <div className="flex flex-col h-full">
 *   <Drawer.Header title="Checkout" variant="compact" />
 *   <Drawer.SubHeader variant="tabs">...</Drawer.SubHeader>
 *   <Drawer.Stepper current={1} steps={3} variant="numbered" />
 *   <Drawer.Content>
 *     <Drawer.Section title="Items">...</Drawer.Section>
 *     <Drawer.Divider />
 *     <Drawer.Section title="Summary">...</Drawer.Section>
 *   </Drawer.Content>
 *   <Drawer.Footer>
 *     <Button>Cancel</Button>
 *     <Button variant="primary">Confirm</Button>
 *   </Drawer.Footer>
 * </div>
 * ```
 *
 * @module drawer-stack/components/drawer
 */

import { DrawerHeader } from '@/components/drawer-stack/drawer-header';
import { DrawerContent } from '@/components/drawer-stack/drawer-content';
import { DrawerFooter } from '@/components/drawer-stack/drawer-footer';
import { DrawerSubHeader } from '@/components/drawer-stack/drawer-sub-header';
import { DrawerStepper } from '@/components/drawer-stack/drawer-stepper';
import { DrawerSection } from '@/components/drawer-stack/drawer-section';
import { DrawerDivider } from '@/components/drawer-stack/drawer-divider';
import { DrawerLoading } from '@/components/drawer-stack/drawer-loading';
import { DrawerAlert } from '@/components/drawer-stack/drawer-alert';
import { DrawerToolbar } from '@/components/drawer-stack/drawer-toolbar';
import { DrawerEmpty } from '@/components/drawer-stack/drawer-empty';

/**
 * Composite Drawer namespace — access all drawer sub-components via dot notation.
 */
export const Drawer = {
  Header: DrawerHeader,
  SubHeader: DrawerSubHeader,
  Content: DrawerContent,
  /** @deprecated Use Drawer.Content instead. */
  Body: DrawerContent,
  Footer: DrawerFooter,
  Loading: DrawerLoading,
  Alert: DrawerAlert,
  Stepper: DrawerStepper,
  Section: DrawerSection,
  Divider: DrawerDivider,
  Toolbar: DrawerToolbar,
  Empty: DrawerEmpty,
} as const;
