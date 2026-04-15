# Requirements Document

## Introduction

The Drawer Stack System is a centralized, reusable drawer management layer for
the POS ticketing application. It replaces the current fragmented approach —
where 6+ boolean flags, setTimeout hacks, and two incompatible drawer
implementations (HeroUI Drawer and custom DrawerOverlay) coexist — with a single
stack-based context that supports push/pop/replace/clear operations, animated
transitions, z-index management, and internal sub-view navigation. The system is
built on HeroUI Drawer v3, React 19, and TypeScript, and is designed to be
extractable into a standalone package (`@abdokouta/react-drawers`).

## Glossary

- **Drawer_Stack_Provider**: The React context provider that manages the ordered
  stack of open drawers and exposes stack operations to the component tree.
- **Drawer_Stack**: The ordered collection (array) of drawer entries currently
  open, where the last entry is the topmost (active) drawer.
- **Drawer_Entry**: A single item in the Drawer_Stack, containing the drawer's
  component, configuration (width, id), and metadata.
- **Stack_Operations**: The set of imperative methods for manipulating the
  Drawer_Stack: push, pop, replace, clear, and popTo.
- **Drawer_Container**: The rendering component that maps Drawer_Stack entries
  to layered HeroUI Drawer instances with correct z-index, backdrop, and
  animation.
- **Sub_View_Navigator**: An optional internal navigation system within a single
  drawer, supporting a stack of sub-views with forward/back transitions
  (generalizing the current ProfileDrawer pattern).
- **Active_Drawer**: The topmost Drawer_Entry in the Drawer_Stack, which
  receives user focus and input.
- **Backdrop**: The semi-transparent overlay rendered behind the Active_Drawer
  that dims underlying content and intercepts click-to-dismiss.
- **Drawer_Config**: The configuration object for a drawer entry, including
  width, id, closable flag, and optional sub-view definitions.

## Requirements

### Requirement 1: Drawer Stack Provider and Context

**User Story:** As a developer, I want a single context provider that manages
all drawer state, so that I can remove scattered boolean flags and centralize
drawer lifecycle management.

#### Acceptance Criteria

1. THE Drawer_Stack_Provider SHALL expose the current Drawer_Stack (ordered
   array of Drawer_Entry items) via React context.
2. THE Drawer_Stack_Provider SHALL expose Stack_Operations (push, pop, replace,
   clear, popTo) via React context.
3. THE Drawer_Stack_Provider SHALL expose a boolean `isOpen` property that is
   true when the Drawer_Stack contains one or more entries.
4. WHEN a consumer calls `push` with a Drawer_Config and a React component, THE
   Drawer_Stack_Provider SHALL append a new Drawer_Entry to the Drawer_Stack.
5. WHEN a consumer calls `pop`, THE Drawer_Stack_Provider SHALL remove the
   topmost Drawer_Entry from the Drawer_Stack.
6. WHEN a consumer calls `replace` with a Drawer_Config and a React component,
   THE Drawer_Stack_Provider SHALL remove the topmost Drawer_Entry and append
   the new Drawer_Entry in a single state update.
7. WHEN a consumer calls `clear`, THE Drawer_Stack_Provider SHALL remove all
   entries from the Drawer_Stack.
8. WHEN a consumer calls `popTo` with a drawer id, THE Drawer_Stack_Provider
   SHALL remove all entries above the matching entry in the Drawer_Stack.
9. IF `popTo` is called with an id that does not exist in the Drawer_Stack, THEN
   THE Drawer_Stack_Provider SHALL leave the Drawer_Stack unchanged.
10. THE Drawer_Stack_Provider SHALL expose a `useDrawerStack` hook that throws
    an error when used outside the provider.

### Requirement 2: Drawer Rendering and Layering

**User Story:** As a user, I want to see stacked drawers layered on top of each
other with correct visual depth, so that I understand the navigation hierarchy.

#### Acceptance Criteria

1. THE Drawer_Container SHALL render each Drawer_Entry in the Drawer_Stack as a
   HeroUI Drawer component positioned from the right edge.
