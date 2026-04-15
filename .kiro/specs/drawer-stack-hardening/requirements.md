# Requirements Document

## Introduction

This specification covers hardening improvements for the drawer stack system at
`packages/ui/src/components/drawer-stack/`. It addresses six issues: a hardcoded
counter threshold, missing horizontal scroll detection in drag handling,
unbounded z-index calculation, inconsistent subtitle visibility in compact
headers, focus trap portal limitations, and a misleading `pop()` return type.
Each issue targets a specific edge case or robustness gap in the current
implementation.

## Glossary

- **Drawer_Stack**: The layered panel system that manages multiple drawer
  entries, rendered by `DrawerContainer` and coordinated by
  `DrawerStackProvider`.
- **StackDots**: The visual indicator component that shows the current position
  in the drawer stack using dots or a counter badge.
- **DRAWER_DEFAULTS**: The shared constant object holding default configuration
  values (width, z-index base, animation timing, etc.).
- **Drag_Handler**: The `useDrawerDrag` hook that provides gesture-driven
  drag-to-dismiss behavior for desktop drawer panels.
- **DrawerHeader**: The reusable header component for drawers, supporting
  "default", "hero", and "compact" variants.
- **Focus_Trap**: The `useFocusTrap` hook that constrains Tab/Shift+Tab keyboard
  navigation within the active drawer boundary.
- **Stack_Operations**: The interface defining mutation operations (`push`,
  `pop`, `replace`, `clear`, etc.) exposed via the drawer stack context.
- **MAX_DOTS**: The threshold constant that determines when StackDots switches
  from dot indicators to a numeric counter badge.
- **Z_Index**: The CSS stacking order value computed as
  `BASE_Z_INDEX + (index * Z_INDEX_STEP)` for each drawer in the stack.
- **Portal**: A React mechanism (`createPortal`) that renders children into a
  DOM node outside the parent component's DOM hierarchy.

## Requirements

### Requirement 1: Configurable StackDots Counter Threshold

**User Story:** As a consumer of the drawer stack, I want to configure the
maximum number of dots shown before switching to counter mode, so that I can
adapt the indicator to different UI densities.

#### Acceptance Criteria

1. THE StackDots component SHALL accept an optional `maxDots` prop of type
   `number` that overrides the default threshold.
2. WHEN no `maxDots` prop is provided, THE StackDots component SHALL use the
   `MAX_DOTS` value from DRAWER_DEFAULTS as the threshold.
3. THE DRAWER_DEFAULTS constant SHALL include a `MAX_DOTS` field with a default
   value of `5`.
4. WHEN `stackSize` exceeds the resolved `maxDots` value, THE StackDots
   component SHALL render a numeric counter badge instead of individual dots.
5. WHEN `stackSize` is less than or equal to the resolved `maxDots` value, THE
   StackDots component SHALL render individual dot indicators.

### Requirement 2: Horizontal Scroll Detection in Drag Handler

**User Story:** As a user interacting with a drawer containing horizontally
scrollable content (carousels, wide tables), I want the drag-to-dismiss gesture
to not activate when I am scrolling horizontally, so that my scroll interaction
is not interrupted.

#### Acceptance Criteria

1. WHEN a pointer-down event occurs on an element within a horizontally
   scrollable container, THE Drag_Handler SHALL check whether the target or any
   ancestor up to the drag root has `scrollWidth > clientWidth`.
2. WHEN a horizontally scrollable ancestor is detected and its `scrollLeft` is
   greater than `0`, THE Drag_Handler SHALL cancel the drag initiation for that
   gesture.
3. WHEN a horizontally scrollable ancestor is detected and its `scrollLeft` is
   `0`, THE Drag_Handler SHALL allow the drag initiation to proceed.
4. THE Drag_Handler SHALL apply the same horizontal scroll detection logic in
   both the desktop `useDrawerDrag` hook and the mobile `MobilePanel`
   pointer-down handler.

### Requirement 3: Z-Index Calculation Safeguard

