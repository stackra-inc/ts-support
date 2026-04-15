# Implementation Plan: Drawer Stack Enhancements

## Overview

Incrementally add four opt-in features to the drawer stack system: lifecycle
hooks (`onBeforeOpen`, `onAfterOpen`, `onAfterClose`), stack persistence via
`localStorage`, keyboard navigation between stacked drawers, and a
`ResizeObserver` integration for mobile bottom sheets. Each task extends
existing interfaces and components without breaking current consumers.

## Tasks

- [x] 1. Extend DrawerConfig interface with lifecycle hooks and observeResize
  - [x] 1.1 Add `onBeforeOpen`, `onAfterOpen`, `onAfterClose`, and
        `observeResize` fields to `DrawerConfig`
    - Modify
      `packages/ui/src/components/drawer-stack/interfaces/drawer-config/drawer-config.interface.ts`
    - Add `onBeforeOpen?: () => boolean | Promise<boolean>`
    - Add `onAfterOpen?: () => void`
    - Add `onAfterClose?: () => void`
    - Add `observeResize?: boolean`
    - All fields optional, no breaking changes
    - _Requirements: 1.1, 2.1, 3.1, 6.1_

  - [ ]\* 1.2 Write unit tests for DrawerConfig type acceptance
    - Verify that DrawerConfig accepts all new optional fields
    - Verify existing configs without new fields still compile
    - _Requirements: 1.1, 2.1, 3.1, 6.1_

- [x] 2. Implement onBeforeOpen lifecycle hook
  - [x] 2.1 Add async guard to `push` in `DrawerStackProvider`
    - Modify
      `packages/ui/src/components/drawer-stack/providers/drawer-stack.provider.tsx`
    - Make `push` async: invoke `config.onBeforeOpen()` before dispatching PUSH
    - If callback returns `false`, cancel push
    - If callback throws or Promise rejects, cancel push
    - If callback returns `true` or is not provided, proceed with push
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]\* 2.2 Write property test: onBeforeOpen guard controls push outcome
    - **Property 1: onBeforeOpen guard controls push outcome**
    - Generate random boolean/throwing callbacks via fast-check
    - Assert stack contains the drawer iff callback returned true
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6**

  - [ ]\* 2.3 Write unit tests for onBeforeOpen edge cases
    - Test push without onBeforeOpen adds drawer immediately (Req 1.7)
    - Test push with async onBeforeOpen returning true adds drawer (Req 1.5)
    - Test push with onBeforeOpen throwing cancels push (Req 1.6)
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 3. Implement onAfterOpen lifecycle hook
  - [x] 3.1 Fire `onAfterOpen` after enter animation in `DrawerContainer`
    - Modify
      `packages/ui/src/components/drawer-stack/components/drawer-container/drawer-container.component.tsx`
    - In both DesktopPanel and MobilePanel, add `afterOpenCalledRef` to track
      invocation
    - When `entered` becomes true and `isLeaving` is false, invoke
      `entry.config.onAfterOpen?.()` once
    - Ensure singleton re-activation does not re-invoke the callback
    - _Requirements: 2.2, 2.4, 2.5_

  - [ ]\* 3.2 Write property test: onAfterOpen fires exactly once after enter
    animation
    - **Property 2: onAfterOpen fires exactly once after enter animation**
    - Push drawers with onAfterOpen callbacks, simulate enter animation
      completion
    - Assert callback count equals exactly 1 per push
    - **Validates: Requirements 2.2, 2.4, 2.5**

  - [ ]\* 3.3 Write unit tests for onAfterOpen
    - Test no callback provided — animation completes without error (Req 2.3)
    - Test singleton re-activation does not invoke onAfterOpen again (Req 2.5)
    - _Requirements: 2.3, 2.5_

- [x] 4. Implement onAfterClose lifecycle hook
  - [x] 4.1 Fire `onAfterClose` after exit animation in `DrawerContainer`
    - Modify
      `packages/ui/src/components/drawer-stack/components/drawer-container/drawer-container.component.tsx`
    - In the visual sync useEffect exit timer, invoke
      `entry.config.onAfterClose?.()` after exit animation duration, before
      purging the visual entry
    - When `clear` is called, each exiting drawer gets its own timer and fires
      its own `onAfterClose`
    - _Requirements: 3.2, 3.4, 3.5_

  - [ ]\* 4.2 Write property test: onAfterClose fires exactly once per removal
    - **Property 3: onAfterClose fires exactly once per removal**
    - Push N drawers with onAfterClose, remove K drawers, assert exactly K
      invocations
    - **Validates: Requirements 3.2, 3.4, 3.5**

  - [ ]\* 4.3 Write unit tests for onAfterClose
    - Test no callback provided — exit completes without error (Req 3.3)
    - Test clear with multiple drawers fires onAfterClose for each (Req 3.5)
    - _Requirements: 3.3, 3.5_

