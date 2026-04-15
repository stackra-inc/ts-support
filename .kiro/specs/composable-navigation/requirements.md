# Requirements Document

## Introduction

A composable, headless navigation system for managing all navigation concerns
across the MNGO platform. The system is split into five packages following the
established cart pattern: a pure-logic core engine (`@nav/core`), a React
integration layer (`@nav/react`), a composable UI component library (`@nav/ui`),
an optional plugin system (`@nav/plugins`), and an optional Refine.dev adapter
(`@nav/refine`). The navigation system handles user menus, site navigation,
sidebars, footers, dashboard navigation, landing page navigation, and POS
terminal navigation. It supports role-based visibility, active state tracking,
keyboard navigation, nested menus, collapsible sections, breadcrumbs, and
plugin-extensible features like notification badges and search integration. All
navigation state is managed through a headless core that is framework-agnostic,
with React hooks and HeroUI-based compound components layered on top. The Refine
adapter provides 100% compatibility with Refine.dev's resource system, menu
items, breadcrumbs, and auth — while the system remains fully functional without
Refine.

## Glossary

- **NavTree**: An immutable tree data structure representing the complete
  navigation hierarchy for a given context, composed of NavNode elements
- **NavNode**: A single navigation item within a NavTree, containing id, label,
  path, icon reference, children (NavNode[]), metadata, visibility rules, and
  badge configuration
- **NavContext**: A named navigation scope that determines which NavTree
  configuration is active (e.g., "pos", "dashboard", "landing", "ecommerce",
  "admin")
- **NavEngine**: The core stateless engine interface that processes navigation
  tree construction, active state resolution, filtering, and serialization
- **NavConfig**: A configuration object defining the NavContext, default
  collapsed state, keyboard shortcut bindings, role-based visibility rules, and
  enabled features
- **NavPlugin**: An extension module that can add nodes, modify visibility,
  inject badges, or attach behaviors to the NavEngine
- **NavProvider**: The React context provider that exposes navigation state and
  actions to the component tree
- **ActiveResolver**: A pure function that determines which NavNode is currently
  active based on the current route path and matching strategy
- **VisibilityRule**: A predicate function or role-based configuration that
  determines whether a NavNode is visible to the current user
- **BadgeConfig**: A configuration object attached to a NavNode specifying badge
  type ("count", "dot", "text"), value, and variant
- **BreadcrumbTrail**: An ordered array of NavNode references representing the
  path from the NavTree root to the currently active NavNode
- **NavSection**: A logical grouping of NavNodes within a NavTree, used to
  separate navigation areas (e.g., "main", "settings", "footer")
- **CollapseState**: A record mapping NavNode ids to their expanded or collapsed
  boolean state within collapsible navigation regions
- **KeyboardBinding**: A mapping of keyboard shortcut strings to NavNode ids or
  navigation actions
- **NavSerializer**: A module responsible for converting NavTree structures to
  and from JSON for persistence and transfer

## Requirements

### Requirement 1: Navigation Tree Data Model

**User Story:** As a developer, I want a well-defined navigation tree data
model, so that I can represent navigation hierarchies consistently across all
application contexts.

#### Acceptance Criteria

1. THE NavEngine SHALL represent a NavTree with the following fields: id
   (string), context (NavContext), sections (NavSection[]), metadata (record),
   and version (number)
2. THE NavEngine SHALL represent a NavNode with the following fields: id
   (string), label (string), path (string or null for non-navigable nodes), icon
   (string or null), children (NavNode[]), section (string), order (number),
   visibility (VisibilityRule or null), badge (BadgeConfig or null), disabled
   (boolean), and metadata (record)
3. THE NavEngine SHALL represent a NavSection with the following fields: id
   (string), label (string or null), nodes (NavNode[]), and order (number)
4. THE NavEngine SHALL represent a BadgeConfig with the following fields: type
   ("count" | "dot" | "text"), value (number or string), variant ("default" |
   "success" | "warning" | "danger"), and max (number or null for count type)
5. THE NavEngine SHALL enforce that all NavNode id values within a single
   NavTree are unique
6. THE NavEngine SHALL enforce that NavNode order values determine rendering
   sequence within a NavSection, sorted ascending

### Requirement 2: Navigation Tree Construction

**User Story:** As a developer, I want to build navigation trees
programmatically using a builder API, so that I can compose navigation
structures from multiple sources without manual tree assembly.

