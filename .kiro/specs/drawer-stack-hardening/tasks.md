# Implementation Plan: Drawer Stack Hardening

## Overview

Six targeted hardening improvements to the drawer stack system at
`packages/ui/src/components/drawer-stack/`. Each task addresses a specific
robustness gap: configurable StackDots threshold, horizontal scroll detection in
drag, z-index clamping, compact subtitle visibility, focus trap portal support,
and async pop() return type. All changes are backward-compatible leaf-level
modifications.

## Tasks

- [x] 1. Configurable StackDots counter threshold
  - [x] 1.1 Add `MAX_DOTS` field to `DRAWER_DEFAULTS` in
        `constants/drawer-defaults/drawer-defaults.constant.ts` with default
        value `5`
    - _Requirements: 1.3_
  - [x] 1.2 Update `StackDots` component in
        `components/stack-dots/stack-dots.component.tsx` to accept optional
        `maxDots` prop, remove local `MAX_DOTS` constant, and resolve threshold
        as `maxDots ?? DRAWER_DEFAULTS.MAX_DOTS`
    - Use resolved threshold for the dots-vs-counter rendering decision
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  - [ ]\* 1.3 Write property test for StackDots threshold rendering mode
    - **Property 1: StackDots threshold determines rendering mode**
    - Use fast-check to generate arbitrary `maxDots` (positive int) and
      `stackSize` (positive int), assert dots when `stackSize <= maxDots` and
      counter badge when `stackSize > maxDots`
    - **Validates: Requirements 1.1, 1.4, 1.5**
  - [ ]\* 1.4 Write unit tests for StackDots default and custom threshold
    - Test that default threshold uses `DRAWER_DEFAULTS.MAX_DOTS` (value 5)
    - Test that custom `maxDots` prop overrides the default
    - _Requirements: 1.2, 1.3_

- [x] 2. Horizontal scroll detection in drag handler
  - [x] 2.1 Add horizontal scroll check in `useDrawerDrag` hook at
        `hooks/use-drawer-drag/use-drawer-drag.hook.ts`
    - In the `onPointerDown` ancestor walk loop, add
      `if (el.scrollWidth > el.clientWidth && el.scrollLeft > 0) return;`
      alongside the existing vertical scroll check
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Add horizontal scroll check in `MobilePanel` pointer-down handler in
        `components/drawer-container/drawer-container.component.tsx`
    - In the mobile panel's `onPointerDown` ancestor walk loop, add the same
      `scrollWidth > clientWidth && scrollLeft > 0` check
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]\* 2.3 Write property test for horizontal scroll detection
    - **Property 2: Horizontal scroll detection blocks drag initiation**
    - Use fast-check to generate arbitrary `scrollWidth`, `clientWidth`, and
      `scrollLeft` values; assert drag is cancelled iff
      `scrollWidth > clientWidth && scrollLeft > 0`
    - **Validates: Requirements 2.1, 2.2, 2.3**
  - [ ]\* 2.4 Write unit tests for horizontal scroll detection in both desktop
    and mobile handlers
    - Test that drag is cancelled when ancestor has `scrollWidth > clientWidth`
      and `scrollLeft > 0`
    - Test that drag proceeds when `scrollLeft === 0`
    - Test both `useDrawerDrag` and `MobilePanel` handlers
    - _Requirements: 2.4_

- [x] 3. Z-index calculation safeguard
  - [x] 3.1 Add `MAX_STACK_DEPTH` field to `DRAWER_DEFAULTS` in
        `constants/drawer-defaults/drawer-defaults.constant.ts`
    - Set default value to `100`
    - _Requirements: 3.1_
  - [x] 3.2 Create `computeZIndex` helper and apply clamping in
        `components/drawer-container/drawer-container.component.tsx`
    - Implement `computeZIndex(index)` that returns
      `Math.min(BASE_Z_INDEX + index * Z_INDEX_STEP, 2147483647)`
    - Replace all inline z-index calculations in both `DesktopPanel` and
      `MobilePanel` with `computeZIndex(index)`
    - _Requirements: 3.2, 3.4_
  - [x] 3.3 Add console warning in `DrawerStackProvider.push()` at
        `providers/drawer-stack.provider.tsx`
    - When stack size >= `MAX_STACK_DEPTH` in non-production, log a warning;
      still allow the push
    - _Requirements: 3.3, 3.4_
  - [ ]\* 3.4 Write property test for z-index clamping
    - **Property 3: Z-index clamping**
    - Use fast-check to generate arbitrary stack indices; assert computed
      z-index equals `min(BASE_Z_INDEX + index * Z_INDEX_STEP, 2147483647)`
    - **Validates: Requirements 3.2, 3.4**
  - [ ]\* 3.5 Write unit tests for MAX_STACK_DEPTH warning and z-index bounds
    - Test that `DRAWER_DEFAULTS.MAX_STACK_DEPTH` exists and is a number
    - Test that push beyond MAX_STACK_DEPTH logs `console.warn` in dev mode
    - _Requirements: 3.1, 3.3_

