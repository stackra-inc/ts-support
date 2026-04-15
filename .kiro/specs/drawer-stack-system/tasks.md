# Implementation Plan: Drawer Stack System

## Overview

Build a stack-based drawer management system in
`packages/ui/src/components/drawer-stack/` that replaces the current fragmented
approach (boolean flags + `DrawerOverlay` + HeroUI Drawer). The system provides
a single context provider, stack operations (push/pop/replace/clear/popTo),
sub-view navigation, configurable widths per drawer type, and animated
transitions. Zero application-specific imports — extractable to
`@abdokouta/react-drawers`.

### Drawer Width Presets

| Drawer               | Width |
| -------------------- | ----- |
| Notifications        | 380px |
| Profile / Settings   | 420px |
| Cart Coupon/Customer | 400px |
| Checkout             | 480px |
| Upsell               | 480px |
| Event Detail         | 560px |
| Seat Map             | 640px |
| Shift Management     | 420px |

## Tasks

- [x] 1. Create types, constants, and barrel export
  - [x] 1.1 Create `packages/ui/src/components/drawer-stack/types.ts`
    - Define `DrawerConfig<TId>` with `id`, `width`, `closeOnEscape`,
      `singleton`, `metadata`
    - Define `DrawerEntry<TId>` with `instanceId`, `config`, `component`,
      `triggerElement`
    - Define `StackOperations<TId>` with `push`, `pop`, `replace`, `clear`,
      `popTo`
    - Define `DrawerStackContextValue<TId>` with `stack`, `isOpen`,
      `activeDrawer`, `operations`
    - Define `StackAction<TId>` union type for reducer actions (PUSH, POP,
      REPLACE, CLEAR, POP_TO, BRING_TO_TOP)
    - Define `SubViewNavigatorProps<TView>` with `initialView`, `views`,
      `onViewChange`
    - Define `SubViewContextValue<TView>` with `currentView`, `viewHistory`,
      `canGoBack`, `goTo`, `goBack`
    - Define `DrawerWidthPreset` type and `DRAWER_WIDTH_PRESETS` map with all 8
      drawer widths from the table above
    - _Requirements: 4.1, 7.1, 7.2, 7.3, 7.4_

  - [x] 1.2 Create `packages/ui/src/components/drawer-stack/constants.ts`
    - Export `DRAWER_DEFAULTS` object: `WIDTH: 480`, `BASE_Z_INDEX: 50`,
      `Z_INDEX_STEP: 10`, `ANIMATION_DURATION_MS: 250`, `DIMMED_OPACITY: 0.4`,
      `CLOSE_ON_ESCAPE: true`
    - _Requirements: 2.2, 4.2, 4.3, 5.1, 5.2_

  - [x] 1.3 Create `packages/ui/src/components/drawer-stack/index.ts` barrel
        export
    - Re-export all types, constants, provider, container, sub-view navigator,
      and hooks
    - _Requirements: 10.1, 10.4_

- [x] 2. Implement DrawerStackProvider with useReducer
  - [x] 2.1 Create
        `packages/ui/src/components/drawer-stack/drawer-stack-provider.tsx`
    - Create `DrawerStackContext` with
      `createContext<DrawerStackContextValue | null>(null)`
    - Implement `stackReducer` pure function handling all 6 action types
    - PUSH: append entry; if singleton + existing id, dispatch BRING_TO_TOP
      instead
    - POP: remove last element
    - REPLACE: remove last, append new (single update)
    - CLEAR: return empty array
    - POP_TO: find index of matching id, slice to `index + 1`; no-op if not
      found
    - BRING_TO_TOP: remove entry at matching index, append to end
    - Implement `DrawerStackProvider` component using
      `useReducer(stackReducer, [])`
    - Wrap `push` to capture `document.activeElement` as `triggerElement` and
      generate `instanceId` via `crypto.randomUUID()`
    - Expose `stack`, `isOpen`, `activeDrawer`, and all operations via context
      value
    - Memoize context value to prevent unnecessary re-renders
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 9.3, 9.4_

  - [x] 2.2 Create `packages/ui/src/components/drawer-stack/use-drawer-stack.ts`
    - Implement `useDrawerStack<TId>()` hook that reads from
      `DrawerStackContext`
    - Throw descriptive error when used outside `DrawerStackProvider`
    - Return typed
      `{ stack, isOpen, activeDrawer, push, pop, replace, clear, popTo }`
    - _Requirements: 1.10, 7.3_