#### Acceptance Criteria

1. WHEN createNavTree is called with a NavContext, THE NavEngine SHALL return a
   new empty NavTree bound to the specified context
2. WHEN addNode is called with a parent NavNode id and a NavNode definition, THE
   NavEngine SHALL insert the new NavNode as a child of the specified parent
3. WHEN addNode is called with no parent id, THE NavEngine SHALL insert the
   NavNode at the root level of the specified NavSection
4. WHEN addSection is called with a NavSection definition, THE NavEngine SHALL
   add the section to the NavTree
5. WHEN removeNode is called with a NavNode id, THE NavEngine SHALL remove the
   matching NavNode and all its descendants from the NavTree
6. WHEN moveNode is called with a NavNode id and a new parent id, THE NavEngine
   SHALL relocate the NavNode (and its subtree) under the new parent
7. IF addNode is called with a NavNode id that already exists in the NavTree,
   THEN THE NavEngine SHALL return an error indicating a duplicate id
8. IF removeNode is called with a NavNode id that does not exist in the NavTree,
   THEN THE NavEngine SHALL return the NavTree unchanged
9. FOR ALL NavTree mutations, THE NavEngine SHALL return a new NavTree instance
   without modifying the original (immutability property)

### Requirement 3: Active State Resolution

**User Story:** As a developer, I want the navigation system to automatically
determine which navigation item is active based on the current route, so that
active states are always consistent with the URL.

#### Acceptance Criteria

1. WHEN resolve is called with a route path, THE ActiveResolver SHALL return the
   NavNode whose path is the longest prefix match of the route path
2. WHEN resolve is called with a route path that matches no NavNode path, THE
   ActiveResolver SHALL return null
3. WHEN resolve is called with a route path that exactly matches a NavNode path,
   THE ActiveResolver SHALL prefer the exact match over prefix matches
4. THE ActiveResolver SHALL support three matching strategies: "exact" (path
   must match exactly), "prefix" (path must be a prefix of the route), and
   "pattern" (path is a route pattern with parameters)
5. WHEN a NavNode specifies a custom matching strategy, THE ActiveResolver SHALL
   use the specified strategy for that node instead of the default
6. FOR ALL route paths, THE ActiveResolver SHALL return at most one active
   NavNode (uniqueness property)
7. WHEN the active NavNode is nested within collapsed parent nodes, THE
   ActiveResolver SHALL report the full ancestor chain so that parent nodes can
   be auto-expanded

### Requirement 4: Breadcrumb Generation

**User Story:** As a developer, I want automatic breadcrumb generation from the
navigation tree, so that users always see their location within the application
hierarchy.

#### Acceptance Criteria

1. WHEN generateBreadcrumbs is called with an active NavNode, THE NavEngine
   SHALL return a BreadcrumbTrail containing all ancestor NavNodes from the root
   to the active node in order
2. WHEN generateBreadcrumbs is called with a NavNode that is at the root level,
   THE NavEngine SHALL return a BreadcrumbTrail containing only that single
   NavNode
3. WHEN generateBreadcrumbs is called with null (no active node), THE NavEngine
   SHALL return an empty BreadcrumbTrail
4. THE BreadcrumbTrail SHALL include the label and path of each ancestor NavNode
   so that each breadcrumb segment is navigable
5. FOR ALL active NavNodes at depth D in the NavTree, THE BreadcrumbTrail SHALL
   contain exactly D+1 entries (invariant property)

### Requirement 5: Role-Based Visibility Filtering

**User Story:** As a developer, I want navigation items to be filtered based on
user roles and permissions, so that users only see navigation options they are
authorized to access.

#### Acceptance Criteria

1. WHEN filterByRole is called with a NavTree and a set of user roles, THE
   NavEngine SHALL return a new NavTree containing only NavNodes whose
   VisibilityRule is satisfied by the provided roles
2. WHEN a parent NavNode is filtered out, THE NavEngine SHALL also remove all
   its descendant NavNodes regardless of their individual visibility rules
3. WHEN a parent NavNode is visible but all its children are filtered out, THE
   NavEngine SHALL retain the parent NavNode with an empty children array
4. THE VisibilityRule SHALL support the following rule types: "roles" (list of
   allowed role strings), "permissions" (list of required permission strings),
   "custom" (a predicate function receiving user context), and "public" (always
   visible)
