# Implementation Plan: Composable Navigation System

## Overview

Implement a composable, headless navigation system across five packages
(`@nav/core`, `@nav/react`, `@nav/ui`, `@nav/plugins`, `@nav/refine`) under
`packages/nav/`, following the established `@cart/*` monorepo conventions. The
implementation proceeds bottom-up: workspace setup → core engine → plugins →
React integration → UI components → Refine adapter, with each step building on
the previous.

## Tasks

- [x] 1. Scaffold monorepo workspace and package boilerplate
  - [x] 1.1 Add `packages/nav/*` to `pnpm-workspace.yaml`
    - Append `"packages/nav/*"` to the packages list in `pnpm-workspace.yaml`
    - _Requirements: 16.7_

  - [x] 1.2 Create `@nav/core` package boilerplate
    - Create `packages/nav/core/` with `package.json`, `tsconfig.json`,
      `tsup.config.ts`, `vitest.config.ts`, `turbo.json`
    - Follow exact `@cart/core` conventions: tsup with `clean: !options.watch`,
      vitest with `environment: "node"`, TypeScript 5.6.3 pinned, bundler
      moduleResolution
    - Create `packages/nav/core/src/index.ts` barrel export file
    - Zero runtime dependencies, `fast-check` + `tsup` + `typescript` + `vitest`
      as devDependencies
    - _Requirements: 16.1_

  - [x] 1.3 Create `@nav/plugins` package boilerplate
    - Create `packages/nav/plugins/` with same config file pattern as
      `@cart/plugins`
    - Dependency on `@nav/core` via `workspace:*`, `fast-check` in
      devDependencies
    - Create `packages/nav/plugins/src/index.ts` barrel export
    - _Requirements: 16.4_

  - [x] 1.4 Create `@nav/react` package boilerplate
    - Create `packages/nav/react/` with same config file pattern as
      `@cart/react`
    - Dependency on `@nav/core` via `workspace:*`, React as peerDependency
    - jsdom vitest environment, `@testing-library/react` in devDependencies
    - Create `packages/nav/react/src/index.ts` barrel export
    - _Requirements: 16.2_

  - [x] 1.5 Create `@nav/ui` package boilerplate
    - Create `packages/nav/ui/` with same config file pattern as `@cart/ui`
    - Dependencies on `@nav/core` + `@nav/react` via `workspace:*`, HeroUI +
      React + Tailwind as peerDependencies
    - jsdom vitest environment, `@testing-library/react` in devDependencies
    - Create `packages/nav/ui/src/index.ts` barrel export
    - _Requirements: 16.3_

  - [x] 1.6 Create `@nav/refine` package boilerplate
    - Create `packages/nav/refine/` with config files following `@cart/react`
      pattern
    - Dependencies on `@nav/core` + `@nav/react` via `workspace:*`,
      `@refinedev/core` as peerDependency
    - jsdom vitest environment, mocked `@refinedev/core` hooks in
      devDependencies
    - Create `packages/nav/refine/src/index.ts` barrel export
    - _Requirements: 16.5, 16.8_

- [x] 2. Checkpoint - Verify workspace setup
  - Ensure all five packages are recognized by pnpm (`pnpm ls --recursive`),
    ensure `pnpm build` and `pnpm test` run without errors on the empty
    packages. Ask the user if questions arise.

