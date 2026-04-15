# Implementation Plan: Nav Integration

## Overview

Integrate the `@nav/*` package suite into the `vite-template` app across three
workstreams: (1) add `<Slot>` injection points to `@nav/ui` components and
create the `NavigationModule` DI module, (2) migrate the POS layout from custom
components to `Nav.POS.*`, and (3) build a comprehensive `/nav-demo` page. Tasks
are ordered so the slot system and module are wired first, then POS migration
builds on them, and the demo page comes last.

## Tasks

- [x] 1. Add `<Slot>` injection points to `@nav/ui` components
  - [x] 1.1 Add `before`/`after` slots to generic components (`Nav.Header`,
        `Nav.Sidebar`, `Nav.Footer`)
    - Import `Slot` from `@abdokouta/react-ui` in
      `packages/nav/ui/src/header.tsx`, `sidebar.tsx`, `footer.tsx`
    - Add `<Slot name="nav.header.before" />` /
      `<Slot name="nav.header.after" />` in `header.tsx`
    - Add `<Slot name="nav.sidebar.before" />` /
      `<Slot name="nav.sidebar.after" />` in `sidebar.tsx`
    - Add `<Slot name="nav.footer.before" />` /
      `<Slot name="nav.footer.after" />` in `footer.tsx`
    - _Requirements: 8.3, 8.4, 8.5_

  - [x] 1.2 Add `before`/`after` slots to POS components (`Nav.POS.Header`,
        `Nav.POS.Sidebar`)
    - Import `Slot` from `@abdokouta/react-ui` in
      `packages/nav/ui/src/pos/header.tsx`, `pos/sidebar.tsx`
    - Add `<Slot name="nav.pos.header.before" />` /
      `<Slot name="nav.pos.header.after" />` in `pos/header.tsx`
    - Add `<Slot name="nav.pos.sidebar.before" />` /
      `<Slot name="nav.pos.sidebar.after" />` in `pos/sidebar.tsx`
    - _Requirements: 8.1, 8.2_

  - [x] 1.3 Add `before`/`after` slots to Dashboard components
        (`Nav.Dashboard.Sidebar`, `Nav.Dashboard.Layout`)
    - Import `Slot` from `@abdokouta/react-ui` in
      `packages/nav/ui/src/dashboard/sidebar.tsx`, `dashboard/layout.tsx`
    - Add `<Slot name="nav.dashboard.sidebar.before" />` /
      `<Slot name="nav.dashboard.sidebar.after" />` in `dashboard/sidebar.tsx`
    - Add `<Slot name="nav.dashboard.layout.before" />` /
      `<Slot name="nav.dashboard.layout.after" />` in `dashboard/layout.tsx`
    - _Requirements: 8.6, 8.7_

  - [x] 1.4 Add `before`/`after` slots to Landing components
        (`Nav.Landing.Header`, `Nav.Landing.Footer`)
    - Import `Slot` from `@abdokouta/react-ui` in
      `packages/nav/ui/src/landing/header.tsx`, `landing/footer.tsx`
    - Add `<Slot name="nav.landing.header.before" />` /
      `<Slot name="nav.landing.header.after" />` in `landing/header.tsx`
    - Add `<Slot name="nav.landing.footer.before" />` /
      `<Slot name="nav.landing.footer.after" />` in `landing/footer.tsx`
    - _Requirements: 8.8, 8.9_

- [x] 2. Create `NavigationModule` DI module and wire slot registrations
  - [x] 2.1 Create `NavigationModule` in
        `packages/nav/ui/src/navigation.module.ts`
    - Implement `@Module({})` and `@Package({})` decorated class following the
      `UIModule` pattern
    - Add static `registerSlot(slotName, entry)` method that delegates to
      `slotRegistry.registerEntry()`
    - Add static `registerSlots(registrations[])` method for batch registration
    - Import `slotRegistry` and `SlotEntryOptions` from `@abdokouta/react-ui`
    - Export `NavigationModule` and `SlotRegistration` type from
      `packages/nav/ui/src/index.ts`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]\* 2.2 Write property test: slot registration round-trip via
    NavigationModule
    - **Property 2: Slot registration round-trip via NavigationModule**
    - Generate random slot name strings and `SlotEntryOptions` objects with
      `fast-check`
    - Call `NavigationModule.registerSlot(slotName, entry)`, verify
      `slotRegistry.getEntries(slotName)` returns the entry with matching `id`
      and `render`
    - Test batch `registerSlots` with multiple entries across different slot
      names
    - **Validates: Requirements 9.2, 9.3**

  - [x] 2.3 Register demo nav slot entries in `AppModule`
    - Import `NavigationModule` from `@nav/ui` in
      `apps/vite-template/src/app.module.ts`
    - Register `nav.pos.header.after` entry with a visible shift indicator
      element
    - Register `nav.pos.sidebar.after` entry with a visible help element
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 3. Checkpoint — Slot system verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify `<Slot>` components are added to all 9 nav component files
  - Verify `NavigationModule` exports are accessible from `@nav/ui`
  - Verify `AppModule` slot registrations compile without errors