5. WHEN a NavNode has no VisibilityRule defined, THE NavEngine SHALL treat the
   NavNode as public (always visible)
6. FOR ALL filtering operations, THE NavEngine SHALL return a new NavTree
   without modifying the original (immutability property)
7. WHEN filterByRole is called with an empty roles set, THE NavEngine SHALL
   return a NavTree containing only NavNodes with "public" visibility or no
   VisibilityRule

### Requirement 6: Collapse State Management

**User Story:** As a developer, I want to manage the expanded and collapsed
state of navigation sections and nested menus, so that sidebars and menus can be
toggled independently.

#### Acceptance Criteria

1. THE NavEngine SHALL maintain a CollapseState record mapping NavNode ids to
   boolean expanded/collapsed values
2. WHEN toggleCollapse is called with a NavNode id, THE NavEngine SHALL flip the
   collapsed state of the specified NavNode
3. WHEN setCollapsed is called with a NavNode id and a boolean value, THE
   NavEngine SHALL set the collapsed state to the specified value
4. WHEN collapseAll is called, THE NavEngine SHALL set all collapsible NavNodes
   to collapsed state
5. WHEN expandToNode is called with a NavNode id, THE NavEngine SHALL expand all
   ancestor NavNodes of the specified node so that the node becomes visible
6. WHEN a NavNode is not present in the CollapseState record, THE NavEngine
   SHALL use the default collapsed state from NavConfig
7. FOR ALL toggleCollapse operations applied twice to the same NavNode, THE
   NavEngine SHALL restore the original collapsed state (round-trip property)

### Requirement 7: Keyboard Navigation

**User Story:** As a developer, I want built-in keyboard navigation support, so
that all navigation components are accessible and operable without a mouse.

#### Acceptance Criteria

1. THE NavEngine SHALL maintain a KeyboardBinding map associating shortcut
   strings with NavNode ids or navigation actions
2. WHEN registerShortcut is called with a shortcut string and a NavNode id, THE
   NavEngine SHALL add the binding to the KeyboardBinding map
3. WHEN a registered keyboard shortcut is triggered, THE NavEngine SHALL emit a
   navigation event for the bound NavNode
4. THE NavEngine SHALL support arrow key navigation within navigation lists:
   ArrowDown moves focus to the next visible NavNode, ArrowUp moves focus to the
   previous visible NavNode
5. THE NavEngine SHALL support ArrowRight to expand a collapsed NavNode and
   ArrowLeft to collapse an expanded NavNode
6. WHEN Enter or Space is pressed on a focused NavNode, THE NavEngine SHALL
   trigger navigation to the NavNode path
7. WHEN Home is pressed within a navigation list, THE NavEngine SHALL move focus
   to the first visible NavNode
8. WHEN End is pressed within a navigation list, THE NavEngine SHALL move focus
   to the last visible NavNode
9. THE NavEngine SHALL support typeahead search: typing characters SHALL move
   focus to the first NavNode whose label starts with the typed characters
10. IF a keyboard shortcut conflicts with a browser default, THEN THE NavEngine
    SHALL allow the NavConfig to specify whether to prevent the default behavior
    or skip the binding

### Requirement 8: Context-Based Configuration

**User Story:** As a developer, I want per-context navigation presets, so that I
can configure navigation behavior differently for POS terminals, dashboards,
landing pages, and ecommerce storefronts.

#### Acceptance Criteria

1. THE NavConfig SHALL define the following fields: context (NavContext),
   defaultCollapsed (boolean), keyboardEnabled (boolean), stickyHeader
   (boolean), collapsibleSidebar (boolean), breadcrumbsEnabled (boolean),
   maxDepth (number), and features (object with boolean flags: badges, search,
   roleFiltering, shortcuts, typeahead)
2. THE NavEngine SHALL provide default NavConfig presets for contexts: "pos",
   "dashboard", "landing", "ecommerce", and "admin"
3. WHEN a NavTree is created with a NavContext value, THE NavEngine SHALL apply
   the corresponding default NavConfig preset
4. WHEN a NavTree is created with a NavContext value and explicit NavConfig
   overrides, THE NavEngine SHALL merge the overrides on top of the context
   preset
5. THE "pos" preset SHALL default to collapsibleSidebar: true,
   breadcrumbsEnabled: false, keyboardEnabled: true, and maxDepth: 2
6. THE "dashboard" preset SHALL default to collapsibleSidebar: true,
   breadcrumbsEnabled: true, keyboardEnabled: true, and maxDepth: 4