- [x] 5. Checkpoint - Ensure all lifecycle hook tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement stack persistence via localStorage
  - [x] 6.1 Add `persistKey` and `onRestore` props to `DrawerStackProvider`
    - Modify
      `packages/ui/src/components/drawer-stack/providers/drawer-stack.provider.tsx`
    - Add `persistKey?: string` and `onRestore?: (ids: string[]) => void` to
      provider props
    - Define `PersistedDrawerState` interface for serializable config fields
    - _Requirements: 4.1, 4.4_

  - [x] 6.2 Implement persistence write effect
    - Add `useEffect` in `DrawerStackProvider` that serializes stack to
      `localStorage` on every stack change when `persistKey` is set
    - Exclude `component`, callback functions — only persist `id`, `width`,
      `closeOnEscape`, `singleton`, `metadata`, `observeResize`
    - Wrap in try/catch, log warning on failure in dev mode
    - _Requirements: 4.2, 4.7, 4.8_

  - [x] 6.3 Implement persistence restore effect
    - Add mount-only `useEffect` that reads `localStorage` when `persistKey` is
      set
    - Parse stored JSON, extract drawer IDs
    - If `onRestore` is provided, call it with the ID array
    - If `onRestore` is not provided, discard persisted data
    - Wrap in try/catch for malformed JSON or storage errors
    - _Requirements: 4.3, 4.5, 4.6, 4.8_

  - [ ]\* 6.4 Write property test: persistence round-trip preserves drawer IDs
    - **Property 4: Persistence round-trip preserves drawer IDs**
    - Generate random push/pop sequences, verify localStorage contains current
      stack IDs
    - Simulate remount, verify onRestore receives the same IDs
    - **Validates: Requirements 4.2, 4.5**

  - [ ]\* 6.5 Write unit tests for persistence
    - Test mount without persistKey does not touch localStorage (Req 4.7)
    - Test mount without onRestore discards persisted state (Req 4.6)
    - Test localStorage error logs warning and starts empty (Req 4.8)
    - _Requirements: 4.6, 4.7, 4.8_

- [x] 7. Implement keyboard navigation between stacked drawers
  - [x] 7.1 Extend `DrawerStackContextValue` with `enableKeyboardNavigation`
    - Modify
      `packages/ui/src/components/drawer-stack/contexts/drawer-stack/drawer-stack.context.ts`
    - Add `enableKeyboardNavigation: boolean` to the context value interface
    - _Requirements: 5.1_

  - [x] 7.2 Thread `enableKeyboardNavigation` prop through provider to context
    - Modify
      `packages/ui/src/components/drawer-stack/providers/drawer-stack.provider.tsx`
    - Add `enableKeyboardNavigation?: boolean` to provider props (default
      `false`)
    - Include in context value `useMemo`
    - _Requirements: 5.1, 5.7_

  - [x] 7.3 Add keyboard listener in `DrawerContainer`
    - Modify
      `packages/ui/src/components/drawer-stack/components/drawer-container/drawer-container.component.tsx`
    - Add `useEffect` that registers `keydown` handler on `window` when
      `enableKeyboardNavigation` is true and stack has 2+ drawers
    - Handle `Ctrl+Tab` (cycle next), `Ctrl+Shift+Tab` (cycle previous),
      `Ctrl+1..9` (direct access)
    - Call `operations.bringToTop` with the target drawer ID
    - Clean up listener on unmount or when conditions change
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.8_

  - [ ]\* 7.4 Write property test: keyboard cycling is bidirectional and wraps
    - **Property 5: Keyboard cycling is bidirectional and wraps**
    - Generate stacks of N drawers, simulate K Ctrl+Tab presses then K
      Ctrl+Shift+Tab presses
    - Assert original top drawer is restored
    - **Validates: Requirements 5.3, 5.4**

  - [ ]\* 7.5 Write property test: Ctrl+number direct access
    - **Property 6: Ctrl+number direct access**
    - Generate stacks of N drawers, press Ctrl+K for random K in 1..9
    - Assert drawer at position K is on top if K ≤ N, no-op if K > N
    - **Validates: Requirements 5.5**

  - [ ]\* 7.6 Write unit tests for keyboard navigation
    - Test enableKeyboardNavigation defaults to false, no listeners registered
      (Req 5.7)
    - Test Ctrl+Tab with fewer than 2 drawers is no-op (Req 5.8)
    - Test keyboard navigation animates with standard timing (Req 5.6)
    - _Requirements: 5.6, 5.7, 5.8_

- [x] 8. Checkpoint - Ensure persistence and keyboard navigation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement ResizeObserver for mobile bottom sheets
  - [x] 9.1 Attach ResizeObserver in MobilePanel when `observeResize` is true
    - Modify
      `packages/ui/src/components/drawer-stack/components/drawer-container/drawer-container.component.tsx`
    - Add `contentRef` to the MobilePanel content container
    - Add `useEffect` that creates a `ResizeObserver` when
      `entry.config.observeResize` is true
    - Toggle `overflow-y: auto` when scrollHeight > clientHeight,
      `overflow-y: hidden` otherwise
    - Disconnect observer in cleanup
    - Do NOT attach ResizeObserver in DesktopPanel regardless of config
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]\* 9.2 Write property test: mobile overflow-y reflects content height
    - **Property 7: Mobile overflow-y reflects content height**
    - Generate random content heights, assert overflow-y matches expected value
    - **Validates: Requirements 6.3, 6.4**

  - [ ]\* 9.3 Write unit tests for ResizeObserver
    - Test observeResize on desktop does not attach ResizeObserver (Req 6.5)
    - Test ResizeObserver disconnected on drawer removal (Req 6.6)
    - Test no observeResize — no ResizeObserver attached (Req 6.7)
    - _Requirements: 6.5, 6.6, 6.7_

- [x] 10. Wire up barrel exports and final integration
  - [x] 10.1 Update barrel exports
    - Ensure `packages/ui/src/components/drawer-stack/index.ts` exports any new
      types (`PersistedDrawerState` if public, updated
      `DrawerStackProviderProps`)
    - Verify all new props and config fields are accessible to consumers
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

  - [ ]\* 10.2 Write integration tests for combined features
    - Test lifecycle hooks fire correctly during persistence restore flow
    - Test keyboard navigation works alongside lifecycle hooks
    - Test ResizeObserver works with onAfterOpen/onAfterClose
    - _Requirements: 1.2, 2.2, 3.2, 4.5, 5.3, 6.2_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document
- Unit tests validate specific examples and edge cases
- All changes are additive — existing consumers are unaffected