- [x] 3. Implement @nav/core types and data models
  - [x] 3.1 Define all core TypeScript types and interfaces
    - Create `packages/nav/core/src/types.ts` with all types: `NavContext`,
      `MatchStrategy`, `BadgeType`, `BadgeVariant`, `BadgeConfig`,
      `VisibilityRule` (union of Roles/Permissions/Custom/Public), `NavNode`,
      `NavNodeDef`, `NavSection`, `NavSectionDef`, `NavTree`, `ResolveResult`,
      `BreadcrumbEntry`, `BreadcrumbTrail`, `CollapseState`, `KeyDescriptor`,
      `KeyboardBindings`, `NavFeatures`, `NavConfig`, `NavPlugin`,
      `NavPluginHooks`, `NavPluginRegistry`, `NavAction`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 3.2 Define error classes
    - Create `packages/nav/core/src/errors.ts` with `DuplicateNodeError`,
      `NavDeserializationError`, `NavSchemaValidationError`
    - _Requirements: 2.7, 10.4, 10.5_

  - [x] 3.3 Implement context configuration presets
    - Create `packages/nav/core/src/config.ts` with `NAV_CONTEXT_PRESETS` record
      and `resolveNavConfig` function
    - Implement presets for "pos", "dashboard", "landing", "ecommerce", "admin"
      with the specified defaults
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]\* 3.4 Write property test for context config preset application
    - **Property 21: Context config preset application**
    - **Validates: Requirements 8.3, 8.4**

- [x] 4. Implement @nav/core tree construction engine
  - [x] 4.1 Implement `createNavTree` function
    - Create `packages/nav/core/src/tree.ts` with
      `createNavTree(context, config?)` returning a new empty NavTree bound to
      the context with correct version
    - _Requirements: 2.1_

  - [ ]\* 4.2 Write property test for createNavTree
    - **Property 27: createNavTree returns empty tree for context**
    - **Validates: Requirements 2.1**

  - [x] 4.3 Implement `addSection` and `addNode` functions
    - Implement `addSection(tree, sectionDef)` to add sections to the tree
    - Implement `addNode(tree, sectionId, nodeDef, parentId?)` with duplicate id
      detection, parent placement, and root-level placement
    - All mutations return new NavTree instances (immutability)
    - _Requirements: 2.2, 2.3, 2.4, 2.7, 2.9_

  - [ ]\* 4.4 Write property tests for addSection and addNode
    - **Property 3: addNode placement**
    - **Property 4: addSection inclusion**
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [x] 4.5 Implement `removeNode` and `moveNode` functions
    - Implement `removeNode(tree, nodeId)` with cascading deletion, no-op for
      non-existent ids
    - Implement `moveNode(tree, nodeId, newParentId, newSectionId?)` relocating
      subtree
    - _Requirements: 2.5, 2.6, 2.8_

  - [ ]\* 4.6 Write property tests for removeNode and moveNode
    - **Property 5: removeNode cascading deletion**
    - **Property 6: moveNode relocation**
    - **Validates: Requirements 2.5, 2.6**

  - [ ]\* 4.7 Write property tests for immutability and node id uniqueness
    - **Property 1: NavTree node id uniqueness**
    - **Property 2: NavSection ordering**
    - **Property 7: Immutability of all operations**
    - **Validates: Requirements 1.5, 1.6, 2.9, 5.6**

- [x] 5. Implement @nav/core active state resolution
  - [x] 5.1 Implement `resolve` function
    - Create `packages/nav/core/src/resolver.ts` with
      `resolve(tree, path, strategy?)` implementing exact, prefix, and pattern
      matching strategies
    - Longest prefix match with exact match preference, at most one active node,
      full ancestor chain in result
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]\* 5.2 Write property tests for active resolution
    - **Property 8: Active resolution uniqueness and longest match**
    - **Property 9: Strategy-aware resolution**
    - **Property 10: Ancestor chain completeness**
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.5, 3.6, 3.7**

- [x] 6. Implement @nav/core breadcrumb generation
  - [x] 6.1 Implement `generateBreadcrumbs` function
    - Create `packages/nav/core/src/breadcrumbs.ts` with
      `generateBreadcrumbs(tree, nodeId)` returning BreadcrumbTrail with label
      and path for each ancestor
    - Handle null nodeId (empty trail), root-level nodes (single entry), nested
      nodes (D+1 entries)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]\* 6.2 Write property test for breadcrumb depth invariant
    - **Property 11: Breadcrumb depth invariant**
    - **Validates: Requirements 4.1, 4.4, 4.5**

