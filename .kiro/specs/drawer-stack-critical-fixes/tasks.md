# Implementation Plan: drawer-stack-critical-fixes

## Overview

Seven targeted bug fixes across the drawer-stack system. Each fix is scoped to
specific files with minimal blast radius. Tasks are ordered so that
interface/provider changes land first (enabling downstream fixes), followed by
individual hook and component fixes, with tests interspersed close to their
implementations.

## Tasks

- [x] 1. Update StackOperations interface and DrawerStackProvider to return
     `Promise<boolean>` from `pop()`
  - [x] 1.1 Update `StackOperations.pop` signature to
        `pop: () => Promise<boolean>` in
        `packages/ui/src/components/drawer-stack/interfaces/stack-operations/stack-operations.interface.ts`
    - Change return type from `void` to `Promise<boolean>`
    - Update JSDoc to document the return value
    - _Requirements: 3.1, 3.2_

  - [x] 1.2 Update `DrawerStackProvider.pop()` to return `Promise<boolean>` in
        `packages/ui/src/components/drawer-stack/providers/drawer-stack.provider.tsx`
    - Return `false` when stack is empty, when guard returns false, or when
      guard throws
    - Return `true` after dispatching POP
    - _Requirements: 3.1, 3.2_

- [x] 2. Fix SubViewNavigator slide transitions (Req 1)
  - [x] 2.1 Replace CSS class-based animations with inline style transitions in
        `packages/ui/src/components/drawer-stack/components/sub-view-navigator/sub-view-navigator.component.tsx`
    - Remove references to `animate-slide-in-right` and `animate-slide-in-left`
      class names
    - Implement two-phase animation using `useState` + `useEffect` +
      `requestAnimationFrame`
    - Phase 1: set starting position off-screen (`translateX(100%)` for forward,
      `translateX(-100%)` for back)
    - Phase 2: animate to `translateX(0)` with `ANIMATION_DURATION_MS` and
      cubic-bezier easing
    - Apply inline `style` to the view container div
    - Clean up `requestAnimationFrame` on unmount
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]\* 2.2 Write property test for SubViewNavigator inline transition
    direction
    - **Property 1: SubViewNavigator inline transition direction**
    - Use fast-check to generate arbitrary sequences of goTo/goBack operations
    - Assert forward transitions use positive translateX offset, back
      transitions use negative
    - Assert no transform is applied when no transition is in progress
    - **Validates: Requirements 1.1, 1.2, 1.4**

- [x] 3. Fix useFocusTrap focus restoration on unmount (Req 2)
  - [x] 3.1 Add cleanup return in the auto-focus `useEffect` in
        `packages/ui/src/components/drawer-stack/hooks/use-focus-trap/use-focus-trap.hook.ts`
    - Store `document.activeElement` as previously focused element on activation
    - On deactivation/unmount, restore focus if element is still in DOM via
      `document.body.contains()`
    - Set `previouslyFocusedRef.current = null` after restoration
    - Cancel any pending `requestAnimationFrame` in cleanup
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]\* 3.2 Write property test for focus trap round-trip restoration
    - **Property 2: Focus trap round-trip restoration**
    - Use fast-check to generate arbitrary focusable elements and
      activation/deactivation sequences
    - Assert focus is restored to the original element when trap deactivates (if
      element is in DOM)
    - Assert no error when previously focused element is removed from DOM
    - **Validates: Requirements 2.1, 2.2**

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Fix useDrawerDrag to respect onBeforeClose guard and clean up
     transitionend listeners (Req 3, 5)
  - [x] 5.1 Update `UseDrawerDragOptions.onDismiss` type in
        `packages/ui/src/components/drawer-stack/interfaces/use-drawer-drag/use-drawer-drag.interface.ts`
    - Change `onDismiss` type from `() => void` to
      `() => Promise<boolean> | boolean`
    - _Requirements: 3.1_

  - [x] 5.2 Add AbortController for transitionend listener cleanup in
        `packages/ui/src/components/drawer-stack/hooks/use-drawer-drag/use-drawer-drag.hook.ts`
    - Add `abortRef = useRef<AbortController | null>(null)`
    - Add unmount cleanup effect that calls `abortRef.current?.abort()`
    - Before adding any `transitionend` listener, abort previous controller and
      create a new one
    - Pass `{ once: true, signal }` to all
      `addEventListener("transitionend", ...)` calls
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.3 Implement call-first dismiss pattern in `onPointerUp` in
        `packages/ui/src/components/drawer-stack/hooks/use-drawer-drag/use-drawer-drag.hook.ts`
    - Make `onPointerUp` async
    - When `shouldDismiss` is true, call `await onDismiss()` first
    - If `onDismiss` returns `true` (pop succeeded), animate panel to
      `translateX(100%)` with transitionend cleanup
    - If `onDismiss` returns `false` (pop blocked), snap back to original
      position
    - Reset inline transform and transition styles after snap-back transitionend
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 5.4 Update `DrawerContainer` to pass async `onDismiss` returning boolean
        to DesktopPanel in
        `packages/ui/src/components/drawer-stack/components/drawer-container/drawer-container.component.tsx`
    - Create `handleDismiss` callback that calls `operations.pop()` and returns
      its boolean result
    - Pass `handleDismiss` as the `onDismiss` prop to DesktopPanel
    - _Requirements: 3.1, 3.2_

  - [ ]\* 5.5 Write property test for drag dismiss respects onBeforeClose guard
    - **Property 3: Drag dismiss respects onBeforeClose guard**
    - Use fast-check to generate arbitrary guard return values (true/false)
    - Assert panel snaps back when guard returns false, never reaches
      translateX(100%)
    - Assert panel animates off-screen when guard returns true
    - **Validates: Requirements 3.1, 3.2**

