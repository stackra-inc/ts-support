# Requirements Document

## Introduction

This spec covers 7 critical and important bugs in the drawer-stack system
(`packages/ui/src/components/drawer-stack/`). The bugs range from missing CSS
animations and broken focus restoration to event listener leaks and module-level
state hazards. Each requirement maps to a specific bug with clear acceptance
criteria.

## Glossary

- **SubViewNavigator**: Component that manages an internal view stack within a
  single drawer, providing forward/back navigation with animated slide
  transitions.
- **DrawerContainer**: Top-level component that renders the drawer stack as
  layered panels (desktop side-panels or mobile bottom sheets).
- **DesktopPanel**: Internal component within DrawerContainer that renders a
  right-edge side panel for viewports ≥768px.
- **MobilePanel**: Internal component within DrawerContainer that renders a
  Vaul-style bottom sheet for viewports <768px.
- **useFocusTrap**: Hook that traps Tab/Shift+Tab focus within the active drawer
  and stores a reference to the previously focused element.
- **usePreventScroll**: Hook that prevents background page scrolling when
  drawers are open using reference-counted locking.
- **useDrawerDrag**: Hook that implements gesture-driven drag-to-dismiss for
  desktop drawer panels.
- **DrawerStackProvider**: Context provider that holds the `DrawerEntry[]` state
  via `useReducer` and exposes stack operations.
- **onBeforeClose**: Optional async guard function on a drawer config that
  returns `false` to cancel a pop operation.
- **data-drawer-wrapper**: HTML attribute that consumers must place on their app
  wrapper element to enable Vaul-style background scaling on mobile.
- **ANIMATION_DURATION_MS**: Constant (250ms) defining the default animation
  duration for drawer enter/exit transitions.

## Requirements

### Requirement 1: SubViewNavigator slide transitions

**User Story:** As a user navigating between sub-views within a drawer, I want
to see a slide animation when views change, so that the navigation feels smooth
and directional.

#### Acceptance Criteria

1. WHEN the SubViewNavigator transitions forward to a new view, THE
   SubViewNavigator SHALL apply a slide-in-from-right animation lasting
   ANIMATION_DURATION_MS milliseconds using inline CSS transitions.
2. WHEN the SubViewNavigator transitions back to a previous view, THE
   SubViewNavigator SHALL apply a slide-in-from-left animation lasting
   ANIMATION_DURATION_MS milliseconds using inline CSS transitions.
3. THE SubViewNavigator SHALL NOT reference CSS class names
   `animate-slide-in-right` or `animate-slide-in-left`.
4. WHEN no transition is in progress, THE SubViewNavigator SHALL render the
   current view without any transform applied.

### Requirement 2: Focus restoration on drawer unmount

**User Story:** As a keyboard user, I want focus to return to the element that
triggered a drawer when that drawer closes, so that I maintain my place in the
page.

#### Acceptance Criteria

1. WHEN the useFocusTrap hook activates, THE useFocusTrap hook SHALL store a
   reference to `document.activeElement` as the previously focused element.
2. WHEN the useFocusTrap hook deactivates or unmounts, THE useFocusTrap hook
   SHALL restore focus to the previously focused element if that element is
   still present in the DOM.
3. IF the previously focused element is no longer in the DOM at the time of
   restoration, THEN THE useFocusTrap hook SHALL skip focus restoration without
   throwing an error.

### Requirement 3: Desktop drag dismiss respects onBeforeClose

**User Story:** As a developer using onBeforeClose guards, I want desktop
drag-to-dismiss to check the guard before visually removing the drawer, so that
blocked dismissals don't cause visual glitches.

#### Acceptance Criteria

1. WHEN the user completes a drag gesture that exceeds the dismiss threshold on
   a DesktopPanel, THE useDrawerDrag hook SHALL call `onDismiss` before
   animating the drawer off-screen.
2. WHEN `onDismiss` is called and the pop is blocked by onBeforeClose, THE
   DesktopPanel SHALL snap back to its original position without having animated
   to `translateX(100%)`.
3. THE useDrawerDrag hook SHALL reset the panel's inline transform and
   transition styles after a snap-back animation completes.

### Requirement 4: usePreventScroll instance-safe state

**User Story:** As a developer, I want scroll locking to work correctly even
when multiple DrawerContainer instances exist or the module is loaded in
multiple bundle chunks, so that scroll prevention is reliable.

#### Acceptance Criteria

1. THE usePreventScroll hook SHALL NOT use module-level variables for lock
   count, saved scroll position, or cleanup functions.
2. THE usePreventScroll hook SHALL use a shared reference mechanism (such as a
   property on `document.body` or a singleton object attached to `window`) that
   remains consistent across multiple module instances.
3. WHEN the last active scroll lock is released, THE usePreventScroll hook SHALL
   restore the original body scroll styles and scroll position.
4. WHEN a scroll lock is acquired and it is the first active lock, THE
   usePreventScroll hook SHALL apply scroll prevention styles to the document
   body.

### Requirement 5: useDrawerDrag cleans up transitionend listeners

**User Story:** As a developer, I want drag-to-dismiss to clean up event
listeners on unmount, so that no listeners leak if the component is removed
during an animation.

#### Acceptance Criteria

1. WHEN the useDrawerDrag hook's component unmounts during a snap-back or
   dismiss animation, THE useDrawerDrag hook SHALL remove any pending
   `transitionend` listeners from the panel element.
2. THE useDrawerDrag hook SHALL use an AbortController or stored listener
   references to enable deterministic cleanup of `transitionend` listeners.
3. WHEN a `transitionend` listener fires normally, THE useDrawerDrag hook SHALL
   not attempt to remove it again.

### Requirement 6: MobilePanel defensive wrapper access

**User Story:** As a developer integrating the drawer stack, I want a clear
warning if I forget to add the `data-drawer-wrapper` attribute, so that I can
diagnose why background scaling isn't working.

#### Acceptance Criteria

1. WHEN the MobilePanel queries for `[data-drawer-wrapper]` and the element does
   not exist, THE MobilePanel SHALL skip all background scaling operations
   without throwing an error.
2. WHEN the MobilePanel queries for `[data-drawer-wrapper]` and the element does
   not exist in a development build, THE MobilePanel SHALL log a warning to the
   console indicating the required wrapper attribute is missing.
3. WHEN the DrawerContainer applies Vaul-style background scaling on mobile and
   `[data-drawer-wrapper]` does not exist, THE DrawerContainer SHALL skip the
   scaling without throwing an error.

### Requirement 7: Escape key respects nested event handling

**User Story:** As a developer rendering a modal inside a drawer, I want the
modal's Escape handler to take priority over the drawer's, so that pressing
Escape closes the modal first rather than the drawer.

#### Acceptance Criteria

1. WHEN the DrawerContainer's Escape key handler fires, THE DrawerContainer
   SHALL check `event.defaultPrevented` before processing the key event.
2. IF `event.defaultPrevented` is true when the Escape key handler fires, THEN
   THE DrawerContainer SHALL not call `operations.pop()` and SHALL not call
   `event.stopPropagation()`.
3. THE DrawerContainer SHALL continue to listen for Escape key events on the
   capture phase to maintain priority ordering within the drawer stack itself.