- [x] 7. Implement @nav/core visibility filtering
  - [x] 7.1 Implement `filterByRole` function
    - Create `packages/nav/core/src/filter.ts` with
      `filterByRole(tree, roles, userContext?)` supporting roles, permissions,
      custom, and public rule types
    - Filtered parent cascades to children, visible parent with no visible
      children retains empty children array
    - Empty roles set returns only public/null-visibility nodes
    - Returns new NavTree (immutability)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]\* 7.2 Write property tests for role-based filtering
    - **Property 12: Role-based filtering correctness**
    - **Property 13: Visible parent with no visible children**
    - **Property 14: Empty roles yields only public nodes**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.7**

- [x] 8. Implement @nav/core collapse state management
  - [x] 8.1 Implement collapse state functions
    - Create `packages/nav/core/src/collapse.ts` with `createCollapseState`,
      `toggleCollapse`, `setCollapsed`, `collapseAll`, `expandToNode`
    - Default collapsed state from NavConfig when node not in record
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]\* 8.2 Write property tests for collapse state
    - **Property 15: Toggle collapse round-trip**
    - **Property 16: collapseAll sets all to collapsed**
    - **Property 17: expandToNode expands ancestor chain**
    - **Validates: Requirements 6.2, 6.4, 6.5, 6.7**

- [x] 9. Implement @nav/core keyboard navigation
  - [x] 9.1 Implement keyboard binding functions
    - Create `packages/nav/core/src/keyboard.ts` with `createKeyboardBindings`,
      `registerShortcut`, `resolveKeyEvent`
    - Implement focus navigation helpers for ArrowUp/Down/Left/Right, Home, End,
      Enter, Space
    - Implement typeahead search logic
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

  - [ ]\* 9.2 Write property tests for keyboard navigation
    - **Property 18: Keyboard shortcut registration round-trip**
    - **Property 19: List navigation focus ordering**
    - **Property 20: Typeahead search**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.7, 7.8, 7.9**

- [x] 10. Implement @nav/core plugin system
  - [x] 10.1 Implement plugin registry functions
    - Create `packages/nav/core/src/plugins.ts` with `createPluginRegistry`,
      `registerPlugin`, `applyPluginNodes`, `applyPluginBadges`,
      `invokePluginHook`
    - Plugin hook errors caught and logged, shortcut conflicts preserve existing
      binding
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [ ]\* 10.2 Write property tests for plugin system
    - **Property 22: Plugin node extension**
    - **Property 23: Plugin badge application**
    - **Property 24: Plugin shortcut merging (existing wins)**
    - **Validates: Requirements 9.3, 9.4, 9.6, 9.8**

- [x] 11. Implement @nav/core serialization
  - [x] 11.1 Implement serialize and deserialize functions
    - Create `packages/nav/core/src/serializer.ts` with `serialize(tree)` and
      `deserialize(json)`
    - Custom VisibilityRules excluded from serialization, restored as "public"
      on deserialize
    - Invalid JSON returns `NavDeserializationError`, schema violations return
      `NavSchemaValidationError`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]\* 11.2 Write property tests for serialization
    - **Property 25: Serialization round-trip**
    - **Property 26: Custom visibility rules excluded from serialization**
    - **Validates: Requirements 10.3, 10.6**

- [x] 12. Wire @nav/core barrel export and build
  - Update `packages/nav/core/src/index.ts` to re-export all public functions,
    types, errors, and constants from the modules created in tasks 3–11
  - Ensure `pnpm build` succeeds for `@nav/core`
  - _Requirements: 16.1, 16.6_

- [x] 13. Checkpoint - Verify @nav/core
  - Ensure all @nav/core tests pass, ensure the package builds cleanly, ensure
    it runs in Node.js without browser dependencies. Ask the user if questions
    arise.

