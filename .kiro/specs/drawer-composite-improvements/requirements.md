# Requirements Document

## Introduction

This specification covers eight improvements to the Drawer composite component
system located at `packages/ui/src/components/drawer-stack/`. The changes
introduce new sub-components (Drawer.Loading, Drawer.Alert), rename Drawer.Body
to Drawer.Content for HeroUI consistency, add loading states to DrawerHeader and
DrawerFooter, enhance DrawerFooter with flexible action layout, add slot
positions to DrawerSection and DrawerDivider, and introduce drawer-ID-scoped
slot names so registered content can target a specific drawer instance.

## Glossary

- **Drawer**: The composite namespace object (`Drawer.Header`, `Drawer.Content`,
  etc.) that provides dot-notation access to all drawer sub-components.
- **DrawerContent**: The scrollable content area component (renamed from
  DrawerBody) that fills the space between header and footer.
- **DrawerBody**: Deprecated alias for DrawerContent, retained for backward
  compatibility.
- **DrawerLoading**: A new component that renders a loading overlay, skeleton,
  or spinner inside the drawer content area.
- **DrawerAlert**: A new inline alert/banner component for displaying contextual
  messages inside a drawer.
- **DrawerHeader**: The header component with title, subtitle, actions, and
  close/back controls.
- **DrawerFooter**: The sticky bottom bar for drawer action buttons.
- **DrawerSection**: A labeled content group used inside DrawerContent to
  structure form fields, lists, or info blocks.
- **DrawerDivider**: A horizontal separator with optional label text used
  between sections.
- **DRAWER_SLOTS**: The constant object defining all named slot positions for
  the drawer system.
- **Slot**: A component that renders content registered to a named position via
  the slotRegistry.
- **SlotRegistry**: The global registry where consumers register renderable
  entries at named slot positions.
- **DrawerConfig**: The configuration interface for a drawer entry, including
  the `id` field used for scoped slot names.
- **Scoped_Slot**: A slot name that includes a specific drawer ID (e.g.,
  `drawer.checkout.header.before`) so registered content only renders inside
  that drawer instance.
- **Global_Slot**: A slot name without a drawer ID (e.g.,
  `drawer.header.before`) that renders in all drawer instances.

## Requirements

### Requirement 1: Rename DrawerBody to DrawerContent

**User Story:** As a developer, I want the drawer body component to be named
DrawerContent, so that it follows the same naming convention as HeroUI's
Card.Content and Modal.Content.

#### Acceptance Criteria

1. THE Drawer namespace SHALL expose a `Content` property that references the
   DrawerContent component.
2. THE Drawer namespace SHALL expose a `Body` property that references the same
   DrawerContent component as a deprecated alias.
3. WHEN a consumer imports `DrawerBody` from the barrel export, THE barrel
   export SHALL re-export DrawerContent under the name DrawerBody for backward
   compatibility.
4. THE DrawerContent component SHALL accept the same props as the current
   DrawerBody component (children, className, padding).
5. THE DRAWER_SLOTS constant SHALL include a `CONTENT` key with the same slot
   position values as the current `BODY` key.
6. THE DRAWER_SLOTS constant SHALL retain the `BODY` key as a deprecated alias
   pointing to the same slot position strings as `CONTENT`.

### Requirement 2: DrawerLoading Component

**User Story:** As a developer, I want a Drawer.Loading component, so that I can
show loading states inside the drawer content area without building custom
loading UI each time.

#### Acceptance Criteria

1. WHEN `isLoading` is true and `variant` is `"spinner"`, THE DrawerLoading
   component SHALL render a centered spinner with an optional text label below
   the spinner.
2. WHEN `isLoading` is true and `variant` is `"skeleton"`, THE DrawerLoading
   component SHALL render animated skeleton placeholder lines that replace the
   content area.
3. WHEN `isLoading` is true and `variant` is `"overlay"`, THE DrawerLoading
   component SHALL render a semi-transparent overlay that dims the content and
   displays a centered spinner on top.
4. WHEN `isLoading` is false, THE DrawerLoading component SHALL render nothing.
5. THE DrawerLoading component SHALL accept a `label` prop of type string that
   renders descriptive text alongside the spinner in the `"spinner"` and
   `"overlay"` variants.
6. THE Drawer namespace SHALL expose a `Loading` property that references the
   DrawerLoading component.
7. THE barrel export SHALL export the DrawerLoading component and its
   DrawerLoadingProps interface.

### Requirement 3: isLoading Prop on DrawerFooter

**User Story:** As a developer, I want an isLoading prop on DrawerFooter, so
that I can disable footer actions and show a loading indicator while async
operations (like saving) are in progress.

#### Acceptance Criteria

1. WHEN `isLoading` is true, THE DrawerFooter component SHALL set
   `pointer-events: none` and reduce opacity on all interactive children to
   visually indicate a disabled state.
2. WHEN `isLoading` is true, THE DrawerFooter component SHALL render a small
   loading spinner indicator within the footer area.
3. WHEN `isLoading` is true, THE DrawerFooter component SHALL set `aria-busy` to
   `true` on the footer container element.
4. WHEN `isLoading` is false or not provided, THE DrawerFooter component SHALL
   render children with normal interactivity and no loading indicator.

### Requirement 4: isLoading Prop on DrawerHeader

**User Story:** As a developer, I want an isLoading prop on DrawerHeader, so
that I can indicate background data refresh or save operations without blocking
the user from closing the drawer.