7. THE "landing" preset SHALL default to collapsibleSidebar: false,
   breadcrumbsEnabled: false, stickyHeader: true, and maxDepth: 2

### Requirement 9: Plugin System

**User Story:** As a developer, I want a plugin architecture, so that I can
extend the navigation system with optional features like notification badges,
search integration, analytics tracking, and spotlight commands without modifying
core code.

#### Acceptance Criteria

1. THE NavEngine SHALL accept NavPlugin registrations through a register method
2. THE NavPlugin interface SHALL define optional fields: name (string,
   required), extendNodes (function to add or modify NavNodes in the NavTree),
   badges (function returning BadgeConfig updates for NavNodes by id), hooks
   (object with optional onNavigate, onExpand, onCollapse, onSearch callbacks),
   and shortcuts (KeyboardBinding map to merge)
3. WHEN a NavPlugin with extendNodes is registered, THE NavEngine SHALL invoke
   extendNodes during NavTree construction to allow the plugin to inject or
   modify nodes
4. WHEN a NavPlugin with badges is registered, THE NavEngine SHALL invoke the
   badges function to update BadgeConfig on matching NavNodes
5. WHEN a NavPlugin with an onNavigate hook is registered, THE NavEngine SHALL
   invoke the hook after every navigation event with the target NavNode
6. WHEN a NavPlugin with shortcuts is registered, THE NavEngine SHALL merge the
   plugin shortcuts into the KeyboardBinding map
7. IF a NavPlugin hook throws an error, THEN THE NavEngine SHALL catch the
   error, log a warning, and continue operation without interrupting navigation
8. IF a NavPlugin shortcut conflicts with an existing binding, THEN THE
   NavEngine SHALL keep the existing binding and log a warning about the
   conflict

### Requirement 10: Navigation Serialization and Deserialization

**User Story:** As a developer, I want to serialize and deserialize navigation
trees, so that navigation configurations can be persisted, transferred between
server and client, and restored reliably.

#### Acceptance Criteria

1. WHEN serialize is called, THE NavSerializer SHALL produce a valid JSON string
   representing the complete NavTree including all nodes, sections, badges, and
   metadata
2. WHEN deserialize is called with a valid JSON string, THE NavSerializer SHALL
   reconstruct a NavTree object with all fields intact
3. FOR ALL valid NavTree objects, deserialize(serialize(navTree)) SHALL produce
   a NavTree equivalent to the original (round-trip property)
4. IF deserialize is called with invalid JSON, THEN THE NavSerializer SHALL
   return a descriptive parse error
5. IF deserialize is called with JSON that does not conform to the NavTree
   schema, THEN THE NavSerializer SHALL return a descriptive validation error
6. THE NavSerializer SHALL exclude VisibilityRule fields of type "custom"
   (predicate functions) from serialization and restore them as "public" on
   deserialization

### Requirement 11: React Integration Layer

**User Story:** As a React developer, I want hooks and context providers for the
navigation engine, so that I can integrate navigation functionality into React
applications with minimal boilerplate.

#### Acceptance Criteria

1. THE NavProvider SHALL accept a NavConfig prop and initialize a NavEngine
   instance
2. THE NavProvider SHALL accept an optional plugins prop containing an array of
   NavPlugin instances to register
3. THE NavProvider SHALL accept an optional tree prop containing a pre-built
   NavTree to use as the initial navigation state
4. WHEN useNav is called within a NavProvider, THE Hook SHALL return the current
   filtered NavTree and the active NavNode
5. WHEN useNavActions is called within a NavProvider, THE Hook SHALL return
   bound action functions: navigate, toggleCollapse, expandToNode, collapseAll,
   registerShortcut
6. WHEN useBreadcrumbs is called within a NavProvider, THE Hook SHALL return the
   current BreadcrumbTrail based on the active NavNode
7. WHEN useNavSection is called with a section id within a NavProvider, THE Hook
   SHALL return only the NavNodes belonging to the specified NavSection
8. WHEN useNavBadge is called with a NavNode id within a NavProvider, THE Hook
   SHALL return the current BadgeConfig for the specified node
9. IF useNav, useNavActions, useBreadcrumbs, useNavSection, or useNavBadge is
   called outside a NavProvider, THEN THE Hook SHALL throw a descriptive error