- [x] 14. Implement @nav/plugins package
  - [x] 14.1 Implement plugin factory functions
    - Create `packages/nav/plugins/src/badge-plugin.ts` with `createBadgePlugin`
    - Create `packages/nav/plugins/src/search-plugin.ts` with
      `createSearchPlugin`
    - Create `packages/nav/plugins/src/analytics-plugin.ts` with
      `createAnalyticsPlugin`
    - Create `packages/nav/plugins/src/spotlight-plugin.ts` with
      `createSpotlightPlugin`
    - Each factory returns a `NavPlugin` conforming to `@nav/core` types
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 14.2 Wire @nav/plugins barrel export
    - Update `packages/nav/plugins/src/index.ts` to re-export all plugin
      factories
    - _Requirements: 16.4_

  - [ ]\* 14.3 Write unit tests for plugin factories
    - Test each factory produces a valid NavPlugin with correct name, hooks, and
      behavior
    - Test error isolation (plugin hook throws → caught and logged)
    - _Requirements: 9.7_

- [x] 15. Implement @nav/react integration layer
  - [x] 15.1 Implement NavProvider context and state management
    - Create `packages/nav/react/src/nav-context.ts` with React context
      definition
    - Create `packages/nav/react/src/nav-provider.tsx` implementing
      `NavProvider` that initializes NavEngine, registers plugins, applies role
      filtering, resolves active node, and provides context
    - Accept `config`, `tree`, `plugins`, `roles`, `userContext`, `currentPath`
      props
    - Auto re-resolve active node when `currentPath` changes
    - _Requirements: 11.1, 11.2, 11.3, 11.10_

  - [x] 15.2 Implement consumer hooks
    - Create `packages/nav/react/src/hooks.ts` with `useNav`, `useNavActions`,
      `useBreadcrumbs`, `useNavSection`, `useNavBadge`
    - Each hook throws descriptive error when used outside NavProvider
    - `useNav` returns filtered tree and active node
    - `useNavActions` returns bound action functions (navigate, toggleCollapse,
      expandToNode, collapseAll, registerShortcut)
    - `useBreadcrumbs` returns current BreadcrumbTrail
    - `useNavSection` returns nodes for a specific section
    - `useNavBadge` returns BadgeConfig for a specific node
    - _Requirements: 11.4, 11.5, 11.6, 11.7, 11.8, 11.9_

  - [x] 15.3 Wire @nav/react barrel export
    - Update `packages/nav/react/src/index.ts` to re-export NavProvider, all
      hooks, and relevant types from `@nav/core`
    - _Requirements: 16.2_

  - [ ]\* 15.4 Write unit tests for hooks and provider
    - Test hook behavior (useNav returns tree/activeNode, useNavActions returns
      functions, etc.)
    - Test error throwing when hooks used outside NavProvider
    - Test route change triggers active node re-resolution
    - _Requirements: 11.4, 11.5, 11.6, 11.7, 11.8, 11.9_

- [x] 16. Checkpoint - Verify @nav/react
  - Ensure all @nav/react tests pass, ensure the package builds cleanly. Ask the
    user if questions arise.

