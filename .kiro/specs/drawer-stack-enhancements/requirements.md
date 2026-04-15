# Requirements Document

## Introduction

This specification covers four enhancement features for the drawer stack system
at `packages/ui/src/components/drawer-stack/`. It adds drawer lifecycle hooks
for tracking open/close transitions, optional stack persistence across page
reloads, keyboard navigation between stacked drawers for power users, and a
ResizeObserver integration for mobile bottom sheets with dynamic content. Each
feature is opt-in and extends the existing `DrawerConfig` or
`DrawerStackProvider` interfaces without breaking current consumers.

## Glossary

- **Drawer_Stack**: The layered panel system that manages multiple drawer
  entries, rendered by `DrawerContainer` and coordinated by
  `DrawerStackProvider`.
- **DrawerConfig**: The configuration interface passed when pushing a new drawer
  onto the stack, controlling width, behavior, metadata, and lifecycle
  callbacks.
- **DrawerStackProvider**: The React context provider that holds the
  `DrawerEntry[]` state via `useReducer` and exposes `StackOperations` and
  read-only stack state.
- **DrawerContainer**: The component that renders stack entries as layered
  drawer panels (desktop side panels or mobile bottom sheets).
- **DrawerEntry**: A single entry in the drawer stack, containing the
  configuration, rendered component, instance ID, and trigger element reference.
- **Stack_Operations**: The interface defining mutation operations (`push`,
  `pop`, `replace`, `clear`, etc.) exposed via the drawer stack context.
- **Lifecycle_Hook**: A callback function on `DrawerConfig` that fires at a
  specific point in a drawer's open or close lifecycle.
- **Persist_Key**: A string key passed to `DrawerStackProvider` that enables
  serialization of stack state to browser storage.
- **Restore_Callback**: A function provided to `DrawerStackProvider` that
  receives persisted drawer IDs on mount, allowing the consumer to re-push
  drawers.
- **Keyboard_Navigation**: An opt-in feature that enables cycling between
  stacked drawers using keyboard shortcuts (Ctrl+Tab, Ctrl+Shift+Tab,
  Ctrl+number).
- **Resize_Observer**: A browser API (`ResizeObserver`) used to detect dynamic
  content height changes within a drawer panel.
- **Mobile_Bottom_Sheet**: The Vaul-style bottom sheet rendering mode used by
  `DrawerContainer` on viewports below 768px.
- **Visual_Entry**: An internal type in `DrawerContainer` that tracks a
  `DrawerEntry` along with its `isLeaving` animation state.

## Requirements

### Requirement 1: onBeforeOpen Lifecycle Hook

**User Story:** As a developer pushing drawers onto the stack, I want to run
validation or side-effect logic before a drawer opens, so that I can
conditionally cancel the push or prepare dependent state.

#### Acceptance Criteria

1. THE DrawerConfig interface SHALL accept an optional `onBeforeOpen` callback
   of type `() => boolean | Promise<boolean>`.
2. WHEN `push` is called with a DrawerConfig that includes an `onBeforeOpen`
   callback, THE Stack_Operations SHALL invoke the callback before dispatching
   the PUSH action.
3. WHEN `onBeforeOpen` returns `false`, THE Stack_Operations SHALL cancel the
   push and the drawer SHALL NOT be added to the stack.
4. WHEN `onBeforeOpen` returns `true`, THE Stack_Operations SHALL proceed with
   the push and add the drawer to the stack.
5. WHEN `onBeforeOpen` returns a `Promise`, THE Stack_Operations SHALL await the
   resolved value before deciding whether to push.
6. WHEN `onBeforeOpen` throws an error or the returned `Promise` rejects, THE
   Stack_Operations SHALL cancel the push and the drawer SHALL NOT be added to
   the stack.
7. WHEN no `onBeforeOpen` callback is provided, THE Stack_Operations SHALL push
   the drawer immediately without invoking any pre-open guard.

### Requirement 2: onAfterOpen Lifecycle Hook

**User Story:** As a developer, I want to know when a drawer has fully animated
into view, so that I can trigger analytics events, start data fetching, or
coordinate with other UI elements.

#### Acceptance Criteria

1. THE DrawerConfig interface SHALL accept an optional `onAfterOpen` callback of
   type `() => void`.
2. WHEN a drawer's enter animation completes, THE DrawerContainer SHALL invoke
   the `onAfterOpen` callback of that drawer's config.
3. WHEN no `onAfterOpen` callback is provided, THE DrawerContainer SHALL
   complete the enter animation without invoking any post-open callback.
4. THE DrawerContainer SHALL invoke `onAfterOpen` exactly once per push, after
   the enter transition finishes.
5. WHEN a drawer is brought to top via singleton detection, THE DrawerContainer
   SHALL NOT invoke `onAfterOpen` again for that drawer.

### Requirement 3: onAfterClose Lifecycle Hook

**User Story:** As a developer, I want to know when a drawer has fully animated
out and been removed from the visual state, so that I can perform cleanup,
release resources, or update external state.

#### Acceptance Criteria

1. THE DrawerConfig interface SHALL accept an optional `onAfterClose` callback
   of type `() => void`.
2. WHEN a drawer's exit animation completes and the Visual_Entry is removed from
   the visual state, THE DrawerContainer SHALL invoke the `onAfterClose`
   callback of that drawer's config.