#### Acceptance Criteria

1. WHEN `isLoading` is true, THE DrawerHeader component SHALL render a small
   spinner adjacent to the title text.
2. WHEN `isLoading` is true, THE DrawerHeader component SHALL keep the close
   button and back button fully interactive and clickable.
3. WHEN `isLoading` is false or not provided, THE DrawerHeader component SHALL
   render the title without a spinner.
4. THE DrawerHeaderProps interface SHALL include an optional `isLoading`
   property of type boolean.

### Requirement 5: Footer Action Layout with startContent and endContent

**User Story:** As a developer, I want startContent and endContent props on
DrawerFooter, so that I can create flexible action layouts like [Cancel] ----
[Save Draft] [Submit] without custom CSS.

#### Acceptance Criteria

1. WHEN `startContent` is provided, THE DrawerFooter component SHALL render the
   startContent on the left side of the footer layout.
2. WHEN `endContent` is provided, THE DrawerFooter component SHALL render the
   endContent on the right side of the footer layout.
3. WHEN both `startContent` and `endContent` are provided, THE DrawerFooter
   component SHALL render startContent on the left, children in the center, and
   endContent on the right, with `justify-between` spacing.
4. WHEN neither `startContent` nor `endContent` is provided, THE DrawerFooter
   component SHALL render children using the current layout (flex row with gap).
5. THE DrawerFooterProps interface SHALL include optional `startContent` and
   `endContent` properties of type ReactNode.

### Requirement 6: DrawerAlert Component

**User Story:** As a developer, I want a Drawer.Alert component, so that I can
display inline info, success, warning, or danger banners inside a drawer without
building custom alert UI.

#### Acceptance Criteria

1. THE DrawerAlert component SHALL accept a `variant` prop with values `"info"`,
   `"success"`, `"warning"`, or `"danger"` that controls the banner color scheme
   and icon.
2. THE DrawerAlert component SHALL render a colored banner with an appropriate
   icon for the selected variant.
3. WHEN a `title` prop is provided, THE DrawerAlert component SHALL render the
   title text in a bold style above the children content.
4. WHEN `dismissible` is true, THE DrawerAlert component SHALL render a dismiss
   button that calls the `onDismiss` callback when clicked.
5. WHEN `dismissible` is false or not provided, THE DrawerAlert component SHALL
   render without a dismiss button.
6. THE DRAWER_SLOTS constant SHALL include an `ALERT` key with `BEFORE` and
   `AFTER` slot positions (`drawer.alert.before`, `drawer.alert.after`).
7. THE DrawerAlert component SHALL render `Slot` components at the
   `drawer.alert.before` and `drawer.alert.after` positions.
8. THE Drawer namespace SHALL expose an `Alert` property that references the
   DrawerAlert component.
9. THE barrel export SHALL export the DrawerAlert component and its
   DrawerAlertProps interface.

### Requirement 7: Slots on DrawerSection and DrawerDivider

**User Story:** As a developer, I want slot positions on DrawerSection and
DrawerDivider, so that I can inject custom content around sections and dividers
via the SlotRegistry without modifying the components.

#### Acceptance Criteria

1. THE DRAWER_SLOTS constant SHALL include a `SECTION` key with `BEFORE`,
   `AFTER`, `BEFORE_TITLE`, and `AFTER_TITLE` slot positions
   (`drawer.section.before`, `drawer.section.after`,
   `drawer.section.before-title`, `drawer.section.after-title`).
2. THE DRAWER_SLOTS constant SHALL include a `DIVIDER` key with `BEFORE` and
   `AFTER` slot positions (`drawer.divider.before`, `drawer.divider.after`).
3. THE DrawerSection component SHALL render `Slot` components at the
   `drawer.section.before` and `drawer.section.after` positions wrapping the
   section content.
4. THE DrawerSection component SHALL render `Slot` components at the
   `drawer.section.before-title` and `drawer.section.after-title` positions
   around the title area.
5. THE DrawerDivider component SHALL render `Slot` components at the
   `drawer.divider.before` and `drawer.divider.after` positions wrapping the
   divider element.

### Requirement 8: Scoped Slot Names per Drawer ID

**User Story:** As a developer, I want drawer-ID-scoped slot names, so that I
can register content that only appears in a specific drawer instance rather than
in all drawers globally.

#### Acceptance Criteria

1. WHEN a drawer has a `config.id` value, THE drawer sub-components
   (DrawerHeader, DrawerContent, DrawerFooter, DrawerSection, DrawerDivider,
   DrawerAlert) SHALL check for both the global slot name (e.g.,
   `drawer.header.before`) and the scoped slot name (e.g.,
   `drawer.checkout.header.before`).
2. THE scoped slot name format SHALL follow the pattern
   `drawer.<drawerId>.<component>.<position>` where `drawerId` is the value of
   `config.id` from the DrawerConfig.
3. WHEN content is registered at a scoped slot name, THE Slot component at that
   position SHALL render the scoped content only inside the drawer with the
   matching ID.
4. WHEN content is registered at a global slot name, THE Slot component at that
   position SHALL render the global content inside all drawer instances.
5. WHEN content is registered at both a global slot name and a scoped slot name
   for the same position, THE drawer sub-component SHALL render both the global
   and scoped content at that position.
6. THE drawer sub-components SHALL access the current drawer's `config.id` via
   the existing DrawerPosition context or a new context that provides the drawer
   ID.