- [x] 17. Implement @nav/ui generic compound components
  - [x] 17.1 Implement Nav.Sidebar and Nav.Header components
    - Create `packages/nav/ui/src/sidebar.tsx` with `Nav.Sidebar` supporting
      collapsed/expanded modes and collapsible toggle
    - Create `packages/nav/ui/src/header.tsx` with `Nav.Header` supporting
      left/center/right slot areas
    - Apply ARIA attributes: `role="navigation"` on both
    - _Requirements: 12.1, 12.2, 12.3, 12.12_

  - [x] 17.2 Implement Nav.Menu and Nav.Item compound components
    - Create `packages/nav/ui/src/menu.tsx` with `Nav.Menu` rendering nested
      menu list from NavSection up to maxDepth
    - Create `packages/nav/ui/src/item.tsx` with `Nav.Item` and sub-composables:
      `Nav.Item.Icon`, `Nav.Item.Label`, `Nav.Item.Badge`, `Nav.Item.Shortcut`,
      `Nav.Item.Children`
    - Click triggers navigation or toggle collapse for items with children
    - Apply ARIA: `role="menu"` / `role="menubar"` on Menu, `role="menuitem"` on
      Item, `aria-current="page"` on active, `aria-expanded` on collapsible
    - _Requirements: 12.4, 12.5, 12.10, 12.11, 12.12_

  - [x] 17.3 Implement Nav.Breadcrumbs, Nav.Footer, Nav.UserMenu, Nav.Search
    - Create `packages/nav/ui/src/breadcrumbs.tsx` with `Nav.Breadcrumbs`
      rendering BreadcrumbTrail as navigable links with separators
    - Create `packages/nav/ui/src/footer.tsx` with `Nav.Footer` rendering
      grouped link columns
    - Create `packages/nav/ui/src/user-menu.tsx` with `Nav.UserMenu` rendering
      user avatar dropdown with profile/settings/sign-out items
    - Create `packages/nav/ui/src/search.tsx` with `Nav.Search` rendering search
      input that filters NavNodes by label
    - _Requirements: 12.6, 12.7, 12.8, 12.9_

  - [ ]\* 17.4 Write unit tests for generic Nav components
    - Test rendering of Sidebar, Header, Menu, Item, Breadcrumbs, Footer,
      UserMenu, Search
    - Test ARIA attributes are correctly applied
    - Test click handlers trigger navigation/collapse
    - _Requirements: 12.1, 12.3, 12.4, 12.5, 12.6, 12.10, 12.11, 12.12_

- [x] 18. Implement @nav/ui POS-specific components
  - [x] 18.1 Implement Nav.POS.Header, Nav.POS.Sidebar, Nav.POS.Spotlight,
        Nav.POS.UserMenu
    - Create `packages/nav/ui/src/pos/header.tsx` with POS header layout
      (sidebar toggle, logo, tenant name, spotlight trigger, shift management,
      clock, notification bell, AI assistant, user avatar slots)
    - Create `packages/nav/ui/src/pos/sidebar.tsx` with POS category sidebar
      (expanded/collapsed with smooth width transition)
    - Create `packages/nav/ui/src/pos/spotlight.tsx` with full-screen command
      palette overlay (search input, grouped commands, keyboard hints, populated
      from NavTree + plugin commands)
    - Create `packages/nav/ui/src/pos/user-menu.tsx` with user profile drawer
      (animated stack navigation for sub-views)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [ ]\* 18.2 Write unit tests for POS components
    - Test POS header renders all slot areas
    - Test POS sidebar collapsed/expanded modes
    - Test spotlight populates commands from NavTree
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 19. Implement @nav/ui Dashboard-specific components
  - [x] 19.1 Implement Nav.Dashboard.Layout, Nav.Dashboard.Sidebar,
        Nav.Dashboard.Breadcrumbs, Nav.Dashboard.SettingsNav
    - Create `packages/nav/ui/src/dashboard/layout.tsx` with dashboard shell
      (collapsible sidebar + header with breadcrumbs + content area)
    - Create `packages/nav/ui/src/dashboard/sidebar.tsx` with multi-section
      sidebar (section labels, nested items, collapse toggle, icons-only with
      tooltips when collapsed)
    - Create `packages/nav/ui/src/dashboard/breadcrumbs.tsx` with dashboard
      breadcrumbs from active NavNode ancestor chain
    - Create `packages/nav/ui/src/dashboard/settings-nav.tsx` with vertical
      settings navigation list with active state highlighting
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ]\* 19.2 Write unit tests for Dashboard components
    - Test dashboard layout renders sidebar, header, content areas
    - Test sidebar collapse shows icons with tooltips
    - _Requirements: 14.1, 14.2, 14.3_