2. THE Drawer_Container SHALL assign incrementing z-index values to each
   Drawer_Entry so that later entries render above earlier ones.
3. WHEN a new Drawer_Entry is pushed onto the Drawer_Stack, THE Drawer_Container
   SHALL animate the new drawer sliding in from the right.
4. WHEN a Drawer_Entry is popped from the Drawer_Stack, THE Drawer_Container
   SHALL animate the removed drawer sliding out to the right.
5. THE Drawer_Container SHALL render each Drawer_Entry at the width specified in
   its Drawer_Config.
6. WHILE multiple drawers are open, THE Drawer_Container SHALL visually dim all
   drawers below the Active_Drawer using reduced opacity.

### Requirement 3: Backdrop and Dismiss Behavior

**User Story:** As a user, I want to click the backdrop or press Escape to close
drawers, so that I can quickly dismiss them without hunting for a close button.

#### Acceptance Criteria

1. THE Drawer_Container SHALL render a single Backdrop behind the entire
   Drawer_Stack when the stack contains one or more entries.
2. WHEN the user clicks the Backdrop, THE Drawer_Stack_Provider SHALL call
   `clear` to close all drawers.
3. WHEN the user presses the Escape key and the Drawer_Stack contains one or
   more entries, THE Drawer_Stack_Provider SHALL call `pop` to remove the
   topmost drawer.
4. WHEN the Drawer_Stack becomes empty after a pop or clear operation, THE
   Drawer_Container SHALL animate the Backdrop out and restore body scroll.
5. WHILE the Drawer_Stack contains one or more entries, THE Drawer_Container
   SHALL prevent body scroll.
6. WHERE a Drawer_Config sets `closeOnEscape` to false, THE Drawer_Container
   SHALL skip the Escape key handler for that drawer.

### Requirement 4: Configurable Drawer Width

**User Story:** As a developer, I want each drawer to have its own configurable
width, so that different content types (narrow notifications vs. wide seat maps)
display at appropriate sizes.

#### Acceptance Criteria

1. THE Drawer_Config SHALL accept a `width` property as a number (pixels) or a
   string (CSS value).
2. WHEN a Drawer_Entry is rendered, THE Drawer_Container SHALL apply the
   configured width to the HeroUI Drawer content.
3. IF no width is specified in the Drawer_Config, THEN THE Drawer_Container
   SHALL use a default width of 480 pixels.

### Requirement 5: Animated Transitions

**User Story:** As a user, I want smooth animated transitions when drawers open,
close, and stack, so that the interface feels polished and I can follow the
navigation flow.

#### Acceptance Criteria

1. WHEN a drawer is pushed onto the Drawer_Stack, THE Drawer_Container SHALL
   animate the new drawer sliding in from the right with a duration between
   200ms and 300ms.
2. WHEN a drawer is popped from the Drawer_Stack, THE Drawer_Container SHALL
   animate the drawer sliding out to the right with a duration between 200ms and
   300ms.
3. WHEN a drawer is pushed onto a non-empty Drawer_Stack, THE Drawer_Container
   SHALL animate the previously Active_Drawer to a dimmed state.
4. WHEN a drawer is popped revealing the drawer below, THE Drawer_Container
   SHALL animate the revealed drawer back to full opacity.
5. WHEN `replace` is called, THE Drawer_Container SHALL cross-fade or
   slide-transition between the old and new drawer content.

### Requirement 6: Sub-View Navigation Within a Drawer

**User Story:** As a developer, I want a built-in sub-view navigation system
within a single drawer, so that complex drawers like the Profile drawer can
navigate between internal screens without pushing new stack entries.

#### Acceptance Criteria

1. THE Sub_View_Navigator SHALL maintain an internal stack of view identifiers
   within a single Drawer_Entry.
2. THE Sub_View_Navigator SHALL expose `goTo(viewId)` and `goBack()` methods via
   a `useSubView` hook.
3. WHEN `goTo` is called, THE Sub_View_Navigator SHALL push the new view
   identifier onto the internal stack and animate the content sliding in from
   the right.
