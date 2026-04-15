# Implementation Plan: Drawer Composite Improvements

## Overview

Incremental implementation of eight improvements to the Drawer composite
component system in `packages/ui/src/components/drawer-stack/`. Each task builds
on the previous, starting with foundational infrastructure (context, helpers,
constants), then new components, then modifications to existing components, and
finally wiring everything together in the namespace and barrel exports.

## Tasks

- [x] 1. Create DrawerIdContext and useDrawerId hook
  - [x] 1.1 Create `contexts/drawer-id/drawer-id.context.ts` with
        `DrawerIdContext = createContext<string | null>(null)`
    - Create `contexts/drawer-id/index.ts` barrel export
    - Update `contexts/index.ts` to export `DrawerIdContext`
    - _Requirements: 8.6_

  - [x] 1.2 Create `hooks/use-drawer-id/use-drawer-id.hook.ts` that reads from
        `DrawerIdContext`
    - Create `hooks/use-drawer-id/index.ts` barrel export
    - Update `hooks/index.ts` to export `useDrawerId`
    - _Requirements: 8.6_

  - [x] 1.3 Wrap `DrawerPositionContext.Provider` with
        `DrawerIdContext.Provider` in `DesktopPanel` and `MobilePanel` inside
        `drawer-container.component.tsx`
    - Provide `entry.config.id` as the context value
    - _Requirements: 8.6_

- [x] 2. Create ScopedSlot helper and buildScopedSlotName utility
  - [x] 2.1 Create `utils/build-scoped-slot-name/build-scoped-slot-name.util.ts`
        with the `buildScopedSlotName` function
    - Transforms `drawer.<component>.<position>` →
      `drawer.<drawerId>.<component>.<position>`
    - Returns global name unchanged if drawerId is empty
    - Create barrel export and update `utils/index.ts`
    - _Requirements: 8.2_

  - [ ]\* 2.2 Write property test for buildScopedSlotName
    - **Property 9: Scoped slot name builder**
    - **Validates: Requirements 8.2**

  - [x] 2.3 Create `components/scoped-slot/scoped-slot.component.tsx` that
        renders both global and scoped `Slot` components
    - Reads `drawerId` from `DrawerIdContext` via `useDrawerId`
    - Renders `<Slot name={name} />` always, plus
      `<Slot name={buildScopedSlotName(name, drawerId)} />` when drawerId exists
    - Create barrel export and update `components/index.ts`
    - _Requirements: 8.1, 8.3, 8.4, 8.5_

  - [ ]\* 2.4 Write property test for ScopedSlot rendering
    - **Property 10: Slot scoping correctness**
    - **Validates: Requirements 8.1, 8.3, 8.4, 8.5**

- [x] 3. Rename DrawerBody to DrawerContent and update DRAWER_SLOTS
  - [x] 3.1 Create `components/drawer-content/drawer-content.component.tsx` by
        copying DrawerBody implementation
    - Rename component to `DrawerContent`, interface to `DrawerContentProps`
    - Replace `Slot` calls with `ScopedSlot` using `DRAWER_SLOTS.CONTENT`
      positions
    - Create `components/drawer-content/index.ts` barrel export
    - _Requirements: 1.1, 1.4_

  - [x] 3.2 Update `components/drawer-body/` to re-export from `drawer-content/`
        with `@deprecated` JSDoc tags
    - `DrawerBody` re-exports `DrawerContent`, `DrawerBodyProps` re-exports
      `DrawerContentProps`
    - _Requirements: 1.2, 1.3_

  - [x] 3.3 Add `CONTENT`, `ALERT`, `SECTION`, and `DIVIDER` keys to
        `DRAWER_SLOTS` in `constants/slot-positions/slot-positions.constant.ts`
    - `CONTENT` has `BEFORE`/`AFTER` with
      `drawer.content.before`/`drawer.content.after`
    - `BODY` retained as deprecated alias pointing to same strings as `CONTENT`
    - `ALERT` has `BEFORE`/`AFTER`
    - `SECTION` has `BEFORE`/`AFTER`/`BEFORE_TITLE`/`AFTER_TITLE`
    - `DIVIDER` has `BEFORE`/`AFTER`
    - _Requirements: 1.5, 1.6, 6.6, 7.1, 7.2_

  - [ ]\* 3.4 Write property test for DrawerContent padding mapping
    - **Property 1: DrawerContent padding mapping**
    - **Validates: Requirements 1.4**

- [x] 4. Checkpoint — Verify foundational infrastructure
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement DrawerLoading component
  - [x] 5.1 Create `interfaces/drawer-loading/drawer-loading.interface.ts` with
        `DrawerLoadingProps` and `DrawerLoadingVariant` types
    - Create barrel export and update `interfaces/index.ts`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 5.2 Create `components/drawer-loading/drawer-loading.component.tsx`
    - Implement spinner variant: centered spinner + optional label
    - Implement skeleton variant: animated pulse lines with configurable `lines`
      count (clamp min 1)
    - Implement overlay variant: semi-transparent overlay + spinner over
      children
    - Return `null` when `isLoading` is false (or just children for overlay)
    - Create barrel export
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]\* 5.3 Write property tests for DrawerLoading
    - **Property 2: DrawerLoading spinner label rendering**
    - **Property 3: DrawerLoading skeleton line count**
    - **Property 4: DrawerLoading off-state renders nothing**
    - **Validates: Requirements 2.1, 2.2, 2.4, 2.5**