- [x] 20. Implement @nav/ui Landing-specific components
  - [x] 20.1 Implement Nav.Landing.Header, Nav.Landing.MobileDrawer,
        Nav.Landing.Footer
    - Create `packages/nav/ui/src/landing/header.tsx` with sticky top nav bar
      (logo, horizontal menu, CTA buttons, responsive hamburger at mobile
      breakpoint)
    - Create `packages/nav/ui/src/landing/mobile-drawer.tsx` with full-height
      slide-in panel (menu items, close button, CTA buttons)
    - Create `packages/nav/ui/src/landing/footer.tsx` with grouped link columns
      (heading + links per column) and bottom bar (legal links, copyright)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ]\* 20.2 Write unit tests for Landing components
    - Test sticky header renders menu items and CTA
    - Test mobile drawer opens/closes
    - Test footer renders link columns and legal bar
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 21. Wire @nav/ui barrel export and Nav compound component namespace
  - Create `packages/nav/ui/src/nav.ts` assembling the `Nav` namespace object
    with all generic, POS, Dashboard, and Landing sub-components
  - Update `packages/nav/ui/src/index.ts` to re-export the `Nav` namespace and
    individual components
  - _Requirements: 16.3_

- [x] 22. Checkpoint - Verify @nav/ui
  - Ensure all @nav/ui tests pass, ensure the package builds cleanly. Ask the
    user if questions arise.

- [x] 23. Implement @nav/refine adapter
  - [x] 23.1 Implement Refine NavTree builder and sync functions
    - Create `packages/nav/refine/src/builder.ts` with
      `buildNavTreeFromResources(resources, context, config?)` mapping Refine
      resources to NavNodes (list route → path, meta.label → label, meta.icon →
      icon, meta.parent → nesting, meta.hide → skip)
    - Create `packages/nav/refine/src/sync.ts` with
      `syncWithRefineMenu(tree, menuItems, sectionId?)` merging Refine menu
      items into NavTree
    - Create `packages/nav/refine/src/breadcrumbs.ts` with
      `refineBreadcrumbsToTrail(breadcrumbs)` converting Refine breadcrumb items
      to BreadcrumbTrail
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [x] 23.2 Implement RefineNavProvider and Refine-aware hooks
    - Create `packages/nav/refine/src/refine-nav-provider.tsx` implementing
      `RefineNavProvider` that auto-populates NavTree from Refine resources,
      syncs with useMenu(), uses usePermissions() for role filtering,
      useGetIdentity() for user data, useRouterContext() for active resolution
    - Accept `context`, `config`, `plugins`, `extraTree`, `resourceSection`,
      `children` props
    - Create `packages/nav/refine/src/hooks.ts` with `useRefineNav`,
      `useRefineBreadcrumbs`, `useRefineUserIdentity`
    - _Requirements: 17.5, 17.6, 17.7, 17.8, 17.9, 17.10, 17.11, 17.12_

  - [x] 23.3 Define Refine type adapters
    - Create `packages/nav/refine/src/types.ts` with `RefineResource`,
      `RefineMenuItem`, `RefineBreadcrumbItem`, `RefineNavProviderProps`
    - _Requirements: 17.1_

  - [x] 23.4 Wire @nav/refine barrel export
    - Update `packages/nav/refine/src/index.ts` to re-export all functions,
      components, hooks, and types
    - _Requirements: 16.5_

  - [ ]\* 23.5 Write unit tests for Refine adapter
    - Test `buildNavTreeFromResources` maps resources correctly (path, label,
      icon, nesting, hidden)
    - Test `syncWithRefineMenu` merges menu items into existing tree
    - Test `refineBreadcrumbsToTrail` converts breadcrumb format
    - Test `RefineNavProvider` auto-populates from mocked Refine hooks
    - Test `useRefineNav`, `useRefineBreadcrumbs`, `useRefineUserIdentity`
      return correct shapes
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.10, 17.11, 17.12_

- [x] 24. Final checkpoint - Ensure all tests pass
  - Run `pnpm test` across all five nav packages. Ensure all builds succeed.
    Verify @nav/core works in Node.js without browser dependencies. Ask the user
    if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document (27 properties)
- All packages follow the exact `@cart/*` conventions: tsup, vitest, TypeScript
  5.6.3, same tsconfig/package.json patterns
- Implementation language: TypeScript (used throughout the design document)
