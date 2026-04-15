# Requirements Document

## Introduction

This feature integrates the `@nav/*` package suite into the `vite-template`
application across three workstreams:

1. A comprehensive demo page showcasing all `@nav/ui` components (generic, POS,
   dashboard, landing) with interactive feature demonstrations.
2. Migration of the custom POS v2 navigation (header + sidebar) to the `@nav/ui`
   `Nav.POS.*` components, wired through `NavProvider` with the POS context
   preset.
3. A slot injection system for all nav components, following the existing
   `SlotRegistry` / `<Slot>` / `UIModule.registerSlot()` pattern, exposed via a
   `NavigationModule` DI module.

## Glossary

- **Nav_Demo_Page**: A standalone page in the vite-template app that renders all
  `@nav/ui` components with sample data for each context preset (POS, dashboard,
  landing).
- **NavProvider**: The root React context provider from `@nav/react` that
  supplies navigation state (tree, active node, breadcrumbs, collapse, plugins)
  to descendant components.
- **NavTree**: The immutable navigation tree data structure from `@nav/core`,
  built via `createNavTree`, `addSection`, and `addNode`.
- **Nav_POS_Header**: The `Nav.POS.Header` component from `@nav/ui` that renders
  a POS header with configurable slot props (logo, spotlight, clock,
  notifications, user, etc.).
- **Nav_POS_Sidebar**: The `Nav.POS.Sidebar` component from `@nav/ui` that
  renders a collapsible POS category sidebar.
- **Nav_POS_Spotlight**: The `Nav.POS.Spotlight` component from `@nav/ui` that
  renders a command palette overlay.
- **Custom_POS_Header**: The existing `POSHeader` component in
  `apps/vite-template/src/components/pos-header.tsx`.
- **Custom_POS_Sidebar**: The existing `POSSidebar` component in
  `apps/vite-template/src/components/pos-sidebar.tsx`.
- **POS_Layout**: The `POSLayoutV2` component in
  `apps/vite-template/src/layouts/pos-layout.tsx`.
- **SlotRegistry**: The global singleton from `@abdokouta/react-ui` that manages
  dynamic UI slot injection.
- **Slot_Component**: The `<Slot name="..." />` React component from
  `@abdokouta/react-ui` that renders all content registered to a named slot.
- **NavigationModule**: A new DI module that provides static methods for
  registering nav slot content, following the `UIModule.registerSlot()` pattern.
- **AppModule**: The root DI module in `apps/vite-template/src/app.module.ts`
  that configures all package modules.
- **Context_Preset**: A predefined `NavConfig` from `NAV_CONTEXT_PRESETS` in
  `@nav/core` (e.g., POS, dashboard, landing).
- **Category_Data**: The event category JSON data in
  `apps/vite-template/src/data/categories.json` used to build the POS NavTree.

## Requirements

### Requirement 1: Nav Demo Page — Route and Layout

**User Story:** As a developer, I want a dedicated demo page at `/nav-demo` in
the vite-template app, so that I can preview and test all `@nav/ui` components
in one place.

#### Acceptance Criteria

1. WHEN a user navigates to `/nav-demo`, THE Nav_Demo_Page SHALL render a
   full-page layout with tabbed sections for Generic, POS, Dashboard, and
   Landing component groups.
2. THE Nav_Demo_Page SHALL import and render all generic components:
   `Nav.Sidebar`, `Nav.Header`, `Nav.Menu`, `Nav.Item`, `Nav.Breadcrumbs`,
   `Nav.Footer`, `Nav.UserMenu`, `Nav.Search`.
3. THE Nav_Demo_Page SHALL import and render all POS components:
   `Nav.POS.Header`, `Nav.POS.Sidebar`, `Nav.POS.Spotlight`, `Nav.POS.UserMenu`.
4. THE Nav_Demo_Page SHALL import and render all Dashboard components:
   `Nav.Dashboard.Layout`, `Nav.Dashboard.Sidebar`, `Nav.Dashboard.Breadcrumbs`,
   `Nav.Dashboard.SettingsNav`.
5. THE Nav_Demo_Page SHALL import and render all Landing components:
   `Nav.Landing.Header`, `Nav.Landing.MobileDrawer`, `Nav.Landing.Footer`.
6. THE Nav_Demo_Page SHALL register the `/nav-demo` route in the application
   router in `app.tsx`.

### Requirement 2: Nav Demo Page — Feature Demonstrations

**User Story:** As a developer, I want the demo page to showcase all navigation
engine features interactively, so that I can verify each feature works
correctly.

#### Acceptance Criteria

1. THE Nav_Demo_Page SHALL wrap each component group in a dedicated
   `NavProvider` configured with the matching Context_Preset from
   `NAV_CONTEXT_PRESETS`.