- [ ] 4. POS Migration — NavProvider wiring and header replacement
  - [x] 4.1 Add `@nav/ui` dependency and build `NavTree` helper in POS layout
    - Add `@nav/ui` to `apps/vite-template/package.json` dependencies (if not
      already present)
    - Create `buildPosNavTree(categories)` helper function in
      `apps/vite-template/src/layouts/pos-layout.tsx` (or a shared util)
    - Use `resolveNavConfig("pos")`, `createNavTree`, `addSection`, `addNode`
      from `@nav/ui` to map `categoriesData` to a `NavTree`
    - Handle duplicate category IDs gracefully (skip + log warning)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]\* 4.2 Write property test: NavTree building preserves category data
    - **Property 1: NavTree building preserves category data**
    - Generate random arrays of `EventCategory` objects (random id, label,
      color) with `fast-check`
    - Build NavTree via `buildPosNavTree`, verify node count matches input
      length
    - Verify each node's `id`, `label`, and `path` match the source category
    - **Validates: Requirements 3.2, 3.4**

  - [x] 4.3 Wrap POS layout in `NavProvider` and replace `POSHeader` with
        `Nav.POS.Header`
    - Import `NavProvider`, `Nav` from `@nav/ui` in
      `apps/vite-template/src/layouts/pos-layout.tsx`
    - Wrap layout content in
      `<NavProvider config={posConfig} tree={posNavTree} currentPath={activeCategory}>`
    - Replace `<POSHeader ... />` with `<Nav.POS.Header>` passing slot props:
      logo, tenant, spotlight trigger, shift button, clock, notifications, AI
      toggle, user avatar
    - Preserve all existing header interactions: `onOpenSpotlight`,
      `onOpenShift`, `onOpenNotifications`, `onOpenProfile`, `onToggleAI`
    - Remove import of `POSHeader` from `@/components/layout/pos-header`
    - _Requirements: 3.1, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 4.4 Replace `Spotlight` with `Nav.POS.Spotlight` in POS layout
    - Replace `<Spotlight ... />` with `<Nav.POS.Spotlight>` in `pos-layout.tsx`
    - Map existing `SPOTLIGHT_COMMANDS` to `SpotlightCommand[]` format for
      `Nav.POS.Spotlight`
    - Pass `open`, `onClose`, and command execution callback
    - Remove import of `Spotlight` from `@/components/overlays/spotlight`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 5. POS Migration — Sidebar replacement
  - [ ] 5.1 Replace `POSSidebar` with `Nav.POS.Sidebar` in POS home page
    - Import `Nav`, `useNav`, `useNavActions` from `@nav/ui` in
      `apps/vite-template/src/pages/pos-home.tsx`
    - Replace the `POSSidebar` usage with `<Nav.POS.Sidebar>` consuming collapse
      state from `useNav()`
    - Render category items via `<Nav.Menu>` and `<Nav.Item>` children
    - Wire `onCategoryChange` through `useNavActions().setActiveNode()`
    - Support collapsed (60px, icons only) and expanded (200px, icons + labels)
      states
    - Remove import of `POSSidebar` from `@/components/pos-sidebar`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 6. POS Migration — Cleanup removed files
  - [ ] 6.1 Delete custom POS navigation files and update imports
    - Delete `apps/vite-template/src/components/pos-header.tsx`
    - Delete `apps/vite-template/src/components/layout/pos-header.tsx`
    - Delete `apps/vite-template/src/components/pos-sidebar.tsx`
    - Verify no remaining imports reference the deleted files (TypeScript
      compilation check)
    - Note: `components/overlays/spotlight.tsx` is kept since it may be used
      elsewhere; only the POS layout import is removed
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 7. Checkpoint — POS migration verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify POS layout renders `Nav.POS.Header`, `Nav.POS.Sidebar`,
    `Nav.POS.Spotlight` correctly
  - Verify slot entries from `AppModule` appear in the POS header and sidebar
  - Verify no compile errors from removed files