4. WHEN `goBack` is called, THE Sub_View_Navigator SHALL pop the topmost view
   identifier and animate the content sliding in from the left.
5. THE Sub_View_Navigator SHALL expose the current view identifier and the full
   view history via the `useSubView` hook.
6. WHEN the internal view stack has more than one entry, THE Sub_View_Navigator
   SHALL render a back button in the drawer header.
7. WHEN the internal view stack has exactly one entry and the user presses
   Escape, THE Sub_View_Navigator SHALL delegate to the Drawer_Stack_Provider's
   `pop` operation.
8. WHEN the internal view stack has more than one entry and the user presses
   Escape, THE Sub_View_Navigator SHALL call `goBack` instead of popping the
   drawer from the stack.

### Requirement 7: TypeScript Type Safety

**User Story:** As a developer, I want full TypeScript type safety for drawer
configurations and stack operations, so that I catch configuration errors at
compile time.

#### Acceptance Criteria

1. THE Drawer_Stack_Provider SHALL accept a generic type parameter for drawer
   identifiers, constraining `push`, `replace`, and `popTo` to valid drawer ids.
2. THE Drawer_Config type SHALL be exported and fully typed, including width,
   id, closeOnEscape, and optional metadata.
3. THE `useDrawerStack` hook SHALL return a fully typed object matching the
   Stack_Operations interface.
4. THE Sub_View_Navigator SHALL accept a generic type parameter for view
   identifiers, constraining `goTo` to valid view ids.

### Requirement 8: Keyboard Accessibility

**User Story:** As a user, I want to navigate and dismiss drawers using the
keyboard, so that the interface is accessible without a mouse.

#### Acceptance Criteria

1. WHEN a drawer opens, THE Drawer_Container SHALL move focus to the first
   focusable element within the Active_Drawer.
2. WHILE a drawer is open, THE Drawer_Container SHALL trap focus within the
   Active_Drawer using a focus trap.
3. WHEN a drawer closes, THE Drawer_Container SHALL return focus to the element
   that triggered the drawer opening.
4. THE Drawer_Container SHALL set `role="dialog"` and `aria-modal="true"` on
   each rendered drawer.
5. WHEN the Escape key is pressed, THE Drawer_Container SHALL close or navigate
   back as defined in Requirement 3 and Requirement 6.

### Requirement 9: Migration Path — Replace Existing Drawer State

**User Story:** As a developer, I want to migrate existing drawers to the stack
system incrementally, so that I can adopt the new system without a risky
big-bang rewrite.

#### Acceptance Criteria

1. THE Drawer_Stack_Provider SHALL support rendering both stack-managed drawers
   and legacy standalone drawers simultaneously during migration.
2. WHEN all drawers for a given page are migrated, THE Drawer_Stack_Provider
   SHALL be the sole source of drawer open/close state, replacing all boolean
   flags.
3. THE Drawer_Stack_Provider SHALL support a `singleton` mode on Drawer_Config
   that ensures only one instance of a given drawer id exists in the stack at a
   time.
4. WHEN `push` is called with a singleton Drawer_Config whose id already exists
   in the stack, THE Drawer_Stack_Provider SHALL bring the existing entry to the
   top instead of creating a duplicate.

### Requirement 10: Package Extractability

**User Story:** As a developer, I want the drawer stack system to be structured
as an extractable module, so that it can later be published as
`@abdokouta/react-drawers` without refactoring.

#### Acceptance Criteria

1. THE Drawer_Stack_Provider, Drawer_Container, Sub_View_Navigator, and all
   related types SHALL be co-located in a single directory with a barrel export
   (index.ts).
2. THE module SHALL have zero imports from application-specific code (no imports
   from `@/contexts`, `@/types`, `@/data`, or `@/components` outside the module
   directory).
3. THE module SHALL declare HeroUI Drawer (`@heroui/react`) and React as peer
   dependencies in its conceptual package boundary.
4. THE module SHALL export all public types, components, and hooks from a single
   entry point.