2. THE Nav_Demo_Page SHALL demonstrate active state resolution by highlighting
   the currently active nav node when a user clicks a menu item.
3. THE Nav_Demo_Page SHALL demonstrate breadcrumb generation by rendering
   `Nav.Breadcrumbs` that updates when the active node changes.
4. THE Nav_Demo_Page SHALL demonstrate role-based filtering by providing a role
   selector that filters visible nav nodes using `filterByRole`.
5. THE Nav_Demo_Page SHALL demonstrate collapse state by providing a toggle that
   collapses and expands `Nav.Sidebar` and `Nav.POS.Sidebar`.
6. THE Nav_Demo_Page SHALL demonstrate keyboard navigation by binding arrow keys
   and typeahead search within the sidebar menus.
7. THE Nav_Demo_Page SHALL demonstrate the plugin system by registering
   `createBadgePlugin`, `createSearchPlugin`, and `createSpotlightPlugin` from
   `@nav/plugins` and rendering their output.
8. THE Nav_Demo_Page SHALL construct sample NavTree instances with at least
   three sections and five nodes per section for each context preset.

### Requirement 3: POS Migration — NavProvider Wiring

**User Story:** As a developer, I want the POS v2 layout to use `NavProvider`
with the POS context preset, so that all POS navigation components share a
single navigation state.

#### Acceptance Criteria

1. THE POS_Layout SHALL wrap its content in a `NavProvider` configured with the
   POS Context_Preset from `NAV_CONTEXT_PRESETS`.
2. THE POS_Layout SHALL build a NavTree from the Category_Data, mapping each
   category to a `NavNodeDef` with `id`, `label`, `icon`, and `path` fields.
3. THE POS_Layout SHALL pass the constructed NavTree to the `NavProvider` via
   the `tree` prop.
4. WHEN the Category_Data changes, THE POS_Layout SHALL rebuild the NavTree to
   reflect the updated categories.

### Requirement 4: POS Migration — Replace Custom Header

**User Story:** As a developer, I want to replace the custom POS header with
`Nav.POS.Header`, so that the POS terminal uses the standardized nav component.

#### Acceptance Criteria

1. THE POS_Layout SHALL render `Nav.POS.Header` in place of the
   Custom_POS_Header import from `components/layout/pos-header.tsx`.
2. THE Nav_POS_Header SHALL receive the sidebar toggle, logo, tenant name,
   spotlight trigger, shift button, clock, notification bell, AI assistant
   button, and user avatar as slot props, preserving the existing visual layout
   and functionality.
3. WHEN the user clicks the spotlight trigger slot in Nav_POS_Header, THE
   POS_Layout SHALL open the spotlight overlay.
4. WHEN the user clicks the sidebar toggle slot in Nav_POS_Header, THE
   POS_Layout SHALL toggle the sidebar collapsed state via `NavProvider`
   actions.
5. THE POS_Layout SHALL preserve all existing header interactions: shift drawer,
   notification panel, profile drawer, and AI chat panel triggers.

### Requirement 5: POS Migration — Replace Custom Sidebar

**User Story:** As a developer, I want to replace the custom POS sidebar with
`Nav.POS.Sidebar`, so that category navigation uses the standardized nav
component with collapse support.

#### Acceptance Criteria

1. THE POS home page SHALL render `Nav.POS.Sidebar` in place of the
   Custom_POS_Sidebar import from `components/pos-sidebar.tsx`.
2. THE Nav_POS_Sidebar SHALL receive the `collapsed` state from the
   `NavProvider` collapse state.
3. THE Nav_POS_Sidebar SHALL render category items from the NavTree nodes using
   `Nav.Menu` and `Nav.Item` as children.
4. WHEN a user clicks a category item in Nav_POS_Sidebar, THE Nav_POS_Sidebar
   SHALL update the active node in the NavProvider and trigger the
   `onCategoryChange` callback.
5. THE Nav_POS_Sidebar SHALL support smooth width transition between expanded
   (200px) and collapsed (60px) states.
6. WHILE the Nav_POS_Sidebar is collapsed, THE Nav_POS_Sidebar SHALL display
   category icons only without labels.

### Requirement 6: POS Migration — Replace Spotlight

**User Story:** As a developer, I want to replace the custom spotlight
implementation with `Nav.POS.Spotlight`, so that the command palette uses the
standardized nav component.

#### Acceptance Criteria

1. THE POS_Layout SHALL render `Nav.POS.Spotlight` in place of the custom
   `Spotlight` import from `components/overlays/spotlight.tsx`.
2. THE Nav_POS_Spotlight SHALL receive the `open` state and `onClose` callback
   from the POS_Layout.
3. THE Nav_POS_Spotlight SHALL receive a command execution callback that maps to
   the existing `execCommand` handler in POS_Layout.