- [ ] 8. Nav Demo Page — Route, layout, and component showcase
  - [ ] 8.1 Create `NavDemoPage` component and register route
    - Create `apps/vite-template/src/pages/nav-demo.tsx` with tabbed layout
      (Generic, POS, Dashboard, Landing)
    - Register `/nav-demo` route in `apps/vite-template/src/app.tsx`
    - Manage `activeTab` state for switching between component groups
    - _Requirements: 1.1, 1.6_

  - [ ] 8.2 Implement Generic tab with all generic components
    - Wrap in `NavProvider` with dashboard preset from `NAV_CONTEXT_PRESETS`
    - Build sample `NavTree` with at least 3 sections and 5 nodes per section
    - Render `Nav.Sidebar`, `Nav.Header`, `Nav.Menu`, `Nav.Item`,
      `Nav.Breadcrumbs`, `Nav.Footer`, `Nav.UserMenu`, `Nav.Search`
    - _Requirements: 1.2, 2.1, 2.8_

  - [ ] 8.3 Implement POS tab with all POS components
    - Wrap in `NavProvider` with POS preset
    - Build sample POS `NavTree` with categories
    - Render `Nav.POS.Header`, `Nav.POS.Sidebar`, `Nav.POS.Spotlight`,
      `Nav.POS.UserMenu`
    - _Requirements: 1.3, 2.1, 2.8_

  - [ ] 8.4 Implement Dashboard tab with all Dashboard components
    - Wrap in `NavProvider` with dashboard preset
    - Build sample dashboard `NavTree`
    - Render `Nav.Dashboard.Layout`, `Nav.Dashboard.Sidebar`,
      `Nav.Dashboard.Breadcrumbs`, `Nav.Dashboard.SettingsNav`
    - _Requirements: 1.4, 2.1, 2.8_

  - [ ] 8.5 Implement Landing tab with all Landing components
    - Wrap in `NavProvider` with landing preset
    - Build sample landing `NavTree`
    - Render `Nav.Landing.Header`, `Nav.Landing.MobileDrawer`,
      `Nav.Landing.Footer`
    - _Requirements: 1.5, 2.1, 2.8_

  - [ ] 8.6 Add interactive feature demonstrations
    - Active state resolution: highlight active nav node on click via
      `useNavActions().setActiveNode()`
    - Breadcrumb generation: render `Nav.Breadcrumbs` that updates on active
      node change
    - Role-based filtering: add role selector UI that calls `filterByRole` to
      filter visible nodes
    - Collapse toggle: add button to toggle `Nav.Sidebar` / `Nav.POS.Sidebar`
      collapsed state
    - Keyboard navigation: bind arrow keys and typeahead search within sidebar
      menus
    - Plugin demos: register `createBadgePlugin`, `createSearchPlugin`,
      `createSpotlightPlugin` from `@nav/plugins`
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]\* 8.7 Write property test: slot injection renders registered entries in
    nav components
    - **Property 3: Slot injection renders registered entries in nav
      components**
    - Register random slot entries to known nav slot names via `slotRegistry`
    - Render the corresponding nav component
    - Verify the entry's rendered content appears in the DOM at the correct
      position (before/after)
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9,
      9.6**

  - [ ]\* 8.8 Write property test: role-based filtering only returns visible
    nodes
    - **Property 4: Role-based filtering only returns visible nodes**
    - Generate random NavTrees with nodes having various visibility rules
      (roles, public, custom) using `fast-check`
    - Generate random role arrays
    - Apply `filterByRole(tree, roles)` and verify every remaining node is
      visible to at least one provided role or has public visibility
    - **Validates: Requirements 2.4**

- [ ] 9. Final checkpoint — Full integration verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify `/nav-demo` page renders all four tabs with all components
  - Verify POS layout uses `Nav.POS.*` components with working slot injection
  - Verify no dead imports or unused custom component files remain

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document
- The slot system (tasks 1–3) is built first since both POS migration and demo
  page depend on it
- All code changes target `apps/vite-template/` and `packages/nav/ui/` only — no
  new packages
