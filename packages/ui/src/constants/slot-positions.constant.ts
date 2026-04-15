/**
 * @fileoverview Drawer slot position constants.
 *
 * Named slot positions for injecting custom content into drawer components
 * via the SlotRegistry. Consumers can register content at any position
 * without modifying the drawer components directly.
 *
 * @module drawer-stack/constants/slot-positions
 *
 * @example
 * ```ts
 * import { slotRegistry } from "@abdokouta/react-ui";
 * import { DRAWER_SLOTS } from "@abdokouta/react-ui";
 *
 * slotRegistry.registerEntry(DRAWER_SLOTS.HEADER.BEFORE, {
 *   render: () => <AnnouncementBanner />,
 *   priority: 10,
 * });
 * ```
 */

/**
 * All available slot positions in the drawer stack system.
 *
 * Naming convention: `drawer.<component>.<position>`
 */
export const DRAWER_SLOTS = {
  /** Slots around the DrawerHeader component. */
  HEADER: {
    /** Before the entire header (above drag handle). */
    BEFORE: 'drawer.header.before',
    /** After the header (below the border). */
    AFTER: 'drawer.header.after',
    /** Inside the header, before the title area. */
    BEFORE_TITLE: 'drawer.header.before-title',
    /** Inside the header, after the title area (before actions). */
    AFTER_TITLE: 'drawer.header.after-title',
    /** Inside the header, after the actions area (before close button). */
    AFTER_ACTIONS: 'drawer.header.after-actions',
  },

  /** Slots around the DrawerSubHeader component. */
  SUB_HEADER: {
    BEFORE: 'drawer.sub-header.before',
    AFTER: 'drawer.sub-header.after',
  },

  /** Slots around the DrawerContent component. */
  CONTENT: {
    /** Before the content (inside the scrollable area, at the top). */
    BEFORE: 'drawer.content.before',
    /** After the content (inside the scrollable area, at the bottom). */
    AFTER: 'drawer.content.after',
  },

  /**
   * @deprecated Use CONTENT instead.
   * Slots around the DrawerBody component (deprecated alias for CONTENT).
   */
  BODY: {
    /** Before the body content (inside the scrollable area, at the top). */
    BEFORE: 'drawer.content.before',
    /** After the body content (inside the scrollable area, at the bottom). */
    AFTER: 'drawer.content.after',
  },

  /** Slots around the DrawerFooter component. */
  FOOTER: {
    /** Before the footer (above the border). */
    BEFORE: 'drawer.footer.before',
    /** After the footer (below, outside the drawer). */
    AFTER: 'drawer.footer.after',
    /** Inside the footer, before the children. */
    BEFORE_ACTIONS: 'drawer.footer.before-actions',
    /** Inside the footer, after the children. */
    AFTER_ACTIONS: 'drawer.footer.after-actions',
  },

  /** Slots around the DrawerStepper component. */
  STEPPER: {
    BEFORE: 'drawer.stepper.before',
    AFTER: 'drawer.stepper.after',
  },

  /** Slots around the DrawerToolbar component. */
  TOOLBAR: {
    BEFORE: 'drawer.toolbar.before',
    AFTER: 'drawer.toolbar.after',
  },

  /** Slots around the DrawerContainer (global). */
  CONTAINER: {
    /** Before the backdrop. */
    BEFORE: 'drawer.container.before',
    /** After all panels (overlay content). */
    AFTER: 'drawer.container.after',
  },

  /** Slots around the DrawerAlert component. */
  ALERT: {
    BEFORE: 'drawer.alert.before',
    AFTER: 'drawer.alert.after',
  },

  /** Slots around the DrawerSection component. */
  SECTION: {
    BEFORE: 'drawer.section.before',
    AFTER: 'drawer.section.after',
    BEFORE_TITLE: 'drawer.section.before-title',
    AFTER_TITLE: 'drawer.section.after-title',
  },

  /** Slots around the DrawerDivider component. */
  DIVIDER: {
    BEFORE: 'drawer.divider.before',
    AFTER: 'drawer.divider.after',
  },
} as const;