10. WHEN the route changes, THE NavProvider SHALL automatically re-resolve the
    active NavNode and update the BreadcrumbTrail

### Requirement 12: Composable UI Components

**User Story:** As a frontend developer, I want composable, compound UI
components for navigation, so that I can assemble navigation interfaces tailored
to each application context.

#### Acceptance Criteria

1. THE Nav.Sidebar component SHALL render a vertical navigation panel with
   support for collapsed (icons only) and expanded (icons and labels) modes
2. THE Nav.Sidebar component SHALL accept a collapsible prop and render a toggle
   button to switch between collapsed and expanded modes
3. THE Nav.Header component SHALL render a horizontal top navigation bar with
   support for left, center, and right slot areas
4. THE Nav.Menu component SHALL render a nested menu list from a NavSection,
   supporting arbitrary nesting depth up to NavConfig.maxDepth
5. THE Nav.Item component SHALL expose sub-composable children: Nav.Item.Icon,
   Nav.Item.Label, Nav.Item.Badge, Nav.Item.Shortcut, Nav.Item.Children
6. THE Nav.Breadcrumbs component SHALL render the current BreadcrumbTrail as a
   horizontal list of navigable links with separator elements
7. THE Nav.Footer component SHALL render a footer navigation area with support
   for grouped link columns
8. THE Nav.UserMenu component SHALL render a user avatar dropdown with
   configurable menu items for profile, settings, and sign-out actions
9. THE Nav.Search component SHALL render a search input that filters visible
   NavNodes by label and highlights matching results
10. WHEN a Nav.Item is clicked, THE component SHALL trigger navigation to the
    NavNode path and update the active state
11. WHEN a Nav.Item has children and is clicked, THE component SHALL toggle the
    expanded/collapsed state of the children list
12. ALL Nav components SHALL apply ARIA attributes: role="navigation" on
    Nav.Sidebar and Nav.Header, role="menubar" or role="menu" on Nav.Menu,
    role="menuitem" on Nav.Item, aria-current="page" on the active Nav.Item, and
    aria-expanded on collapsible Nav.Items

### Requirement 13: POS Navigation Integration

**User Story:** As a POS developer, I want the navigation system to power the
POS terminal header, sidebar, spotlight command palette, and user profile
drawer, so that POS navigation is consistent with the composable navigation
architecture.

#### Acceptance Criteria

1. THE Nav.POS.Header component SHALL render the POS header layout with slots
   for: sidebar toggle, logo, tenant name, spotlight trigger, shift management
   button, clock, notification bell, AI assistant button, and user avatar
2. THE Nav.POS.Sidebar component SHALL render the POS category sidebar with
   expanded mode (icon and label) and collapsed mode (icon only) with smooth
   width transition
3. THE Nav.POS.Spotlight component SHALL render a full-screen command palette
   overlay with search input, grouped command list, and keyboard navigation
   hints
4. WHEN the spotlight is opened, THE Nav.POS.Spotlight component SHALL populate
   commands from the NavTree nodes that have KeyboardBinding entries plus any
   plugin-injected commands
5. WHEN a spotlight command is selected, THE Nav.POS.Spotlight component SHALL
   trigger the associated navigation action or shortcut callback and close the
   overlay
6. THE Nav.POS.UserMenu component SHALL render a user profile drawer with
   animated stack navigation supporting sub-views (account, security,
   appearance, hardware, apps, help, order history, employee QR)
7. WHEN a POS keyboard shortcut is triggered (e.g., Ctrl+K for spotlight, Ctrl+B
   for sidebar toggle), THE NavEngine SHALL execute the bound action

### Requirement 14: Dashboard and Admin Navigation

**User Story:** As a dashboard developer, I want the navigation system to
provide a standard dashboard layout with collapsible sidebar, breadcrumbs, and
settings panel navigation, so that admin interfaces are consistent and
navigable.

#### Acceptance Criteria

1. THE Nav.Dashboard.Layout component SHALL render a dashboard shell with a
   collapsible sidebar, a top header bar with breadcrumbs, and a main content
   area
2. THE Nav.Dashboard.Sidebar component SHALL render a multi-section sidebar with
   section labels, nested menu items, and a collapse toggle
3. WHEN the dashboard sidebar is collapsed, THE Nav.Dashboard.Sidebar component
   SHALL display only icons with tooltip labels on hover