3. WHEN no `onAfterClose` callback is provided, THE DrawerContainer SHALL remove
   the Visual_Entry without invoking any post-close callback.
4. THE DrawerContainer SHALL invoke `onAfterClose` exactly once per drawer
   removal, after the exit transition finishes and the entry is purged from the
   visual array.
5. WHEN `clear` is called and multiple drawers exit simultaneously, THE
   DrawerContainer SHALL invoke `onAfterClose` for each drawer that had the
   callback defined.

### Requirement 4: Stack Persistence via Browser Storage

**User Story:** As a developer, I want the drawer stack to optionally remember
which drawers were open across page reloads, so that users can resume their
workflow without losing context.

#### Acceptance Criteria

1. THE DrawerStackProvider SHALL accept an optional `persistKey` prop of type
   `string`.
2. WHEN `persistKey` is provided, THE DrawerStackProvider SHALL serialize the
   current stack state (drawer IDs and serializable config fields, excluding
   `component` and callback functions) to `localStorage` under the key specified
   by `persistKey`, each time the stack changes.
3. WHEN `persistKey` is provided and the DrawerStackProvider mounts, THE
   DrawerStackProvider SHALL read the stored value from `localStorage` using the
   `persistKey`.
4. THE DrawerStackProvider SHALL accept an optional `onRestore` callback prop of
   type `(ids: string[]) => void`.
5. WHEN persisted state exists on mount and `onRestore` is provided, THE
   DrawerStackProvider SHALL invoke `onRestore` with the array of persisted
   drawer IDs, allowing the consumer to re-push the drawers.
6. WHEN persisted state exists on mount and `onRestore` is NOT provided, THE
   DrawerStackProvider SHALL discard the persisted state and start with an empty
   stack.
7. WHEN `persistKey` is not provided, THE DrawerStackProvider SHALL not read
   from or write to `localStorage`.
8. IF `localStorage` access throws an error (e.g., storage quota exceeded,
   private browsing restrictions), THEN THE DrawerStackProvider SHALL log a
   warning and continue operating with an empty stack.

### Requirement 5: Keyboard Navigation Between Stacked Drawers

**User Story:** As a power user navigating a multi-drawer workflow, I want to
cycle between stacked drawers using keyboard shortcuts, so that I can switch
context without using a mouse.

#### Acceptance Criteria

1. THE DrawerStackProvider SHALL accept an optional `enableKeyboardNavigation`
   prop of type `boolean`, defaulting to `false`.
2. WHEN `enableKeyboardNavigation` is `true` and the stack contains two or more
   drawers, THE DrawerContainer SHALL listen for `Ctrl+Tab` keydown events on
   the window.
3. WHEN `Ctrl+Tab` is pressed, THE Drawer_Stack SHALL bring the next drawer in
   the stack (one position below the current top) to the top, cycling to the
   bottom-most drawer when the top-most is active.
4. WHEN `Ctrl+Shift+Tab` is pressed, THE Drawer_Stack SHALL bring the previous
   drawer in the stack to the top, cycling to the top-most drawer when the
   bottom-most is active.
5. WHEN `Ctrl+1`, `Ctrl+2`, or `Ctrl+3` (up to `Ctrl+9`) is pressed, THE
   Drawer_Stack SHALL bring the drawer at that 1-based stack position to the
   top, if a drawer exists at that position.
6. WHEN a drawer is brought to the top via keyboard navigation, THE
   DrawerContainer SHALL animate the transition using the standard enter
   animation timing.
7. WHEN `enableKeyboardNavigation` is `false` or not provided, THE
   DrawerContainer SHALL not register any keyboard navigation listeners beyond
   the existing Escape key handler.
8. WHEN the stack contains fewer than two drawers, THE DrawerContainer SHALL
   ignore `Ctrl+Tab` and `Ctrl+Shift+Tab` keypresses.

### Requirement 6: Drawer Content Resize Observer for Mobile Bottom Sheets

**User Story:** As a user interacting with a mobile bottom sheet whose content
changes height dynamically (e.g., accordion expansion, form validation errors),
I want the sheet to adapt so that I can scroll to see all content.

#### Acceptance Criteria

1. THE DrawerConfig interface SHALL accept an optional `observeResize` prop of
   type `boolean`, defaulting to `false`.
2. WHEN `observeResize` is `true` and the drawer is rendered as a
   Mobile_Bottom_Sheet, THE DrawerContainer SHALL attach a `ResizeObserver` to
   the drawer's content container element.
3. WHEN the ResizeObserver detects that the content height exceeds the available
   sheet height, THE DrawerContainer SHALL ensure the content container has
   `overflow-y: auto` applied so the user can scroll.
4. WHEN the ResizeObserver detects that the content height is within the
   available sheet height, THE DrawerContainer SHALL ensure the content
   container has `overflow-y: hidden` applied to prevent unnecessary scroll
   affordances.
5. WHEN `observeResize` is `true` and the drawer is rendered as a desktop side
   panel, THE DrawerContainer SHALL NOT attach a ResizeObserver, since desktop
   panels are full-height and already scrollable.
6. WHEN the drawer is removed from the stack, THE DrawerContainer SHALL
   disconnect the ResizeObserver to prevent memory leaks.
7. WHEN `observeResize` is `false` or not provided, THE DrawerContainer SHALL
   not attach any ResizeObserver to the drawer content.