4. WHEN the user presses `⌘K` or `Ctrl+K`, THE Nav_POS_Spotlight SHALL open the
   command palette overlay.
5. THE Nav_POS_Spotlight SHALL display grouped commands (Actions, System,
   Preferences) with icons, labels, and keyboard shortcut badges.

### Requirement 7: POS Migration — Cleanup

**User Story:** As a developer, I want to remove the custom navigation
implementations that are replaced by `@nav/ui`, so that the codebase has no
redundant navigation code.

#### Acceptance Criteria

1. WHEN the migration is complete, THE vite-template app SHALL remove the
   Custom_POS_Header file at `components/pos-header.tsx`.
2. WHEN the migration is complete, THE vite-template app SHALL remove the
   Custom_POS_Sidebar file at `components/pos-sidebar.tsx`.
3. WHEN the migration is complete, THE vite-template app SHALL update all import
   references that pointed to the removed files to use `@nav/ui` imports.
4. IF any component outside the POS layout still imports the removed files, THEN
   THE build system SHALL report a compile error that guides the developer to
   the replacement import.

### Requirement 8: Slot System — Nav Slot Injection Points

**User Story:** As a developer, I want all nav components to have `<Slot>`
injection points, so that I can extend navigation UI from the application level
without modifying the nav package.

#### Acceptance Criteria

1. THE Nav_POS_Header SHALL render `<Slot name="nav.pos.header.before" />`
   before its content and `<Slot name="nav.pos.header.after" />` after its
   content.
2. THE Nav_POS_Sidebar SHALL render `<Slot name="nav.pos.sidebar.before" />`
   before its children and `<Slot name="nav.pos.sidebar.after" />` after its
   children.
3. THE generic `Nav.Header` SHALL render `<Slot name="nav.header.before" />`
   before its content and `<Slot name="nav.header.after" />` after its content.
4. THE generic `Nav.Sidebar` SHALL render `<Slot name="nav.sidebar.before" />`
   before its children and `<Slot name="nav.sidebar.after" />` after its
   children.
5. THE generic `Nav.Footer` SHALL render `<Slot name="nav.footer.before" />`
   before its content and `<Slot name="nav.footer.after" />` after its content.
6. THE `Nav.Dashboard.Sidebar` SHALL render
   `<Slot name="nav.dashboard.sidebar.before" />` before its children and
   `<Slot name="nav.dashboard.sidebar.after" />` after its children.
7. THE `Nav.Dashboard.Layout` SHALL render
   `<Slot name="nav.dashboard.layout.before" />` before its content and
   `<Slot name="nav.dashboard.layout.after" />` after its content.
8. THE `Nav.Landing.Header` SHALL render
   `<Slot name="nav.landing.header.before" />` before its content and
   `<Slot name="nav.landing.header.after" />` after its content.
9. THE `Nav.Landing.Footer` SHALL render
   `<Slot name="nav.landing.footer.before" />` before its content and
   `<Slot name="nav.landing.footer.after" />` after its content.

### Requirement 9: Slot System — NavigationModule DI Module

**User Story:** As a developer, I want a `NavigationModule` with static methods
for registering nav slot content, so that I can declaratively extend navigation
from the `AppModule`.

#### Acceptance Criteria

1. THE NavigationModule SHALL be a DI module decorated with `@Module({})` and
   `@Package({})`, following the same pattern as `UIModule`.
2. THE NavigationModule SHALL provide a static
   `registerSlot(slotName: string, entry: SlotEntryOptions): DynamicModule`
   method that registers a single entry to the SlotRegistry.
3. THE NavigationModule SHALL provide a static
   `registerSlots(registrations: SlotRegistration[]): DynamicModule` method that
   registers multiple entries to the SlotRegistry.
4. THE NavigationModule SHALL use the same `slotRegistry` singleton from
   `@abdokouta/react-ui` to store entries.
5. THE NavigationModule SHALL be importable in the AppModule's `imports` array
   to register nav slot content at application startup.
6. WHEN `NavigationModule.registerSlot("nav.pos.header.after", entry)` is called
   in AppModule, THE Slot_Component with `name="nav.pos.header.after"` inside
   Nav_POS_Header SHALL render the registered entry.

### Requirement 10: Slot System — Demo Slot Registration

**User Story:** As a developer, I want the AppModule to demonstrate nav slot
registration, so that I can verify the slot system works end-to-end.

#### Acceptance Criteria

1. THE AppModule SHALL import `NavigationModule` and register at least one slot
   entry for `nav.pos.header.after` that renders a visible indicator element.
2. THE AppModule SHALL register at least one slot entry for
   `nav.pos.sidebar.after` that renders a visible indicator element.
3. WHEN the POS layout renders, THE registered slot entries SHALL appear in the
   correct positions within the Nav_POS_Header and Nav_POS_Sidebar components.
