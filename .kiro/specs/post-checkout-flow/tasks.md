# Implementation Plan: Post-Checkout Flow

## Overview

Implement a state-machine-driven post-checkout flow that chains Order
Confirmation → Receipt Print → RFID Link → Experience Builder → Return to
Catalog. The core orchestrator is a `usePostCheckoutFlow` hook using
`useReducer`, integrated into `POSHomeContent`. New files: the hook, a receipt
content utility, and an RFID link prompt drawer. Modified files:
`OrderConfirmOverlay` and `pos-home.tsx`.

## Tasks

- [x] 1. Create `usePostCheckoutFlow` hook with reducer state machine
  - [x] 1.1 Define types (`FlowStep`, `FlowAction`, `FlowState`, `OrderData`)
        and the `STEP_SEQUENCE` array with `getNextStep` helper
    - Export all types for reuse by other components
    - Implement `flowReducer` as a named export for direct testing
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Implement the `usePostCheckoutFlow` hook that wraps `useReducer`
        with `flowReducer` and returns `{ state, dispatch }`
    - `isActive` is derived as `step !== 'idle'` inside the reducer
    - START sets `orderData` from payload and moves to `order_confirm`
    - ADVANCE/SKIP move to next step via `getNextStep`
    - SKIP_ALL and RESET return to `idle` with `orderData: null`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.3, 6.4_

  - [ ]\* 1.3 Write property tests for the flow reducer (fast-check)
    - **Property 1: State machine transitions follow the defined step sequence**
    - **Validates: Requirements 1.1, 1.2, 1.3, 3.5, 4.4, 5.5, 6.3**

  - [ ]\* 1.4 Write property test for isActive derivation (fast-check)
    - **Property 2: isActive reflects non-idle state**
    - **Validates: Requirements 1.4, 1.5**

  - [ ]\* 1.5 Write property test for SKIP_ALL behavior (fast-check)
    - **Property 3: SKIP_ALL from any active step returns to idle**
    - **Validates: Requirements 6.4**

- [x] 2. Create `buildReceiptContent` utility
  - [x] 2.1 Implement `buildReceiptContent(order: OrderData): string` in
        `apps/vite-template/src/utils/receipt-content.ts`
    - Generate HTML body with venue name, order ID, date/time, line items (name,
      qty, unit price), total, and barcode placeholder div
    - Use receipt CSS classes compatible with
      `PrintService.buildReceiptDocument`
    - _Requirements: 3.1, 7.1, 7.2, 7.3_

  - [ ]\* 2.2 Write property test for receipt content (fast-check)
    - **Property 4: Receipt content contains all required order fields**
    - **Validates: Requirements 3.1, 7.1, 7.3**

- [ ] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Modify `OrderConfirmOverlay` for flow integration
  - [x] 4.1 Add `onSkipAll` prop to `OrderConfirmOverlayProps`
    - Wire countdown expiry and dismiss to `onClose` (which now means "advance")
    - Add a "Continue" button that calls `onClose`
    - Add a "Skip All" link/button that calls `onSkipAll`
    - Keep existing Print/Email/Save action buttons
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.4_

- [x] 5. Create `RFIDLinkPrompt` drawer component
  - [x] 5.1 Implement `RFIDLinkPrompt` in
        `apps/vite-template/src/components/drawers/rfid-link-prompt.tsx`
    - Accept props: `tickets`, `cashierId`, `onClose`, `onSkip`,
      `onLinkComplete`
    - Internal state tracks per-ticket `TicketLinkState` (pending/linked,
      mediaType, rfidTag)
    - Render ticket list with status badges, media type selector
      (card/bracelet/hotel_card), RFID tag input
    - Validate no duplicate RFID tags within the batch; show inline error on
      duplicates
    - "Skip" button always visible; "Done" button appears when all tickets
      linked
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7, 6.1_

  - [ ]\* 5.2 Write property test for RFID link creation (fast-check)
    - **Property 5: RFID link creation preserves all input fields**
    - **Validates: Requirements 4.3**

  - [ ]\* 5.3 Write property test for duplicate RFID tag rejection (fast-check)
    - **Property 6: No duplicate RFID tags within a linking batch**
    - **Validates: Requirements 4.7**