4. THE Nav.Dashboard.Breadcrumbs component SHALL render breadcrumbs derived from
   the active NavNode ancestor chain within the dashboard NavTree
5. THE Nav.Dashboard.SettingsNav component SHALL render a vertical settings
   navigation list for admin settings panels with active state highlighting

### Requirement 15: Landing Page and Marketing Navigation

**User Story:** As a marketing developer, I want the navigation system to
provide landing page navigation components with sticky headers, mobile hamburger
menus, and footer link groups, so that marketing pages have consistent,
responsive navigation.

#### Acceptance Criteria

1. THE Nav.Landing.Header component SHALL render a sticky top navigation bar
   with logo, horizontal menu items, and call-to-action buttons
2. WHEN the viewport width is below the configured mobile breakpoint, THE
   Nav.Landing.Header component SHALL collapse the horizontal menu into a
   hamburger menu button that opens a mobile drawer
3. THE Nav.Landing.MobileDrawer component SHALL render a full-height slide-in
   panel with the navigation menu items, close button, and call-to-action
   buttons
4. THE Nav.Landing.Footer component SHALL render a footer with grouped link
   columns, each column having a heading and a list of navigable links
5. THE Nav.Landing.Footer component SHALL render a bottom bar with legal links
   (privacy policy, terms of service) and copyright text

### Requirement 16: Package Architecture

**User Story:** As a monorepo maintainer, I want the navigation system split
into five independent packages following the established cart pattern, so that
consumers can install only what they need, the core logic remains
framework-agnostic, and Refine integration is optional.

#### Acceptance Criteria

1. THE @nav/core package SHALL contain zero React, DOM, or browser-specific
   dependencies
2. THE @nav/react package SHALL depend only on @nav/core and React
3. THE @nav/ui package SHALL depend on @nav/react and the project UI framework
   (HeroUI)
4. THE @nav/plugins package SHALL depend only on @nav/core
5. THE @nav/refine package SHALL depend on @nav/core, @nav/react, and
   @refinedev/core as a peerDependency
6. WHEN @nav/core is imported in a non-browser environment (Node.js, test
   runner), THE package SHALL function without errors
7. THE pnpm-workspace.yaml SHALL include "packages/nav/\*" to register the
   navigation packages in the monorepo
8. THE navigation system SHALL be fully functional without @nav/refine installed
   — Refine integration is optional

### Requirement 17: Refine.dev Integration

**User Story:** As a Refine developer, I want the navigation system to
automatically populate from Refine resource definitions, menu items,
breadcrumbs, and auth identity, so that I get full navigation functionality
without manually building NavTrees.

#### Acceptance Criteria

1. WHEN buildNavTreeFromResources is called with Refine resource definitions,
   THE @nav/refine adapter SHALL produce a NavTree where each non-hidden
   resource maps to a NavNode with the resource's list route as path, meta.label
   as label, and meta.icon as icon
2. WHEN a Refine resource has meta.parent defined, THE adapter SHALL nest the
   resource's NavNode as a child of the parent resource's NavNode
3. WHEN syncWithRefineMenu is called with Refine useMenu() output, THE adapter
   SHALL merge the menu items into the NavTree, adding missing nodes and
   updating existing nodes' labels and icons
4. WHEN refineBreadcrumbsToTrail is called with Refine useBreadcrumb() output,
   THE adapter SHALL produce a BreadcrumbTrail compatible with @nav/core's
   BreadcrumbEntry format
5. THE RefineNavProvider SHALL auto-populate the NavTree from Refine resources
   on mount and re-sync when resources change
6. THE RefineNavProvider SHALL use Refine's usePermissions() to drive role-based
   visibility filtering on the NavTree
7. THE RefineNavProvider SHALL use Refine's useGetIdentity() to provide user
   identity data for Nav.UserMenu consumption
8. THE RefineNavProvider SHALL use Refine's router context to automatically
   resolve the active NavNode based on the current route
9. WHEN the RefineNavProvider receives an extraTree prop, THE adapter SHALL
   merge the extra nodes alongside the Refine-generated nodes
10. THE useRefineNav hook SHALL return the same shape as useNav but with the
    NavTree auto-populated from Refine
11. THE useRefineBreadcrumbs hook SHALL return breadcrumbs derived from Refine's
    useBreadcrumb() converted to BreadcrumbTrail format
12. THE useRefineUserIdentity hook SHALL return the current user's name, avatar,
    and role from Refine's useGetIdentity()