- [x] 6. Implement DrawerAlert component
  - [x] 6.1 Create `interfaces/drawer-alert/drawer-alert.interface.ts` with
        `DrawerAlertProps` and `DrawerAlertVariant` types
    - Create barrel export and update `interfaces/index.ts`
    - _Requirements: 6.1, 6.3, 6.4_

  - [x] 6.2 Create `components/drawer-alert/drawer-alert.component.tsx`
    - Implement variant-based color scheme and icon mapping
      (info/success/warning/danger)
    - Render optional bold title above children
    - Render dismiss button when `dismissible` is true, calling `onDismiss` on
      click
    - Render `ScopedSlot` at `DRAWER_SLOTS.ALERT.BEFORE` and
      `DRAWER_SLOTS.ALERT.AFTER`
    - Create barrel export
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.8_

  - [ ]\* 6.3 Write property tests for DrawerAlert
    - **Property 7: DrawerAlert variant color and icon mapping**
    - **Property 8: DrawerAlert title rendering**
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 7. Modify DrawerFooter — add isLoading, startContent, endContent
  - [x] 7.1 Update `DrawerFooterProps` in
        `components/drawer-footer/drawer-footer.component.tsx` with `isLoading`,
        `startContent`, `endContent` props
    - _Requirements: 3.1, 3.2, 3.3, 5.5_

  - [x] 7.2 Implement layout logic in DrawerFooter
    - When `startContent`/`endContent` provided: three-zone layout with
      `justify-between`
    - When neither provided: preserve current flex row with gap
    - When `isLoading` is true: `pointer-events-none`, reduced opacity, spinner,
      `aria-busy="true"`
    - Replace `Slot` calls with `ScopedSlot` for scoped slot support
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.3, 5.4_

  - [ ]\* 7.3 Write property test for DrawerFooter aria-busy
    - **Property 5: DrawerFooter aria-busy reflects loading state**
    - **Validates: Requirements 3.3, 3.4**

- [x] 8. Modify DrawerHeader — add isLoading prop
  - [x] 8.1 Add `isLoading?: boolean` to `DrawerHeaderProps` in
        `interfaces/drawer-header/`
    - _Requirements: 4.4_

  - [x] 8.2 Update `DrawerHeader` component to render a small spinner adjacent
        to the title when `isLoading` is true
    - Close and back buttons remain fully interactive
    - Replace `Slot` calls with `ScopedSlot` for scoped slot support
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]\* 8.3 Write property test for DrawerHeader loading spinner
    - **Property 6: DrawerHeader loading spinner adjacent to title**
    - **Validates: Requirements 4.1, 4.3**

- [x] 9. Add slot positions to DrawerSection and DrawerDivider
  - [x] 9.1 Update `DrawerSection` to render `ScopedSlot` at
        `DRAWER_SLOTS.SECTION.BEFORE`, `AFTER`, `BEFORE_TITLE`, `AFTER_TITLE`
        positions
    - _Requirements: 7.1, 7.3, 7.4_

  - [x] 9.2 Update `DrawerDivider` to render `ScopedSlot` at
        `DRAWER_SLOTS.DIVIDER.BEFORE` and `AFTER` positions
    - _Requirements: 7.2, 7.5_

- [x] 10. Checkpoint — Verify all components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Wire up Drawer namespace and barrel exports
  - [x] 11.1 Update `components/drawer/drawer.component.tsx` to add `Content`,
        `Loading`, `Alert` to the Drawer namespace
    - Keep `Body` as deprecated alias pointing to `DrawerContent`
    - _Requirements: 1.1, 1.2, 2.6, 6.8_

  - [x] 11.2 Update `components/index.ts` barrel to export `DrawerContent`,
        `DrawerContentProps`, `DrawerLoading`, `DrawerLoadingProps`,
        `DrawerAlert`, `DrawerAlertProps`, `ScopedSlot`
    - _Requirements: 1.3, 2.7, 6.9_

  - [x] 11.3 Update `index.ts` (root barrel) to export all new components,
        hooks, interfaces, and the `useDrawerId` hook
    - _Requirements: 1.3, 2.7, 6.9, 8.6_

  - [ ]\* 11.4 Write unit tests for namespace structure and barrel exports
    - Verify `Drawer.Content`, `Drawer.Body`, `Drawer.Loading`, `Drawer.Alert`
      exist and reference correct components
    - Verify `DRAWER_SLOTS.CONTENT`, `DRAWER_SLOTS.BODY` alias,
      `DRAWER_SLOTS.ALERT`, `DRAWER_SLOTS.SECTION`, `DRAWER_SLOTS.DIVIDER` keys
      and values
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 6.6, 6.8, 7.1, 7.2_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document
- Unit tests validate specific examples and edge cases
- All new components use `ScopedSlot` instead of raw `Slot` to support
  drawer-ID-scoped slot names