- [ ] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Integrate flow into `POSHomeContent` in `pos-home.tsx`
  - [x] 7.1 Wire `usePostCheckoutFlow` hook and replace `handleCompleteOrder`
        logic
    - Remove standalone `orderConfirmOpen` state and
      `lastOrderId`/`lastTotal`/`lastItemCount` state
    - Dispatch `START` with `OrderData` payload from cart items on order
      completion
    - Disable checkout button when `flow.state.isActive` is true
    - _Requirements: 1.1, 1.5_

  - [x] 7.2 Add receipt print `useEffect` watcher for the `receipt_print` step
    - Call `buildReceiptContent` then `PrintService.printReceipt`
    - Show print status toast (`Printing…` → `Printed ✓`) via local state
    - Auto-advance after brief delay
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 7.3 Add RFID link `useEffect` watcher to push `RFIDLinkPrompt` into
        drawer stack
    - Push drawer when step is `rfid_link`, pop and dispatch on close/skip
    - _Requirements: 4.1, 4.4_

  - [x] 7.4 Add Experience Builder `useEffect` watcher to push
        `ExperienceBuilderDrawer` into drawer stack
    - Push drawer when step is `experience_builder`, pop and dispatch on
      close/skip
    - Wire `onAddToCart` to create new cart with upsell items
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.2_

  - [x] 7.5 Render `OrderConfirmOverlay` driven by flow state
    - Pass `flow.state.step === 'order_confirm'` as `open`
    - Wire `onClose` to `dispatch({ type: 'ADVANCE' })` and `onSkipAll` to
      `dispatch({ type: 'SKIP_ALL' })`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the pure `flowReducer`, `buildReceiptContent`, and
  RFID link logic using fast-check
- Unit tests validate component rendering and interaction behavior

## Phase 2: Media Lookup & Missing Dock Actions

_Based on reference POS system (Injazat) analysis — features identified from
screenshots._

- [x] 9. Create Media Lookup drawer
  - [x] 9.1 Create `MediaLookupDrawer` in
        `apps/vite-template/src/components/drawers/media-lookup-drawer.tsx`
    - Search by RFID tag number, ticket ID, or barcode scan
    - Display media status (Active / Blocked / Expired)
    - Show encoding info: workstation, user, date, transaction #
    - Show usage recap: first usage, peak entry, same-day reentry, exit count,
      crossentry, products redeemed, bonus entries, balance
    - Usage log table: date, redemption point, location, fulfilled item,
      identifier
    - Actions toolbar: Block/Unblock media, Add to Cart (re-sell), Purge (clear
      media)
    - Use `DrawerHeader` with default variant
    - Mock data for demo; real implementation would call an API

  - [x] 9.2 Wire Media Lookup into dock actions in `pos-home.tsx`
    - Add "Media" action to catalog dock with CreditCard or NFC icon
    - Push `MediaLookupDrawer` into drawer stack on click

- [x] 10. Create Void/Refund drawer
  - [x] 10.1 Create `VoidRefundDrawer` in
        `apps/vite-template/src/components/drawers/void-refund-drawer.tsx`
    - Search by order ID or scan receipt barcode
    - Display order summary with line items
    - Select items to void/refund (partial or full)
    - Refund method selection (original payment method, cash, store credit)
    - Supervisor authorization prompt (PIN or badge scan)
    - Confirmation with refund amount preview

  - [x] 10.2 Wire Void/Refund into cart dock actions in `pos-home.tsx`
    - Add "Void" action to cart dock

- [-] 11. Wire existing components into dock actions
  - [x] 11.1 Add "Tickets" action to dock — opens order history panel
    - Reuse existing `OrderHistory` component from
      `apps/vite-template/src/components/shared/order-history.tsx`
    - Push as drawer into stack

  - [ ] 11.2 Add "F&B" action to dock — navigates to F&B catalog
    - Links to existing `fnb-home.tsx` page or opens F&B category filter in
      product grid

  - [x] 11.3 Add "Experience" action to dock — opens Experience Builder drawer
    - Wire existing `ExperienceBuilderDrawer` as a standalone dock action
      (separate from post-checkout flow)

  - [ ] 11.4 Add "Switch User" action to dock — opens user switch flow
    - Quick cashier switch without full logout
    - PIN-based re-authentication

  - [ ] 11.5 Add "End Shift" / "Final Close" action to dock
    - End-of-day cash reconciliation summary
    - Print Z-report
    - Extends existing ShiftPanel with close-out flow

- [ ] 12. Final checkpoint — Ensure all new dock actions work
  - Verify all new actions push correct drawers
  - Verify ESC/close works on all new drawers
  - Verify dock action labels and icons are consistent