**User Story:** As a developer using the drawer stack, I want the z-index
calculation to be bounded, so that extreme stack depths do not produce z-index
values that exceed browser limits or cause rendering issues.

#### Acceptance Criteria

1. THE DRAWER_DEFAULTS constant SHALL include a `MAX_STACK_DEPTH` field that
   defines the maximum number of drawers allowed in the stack.
2. WHEN the computed z-index value (`BASE_Z_INDEX + index * Z_INDEX_STEP`)
   exceeds the browser maximum of `2147483647`, THE Drawer_Stack SHALL clamp the
   z-index to `2147483647`.
3. WHEN a `push` operation would cause the stack size to exceed
   `MAX_STACK_DEPTH`, THE Drawer_Stack SHALL log a warning to the console
   indicating the stack depth limit has been reached.
4. WHEN a `push` operation would cause the stack size to exceed
   `MAX_STACK_DEPTH`, THE Drawer_Stack SHALL still allow the push but with a
   clamped z-index value.

### Requirement 4: Consistent Subtitle Visibility in Compact DrawerHeader

**User Story:** As a user viewing a compact drawer header on mobile, I want to
see the subtitle regardless of whether pills are present, so that I have
consistent access to contextual information across breakpoints.

#### Acceptance Criteria

1. WHILE the DrawerHeader is rendered in "compact" variant on mobile viewports,
   THE DrawerHeader SHALL display the subtitle text when a subtitle prop is
   provided, regardless of whether pills are also provided.
2. WHILE the DrawerHeader is rendered in "compact" variant on desktop viewports
   with pills present, THE DrawerHeader SHALL hide the subtitle text to preserve
   horizontal space.
3. WHILE the DrawerHeader is rendered in "compact" variant on desktop viewports
   without pills, THE DrawerHeader SHALL display the subtitle text.

### Requirement 5: Focus Trap Portal Limitation Documentation

**User Story:** As a developer using the focus trap hook, I want clear
documentation about the portal limitation, so that I understand when focus can
escape the trap and how to mitigate it.

#### Acceptance Criteria

1. THE Focus_Trap hook SHALL include a JSDoc `@remarks` section that documents
   the limitation: focus trapping only applies to DOM elements within the
   container ref, and elements rendered via React portals outside the container
   are not included.
2. THE Focus_Trap hook SHALL accept an optional `portalContainers` parameter of
   type `RefObject<HTMLElement>[]` that specifies additional DOM nodes to
   include in the focusable element query.
3. WHEN `portalContainers` are provided, THE Focus_Trap hook SHALL query
   focusable elements from both the main container and all provided portal
   container refs.
4. WHEN `portalContainers` are provided and a Tab keypress occurs, THE
   Focus_Trap hook SHALL cycle focus across the combined set of focusable
   elements from the main container and all portal containers.

### Requirement 6: Explicit Async Return Type for pop()

**User Story:** As a developer consuming the drawer stack API, I want the
`pop()` operation to have an explicit `Promise<void>` return type, so that I can
properly handle the asynchronous nature of the close guard and avoid unhandled
promise rejections.

#### Acceptance Criteria

1. THE Stack_Operations interface SHALL declare the `pop` method with a return
   type of `Promise<void>`.
2. WHEN `pop()` is called and the topmost drawer has an `onBeforeClose` guard,
   THE Drawer_Stack SHALL await the guard result before dispatching the POP
   action.
3. WHEN `pop()` is called internally by the backdrop click handler, THE
   Drawer_Stack SHALL handle the returned promise to prevent unhandled
   rejections.
4. WHEN `pop()` is called internally by the Escape key handler, THE Drawer_Stack
   SHALL handle the returned promise to prevent unhandled rejections.
5. WHEN `pop()` is called internally by the drag-to-dismiss handler, THE
   Drawer_Stack SHALL handle the returned promise to prevent unhandled
   rejections.
6. WHEN `pop()` is called internally by the mobile swipe-to-dismiss handler, THE
   Drawer_Stack SHALL handle the returned promise to prevent unhandled
   rejections.