- [x] 3. Implement DrawerContainer renderer
  - [x] 3.1 Create
        `packages/ui/src/components/drawer-stack/drawer-container.tsx`
    - Read stack from context via `useDrawerStack()`
    - Render a single shared backdrop when `isOpen` is true: `fixed inset-0`,
      `bg-black/30 backdrop-blur-sm`, z-index = `BASE_Z_INDEX - 1`
    - Backdrop click calls `clear()`
    - Map each `DrawerEntry` to a positioned drawer panel from the right edge
    - Each panel z-index: `BASE_Z_INDEX + (index * Z_INDEX_STEP)`
    - Each panel opacity: last entry = 1.0, others = `DIMMED_OPACITY`
    - Apply width from `entry.config.width` (default `DRAWER_DEFAULTS.WIDTH`)
    - Animate entry: slide-in from right (`translate-x-full` → `translate-x-0`)
      with `ANIMATION_DURATION_MS`
    - Animate exit: slide-out to right (`translate-x-0` → `translate-x-full`)
      with `ANIMATION_DURATION_MS`
    - Set `role="dialog"` and `aria-modal="true"` on each panel
    - Manage body scroll lock: `overflow: hidden` when stack non-empty, restore
      on empty
    - Handle Escape key: call `pop()` unless active drawer has
      `closeOnEscape: false`
    - Handle focus trap: move focus to first focusable element on open, restore
      trigger focus on close
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6,
      4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 4. Implement SubViewNavigator
  - [x] 4.1 Create
        `packages/ui/src/components/drawer-stack/sub-view-navigator.tsx`
    - Create `SubViewContext` with
      `createContext<SubViewContextValue | null>(null)`
    - Maintain internal `viewStack: TView[]` state initialized with
      `[initialView]`
    - `goTo(viewId)`: push viewId onto viewStack, animate content slide-in from
      right
    - `goBack()`: pop topmost viewId, animate content slide-in from left
    - Render `views[currentView]` with CSS transition (slide left/right,
      `ANIMATION_DURATION_MS`)
    - When `canGoBack` is true, render a back button in the header area
    - Call `onViewChange` callback when view changes
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 4.2 Create `packages/ui/src/components/drawer-stack/use-sub-view.ts`
    - Implement `useSubView<TView>()` hook that reads from `SubViewContext`
    - Throw descriptive error when used outside `SubViewNavigator`
    - Return typed `{ currentView, viewHistory, canGoBack, goTo, goBack }`
    - _Requirements: 6.2, 6.5, 7.4_

  - [x] 4.3 Wire Escape key delegation between SubViewNavigator and
        DrawerStackProvider
    - When sub-view depth > 1 and Escape is pressed, call `goBack()` instead of
      `pop()`
    - When sub-view depth === 1 and Escape is pressed, delegate to drawer stack
      `pop()`
    - _Requirements: 6.7, 6.8_

- [x] 5. Checkpoint — Core system verification
  - Verify all files compile with `tsc --noEmit` in `packages/ui`
  - Verify barrel export from `packages/ui/src/index.ts` includes all
    drawer-stack exports
  - Verify zero application-specific imports in the drawer-stack directory
  - Build the package with `tsup` and confirm dist output

- [x] 6. Export from @abdokouta/react-ui and build
  - [x] 6.1 Update `packages/ui/src/components/index.ts` to re-export
        drawer-stack
    - Add `export * from "./drawer-stack"` to components barrel
    - _Requirements: 10.1, 10.4_

  - [x] 6.2 Update `packages/ui/src/index.ts` to export drawer-stack public API
    - Export `DrawerStackProvider`, `DrawerContainer`, `SubViewNavigator`
    - Export `useDrawerStack`, `useSubView`
    - Export all types: `DrawerConfig`, `DrawerEntry`, `StackOperations`,
      `DrawerStackContextValue`, `SubViewNavigatorProps`, `SubViewContextValue`,
      `DrawerWidthPreset`, `DRAWER_WIDTH_PRESETS`
    - Export `DRAWER_DEFAULTS` constants
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 6.3 Build `packages/ui` with tsup and verify dist output
    - Run `tsup` build, confirm no errors
    - Verify `.d.ts` exports include all drawer-stack types
    - _Requirements: 10.1_

- [x] 7. Final checkpoint — Full verification
  - Type-check passes for `packages/ui`
  - Build succeeds with all exports
  - No application-specific imports in
    `packages/ui/src/components/drawer-stack/`
  - All types, components, hooks, and constants exported from single entry point

## Notes

- The drawer-stack module lives in `packages/ui/src/components/drawer-stack/`
  (not in the app) so it's reusable and extractable
- Width presets are defined as a typed map so consumers can reference them by
  name (e.g., `DRAWER_WIDTH_PRESETS.notifications`)
- Migration of existing drawers (NotificationPanel, ShiftPanel, ProfileDrawer)
  to use the stack system is a separate follow-up task
- The system uses CSS transitions for animations rather than HeroUI Drawer's
  built-in motion, giving full control over stacking behavior
- Sub-view navigation is opt-in — simple drawers don't need it