- [x] 6. Fix usePreventScroll instance-safe shared state (Req 4)
  - [x] 6.1 Replace module-level variables with window singleton in
        `packages/ui/src/components/drawer-stack/hooks/use-prevent-scroll/use-prevent-scroll.hook.ts`
    - Create `ScrollLockState` interface with `lockCount`, `savedScrollY`,
      `savedBodyStyles`, `cleanupFns`
    - Create `getSharedState()` function that reads/creates singleton on
      `window.__drawerStackScrollLock`
    - Replace all module-level variable references with `getSharedState()` calls
    - Ensure first lock applies scroll prevention styles, last unlock restores
      original styles
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]\* 6.2 Write property test for scroll lock round-trip
    - **Property 4: Scroll lock round-trip**
    - Use fast-check to generate arbitrary sequences of lock/unlock operations
      across multiple instances
    - Assert body styles are applied on first lock and fully restored on last
      unlock
    - Assert lock count never goes negative
    - **Validates: Requirements 4.3, 4.4**

- [x] 7. Fix DrawerContainer defensive wrapper access and Escape key handling
     (Req 6, 7)
  - [x] 7.1 Add `getDrawerWrapper()` helper with null guard and dev warning in
        `packages/ui/src/components/drawer-stack/components/drawer-container/drawer-container.component.tsx`
    - Create module-level `wrapperWarned` flag to warn only once per session
    - Return `HTMLElement | null` from `getDrawerWrapper()`
    - Log `console.warn` in dev mode (`process.env.NODE_ENV !== "production"`)
      when wrapper is missing
    - Replace all `document.querySelector("[data-drawer-wrapper]")` calls with
      `getDrawerWrapper()`
    - Guard all property accesses on the wrapper with null checks
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 7.2 Add `event.defaultPrevented` check to Escape key handler in
        `packages/ui/src/components/drawer-stack/components/drawer-container/drawer-container.component.tsx`
    - Add `if (e.defaultPrevented) return;` before processing Escape key
    - Keep capture phase listener (`true` third argument)
    - Do not call `operations.pop()` or `event.stopPropagation()` when
      `defaultPrevented` is true
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]\* 7.3 Write property test for Escape key respects defaultPrevented
    - **Property 5: Escape key respects defaultPrevented**
    - Use fast-check to generate arbitrary `defaultPrevented` states
      (true/false)
    - Assert handler does not call pop or stopPropagation when defaultPrevented
      is true
    - Assert handler calls pop and stopPropagation when defaultPrevented is
      false
    - **Validates: Requirements 7.1, 7.2**

  - [ ]\* 7.4 Write unit tests for defensive wrapper access
    - Test MobilePanel does not throw when `data-drawer-wrapper` is missing
    - Test DrawerContainer does not throw when `data-drawer-wrapper` is missing
      on mobile
    - Test `console.warn` is logged once in dev mode when wrapper is missing
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check (already available in the project)
- Test files should use the `*.property.test.ts` / `*.test.ts` naming convention
  per vitest config
- Checkpoints ensure incremental validation