- [x] 4. Checkpoint - Verify improvements 1-3
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Consistent subtitle visibility in compact DrawerHeader
  - [x] 5.1 Fix subtitle conditional in compact variant in
        `components/drawer-header/drawer-header.component.tsx`
    - Change desktop subtitle guard from `subtitle && !pills` to
      `subtitle && !(pills && pills.length > 0)` so empty `pills={[]}` doesn't
      hide subtitle
    - Ensure mobile subtitle span remains gated only by `subtitle` (no pills
      check)
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ]\* 5.2 Write property test for mobile compact subtitle visibility
    - **Property 4: Mobile compact subtitle visibility**
    - Use fast-check to generate arbitrary subtitle strings and pills arrays;
      assert subtitle is always visible on mobile when subtitle is non-empty
    - **Validates: Requirements 4.1**
  - [ ]\* 5.3 Write unit tests for compact header subtitle visibility
    - Test desktop hides subtitle when pills are present (non-empty array)
    - Test desktop shows subtitle when pills is empty array or undefined
    - Test mobile always shows subtitle regardless of pills
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 6. Focus trap portal support
  - [x] 6.1 Add JSDoc `@remarks` and `portalContainers` parameter to
        `useFocusTrap` in `hooks/use-focus-trap/use-focus-trap.hook.ts`
    - Add `@remarks` section documenting the portal limitation
    - Add optional `portalContainers: React.RefObject<HTMLElement | null>[]`
      parameter
    - _Requirements: 5.1, 5.2_
  - [x] 6.2 Update `getFocusableElements` to query all containers (main +
        portals)
    - Iterate over `containerRef` and all `portalContainers` refs, collect
      focusable elements from each
    - Skip null refs gracefully
    - _Requirements: 5.3_
  - [x] 6.3 Update Tab/Shift+Tab handler to check containment across all
        containers
    - Create `isInAnyContainer` helper that checks `containerRef` and all
      `portalContainers`
    - Use combined containment check for focus cycling logic
    - _Requirements: 5.4_
  - [ ]\* 6.4 Write property test for focus trap portal containers
    - **Property 5: Focus trap includes portal containers**
    - Use fast-check to generate arbitrary sets of focusable elements across
      main and portal containers; assert combined set includes all elements and
      Tab cycles through entire set
    - **Validates: Requirements 5.3, 5.4**
  - [ ]\* 6.5 Write unit tests for focus trap portal support
    - Test that `useFocusTrap` accepts `portalContainers` without error
    - Test that focusable elements from portal containers are included in focus
      cycling
    - _Requirements: 5.2, 5.3, 5.4_

- [x] 7. Explicit async return type for pop()
  - [x] 7.1 Update `pop` signature in
        `interfaces/stack-operations/stack-operations.interface.ts` to
        `pop: () => Promise<void>`
    - _Requirements: 6.1_
  - [x] 7.2 Handle pop() promise at all internal call sites in
        `components/drawer-container/drawer-container.component.tsx`
    - Backdrop click handler: `void operations.pop()`
    - Escape key handler: `void operations.pop()`
    - Desktop drag-to-dismiss `onDismiss`: `void operations.pop()`
    - Mobile swipe-to-dismiss `onDismiss`: `void operations.pop()`
    - _Requirements: 6.3, 6.4, 6.5, 6.6_
  - [x] 7.3 Verify provider `pop()` implementation in
        `providers/drawer-stack.provider.tsx` awaits `onBeforeClose` guard
    - Confirm the existing async implementation correctly awaits the guard
      before dispatching POP
    - _Requirements: 6.2_
  - [ ]\* 7.4 Write property test for async pop guard sequencing
    - **Property 6: Async pop guard sequencing**
    - Use fast-check to generate arbitrary `onBeforeClose` guard results
      (true/false, sync/async); assert POP is dispatched only when guard returns
      true, and guard is always awaited
    - **Validates: Requirements 6.2**
  - [ ]\* 7.5 Write unit tests for pop() promise handling
    - Test pop() return type is Promise<void> (TypeScript compilation)
    - Test backdrop click, Escape key, drag-to-dismiss, and mobile swipe
      handlers don't produce unhandled rejections
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with minimum 100 iterations per property
- All changes are backward-compatible — existing consumers are unaffected
- Test environment: JSDOM, React Testing Library, fast-check, with mocked
  `requestAnimationFrame`, `matchMedia`, and `crypto.randomUUID`
