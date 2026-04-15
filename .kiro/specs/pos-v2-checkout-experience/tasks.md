# Implementation Plan: POS v2 Checkout Experience

## Overview

This plan implements 22 requirements across the MNGO POS v2 checkout experience.
Tasks are grouped by functional area and ordered so each builds on the previous.
All new UI surfaces use the existing `DrawerStackProvider` push/pop/update/clear
pattern. The `@cart/react` package manages cart state; new features extend cart
item metadata and checkout drawer state. The codebase is TypeScript React with
Tailwind CSS, using Vite.

## Tasks

- [x] 1. Extend type definitions and shared models
  - [x] 1.1 Add new types to `pos.types.ts`
    - Add `TicketTag`, `InventoryPool`, `PoolTransferRecord`, `RFIDLink`,
      `B2BAccount`, `B2BPendingOrder`, `CartRule`, `PriceRule`, `CartMessage`,
      `ExtendedCartItemMetadata`, `GiftVoucherState`, `WalletPaymentMethod`
      interfaces
    - Extend `PaymentSplit` with `foreignCurrency`, `foreignAmount`,
      `exchangeRate`, `voucherSerial`, `walletId` fields
    - Extend `CartItem` metadata type with `tags`, `b2bAccountId`, `b2bOrderId`,
      `b2bNegotiatedPrice`, `b2bContractLimits` fields
    - _Requirements: 8, 9, 10, 16, 17, 18, 19, 20, 22_

  - [x] 1.2 Extend `TerminalSettings` with `printMode` option
    - Add `printMode: "silent" | "preview"` setting to
      `apps/vite-template/src/settings/terminal.settings.ts`
    - _Requirements: 13_

- [x] 2. Pre-checkout flow fixes (EventDetailDrawer, ProductGrid, DrawerConfig)
  - [x] 2.1 Reorder EventDetailDrawer body sections for date/time before seats
    - In `event-detail-drawer.tsx`, ensure the Date & Time CTA section renders
      above the Seat Map CTA section in the scrollable body for timed seated
      events
    - Disable seat selection button and show helper message when no timeslot is
      selected for timed seated events
    - Verify the `update` call in `pos-home.tsx` passes
      `selectedTimeSlotExternal` to enable seat button after timeslot
      confirmation
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Ensure seat state reflection on EventDetailDrawer
    - Verify the seat selection button displays selected seat identifiers and
      total seat price after `SeatMapDrawer.onConfirmSeats` via the `update`
      operation
    - Ensure the button label changes from "Choose Seats" / "Interactive seat
      map" to the seat summary within 100ms of the SeatMapDrawer closing
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.3 Verify date/time drawer update behavior
    - Confirm `DateTimePickerDrawer` on confirm calls `pop()` +
      `update("event-detail", ...)` instead of pushing a new EventDetailDrawer
    - Ensure the date/time button on EventDetailDrawer shows the selected date
      and time in place of "Choose Date & Time"
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 2.4 Refactor ProductGrid to responsive auto-fill layout
    - Replace current Tailwind grid classes in `product-grid.tsx` with CSS
      `grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))` and
      `gap: 12px`
    - Ensure tiles reflow within 100ms when the catalog panel is resized via the
      drag handle (already has ResizeObserver)
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 2.5 Implement drawer dismiss button consistency
    - Extend `DrawerConfig` type (in `@abdokouta/react-ui`) with
      `showCloseButton?: boolean` property (default `true`)
    - Update `DrawerHeader` component to conditionally render the X button based
      on `showCloseButton`
    - In `pos-layout.tsx`, push ProfileDrawer, NotificationPanel, ShiftPanel
      with `showCloseButton: false`
    - Ensure ESC key dismissal works for all drawers regardless of X button
      config
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 2.6 Consolidate collapsible details section in EventDetailDrawer
    - Move location details, operating hours, languages, group size,
      accessibility, what-to-bring into the existing collapsible "Details,
      Includes & Rules" section
    - Ensure the section is collapsed by default (`detailsOpen` starts `false`)
    - Ensure toggle animation completes within 200ms
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]\* 2.7 Write unit tests for pre-checkout flow fixes
    - Test EventDetailDrawer renders Date/Time CTA above Seat Map CTA for timed
      seated events
    - Test seat button is disabled when no timeslot selected
    - Test ProductGrid uses auto-fill grid layout
    - Test collapsible section is collapsed by default
    - _Requirements: 1, 2, 3, 4, 5, 6_

- [x] 3. Checkpoint — Pre-checkout flow
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Payment system enhancements (CheckoutDrawer)
  - [x] 4.1 Verify and polish split payment calculator
    - Review existing `CheckoutDrawer` split payment implementation in
      `checkout-drawer.tsx`
    - Ensure total + tip = remaining balance initialization
    - Ensure cash overpayment shows change due, non-cash capped at remaining
    - Ensure confirm button enables when `isFullyPaid`
    - Ensure remove split recalculates remaining
    - Ensure each split shows method icon, label, amount, remove button
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 4.2 Implement foreign currency payment in CheckoutDrawer
    - Add a currency selector dropdown above the keypad amount display (uses
      `CURRENCIES` from `pos-context.tsx`)
    - When foreign currency selected, display remaining balance converted using
      exchange rate
    - On apply, convert foreign amount back to base currency (AED) for the split
      record
    - Display both foreign and base currency amounts on the split record (e.g.,
      "USD $50.00 (AED 183.62)")
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 4.3 Implement customer wallet payment method
    - Add "Wallet" payment method to the payment grid, visible only when a
      customer is linked to the cart
    - Pre-fill keypad with `Math.min(remaining, walletBalance)` on selection
    - Validate entered amount ≤ wallet balance; show error toast if exceeded
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 4.4 Implement gift voucher payment method
    - Add "Gift Voucher" to the payment method grid
    - On selection, show serial number input field (supports barcode scanner
      keyboard input)
    - On submit, validate voucher async; show remaining value if valid, error if
      invalid/redeemed
    - Auto-apply `Math.min(voucherValue, remaining)` as a payment split
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]\* 4.5 Write unit tests for payment enhancements
    - Test foreign currency conversion and split record display
    - Test wallet payment visibility toggle based on customer linkage
    - Test wallet amount validation
    - Test gift voucher validation flow (valid, invalid, redeemed)
    - _Requirements: 8, 9, 10_

- [x] 5. Checkpoint — Payment system
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Cart operations — Split Cart
  - [x] 6.1 Create `SplitCartDrawer` component
    - Create `apps/vite-template/src/components/drawers/split-cart-drawer.tsx`
    - Render all cart items with checkboxes for selection
    - Disable confirm when zero items selected
    - Show warning and prevent operation when all items selected (would leave
      original empty)
    - On confirm, call `onConfirmSplit(selectedItemIds)`
    - _Requirements: 11.2, 11.3, 11.5, 11.6_

  - [x] 6.2 Wire SplitCartDrawer into POSHomeContent and SmartDock
    - Add "Split" action to SmartDock catalog/cart actions when
      `cartItems.length >= 2`
    - On confirm: `createCart()` → move selected items to new cart → set new
      cart as active
    - Push `SplitCartDrawer` onto drawer stack from `pos-home.tsx`
    - _Requirements: 11.1, 11.3, 11.4_

  - [ ]\* 6.3 Write unit tests for split cart
    - Test SplitCartDrawer disables confirm with zero selection
    - Test SplitCartDrawer prevents splitting all items
    - Test split creates new cart with selected items
    - _Requirements: 11_

- [ ] 7. Post-payment UX (OrderConfirmOverlay, Printing, RFID)
  - [ ] 7.1 Refactor OrderConfirmOverlay with extended props
    - Extend `OrderConfirmOverlayProps` with `paymentSplits`, `timestamp`,
      `onPrintReceipt`, `onSendETicket`, `onNewOrder`, `rfidEligible`,
      `onLinkRFID`
    - Display payment method summary (list of splits with method + amount)
    - Display timestamp
    - Replace PRINT/EMAIL/SAVE buttons with "Print Receipt", "Send E-Ticket",
      "New Order"
    - "New Order" creates a fresh cart via `createCart()`
    - Change auto-dismiss from 15s to 30s
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 7.2 Create print service utility
    - Create `apps/vite-template/src/utils/print-service.ts`
    - Implement `printReceipt(orderId, content)` — silent print via hidden
      iframe with print-optimized CSS, fallback to `window.print()`
    - Implement `isSilentPrintSupported()` check
    - Read `printMode` from `TerminalSettings` to choose silent vs preview
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ] 7.3 Implement RFID linking in OrderConfirmOverlay
    - Add RFID linking phase after payment when tickets support RFID
      (`rfidEligible` prop)
    - Listen for `keydown` events for RFID reader input (keyboard emulation)
    - Associate scanned RFID tag with ticket at `currentIndex`, advance to next
    - 15s timeout per scan → show error + retry/skip options
    - Skip proceeds to standard post-payment state
    - Support linking multiple tags to multiple tickets (one per ticket)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ] 7.4 Wire refactored OrderConfirmOverlay into POSHomeContent
    - Pass `paymentSplits`, `timestamp`, `onPrintReceipt`, `onSendETicket`,
      `onNewOrder`, `rfidEligible`, `onLinkRFID` from `handleCompleteOrder` in
      `pos-home.tsx`
    - Connect print service to "Print Receipt" action
    - _Requirements: 12, 13, 14_

  - [ ]\* 7.5 Write unit tests for post-payment UX
    - Test OrderConfirmOverlay displays payment splits and timestamp
    - Test auto-dismiss at 30s
    - Test RFID linking flow (scan, timeout, skip)
    - Test print service silent/preview mode selection
    - _Requirements: 12, 13, 14_

- [ ] 8. Checkpoint — Post-payment UX
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Experience Builder
  - [x] 9.1 Create `ExperienceBuilderDrawer` component
    - Create
      `apps/vite-template/src/components/drawers/experience-builder-drawer.tsx`
    - Implement 3-step wizard: Step 1 (category grid), Step 2 (filtered event
      list), Step 3 (ticket types with quantity steppers)
    - Use `SubViewNavigator` from `@abdokouta/react-ui` for step transitions
      within the drawer
    - Show running cart summary as sticky footer with "Checkout" button
    - Support "Back" navigation at each step preserving selections from other
      steps
    - On confirm in Step 3, add items to cart and return to Step 1 for
      additional selections
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

  - [ ] 9.2 Wire ExperienceBuilderDrawer into POSHomeContent
    - Add "Builder" action to SmartDock catalog actions
    - Push `ExperienceBuilderDrawer` onto drawer stack from `pos-home.tsx`
    - Pass `categories`, `events`, `onAddToCart`, `onCheckout`, `formatPrice`
    - _Requirements: 15.1_

  - [ ]\* 9.3 Write unit tests for Experience Builder
    - Test 3-step navigation flow
    - Test back navigation preserves selections
    - Test items added to cart on Step 3 confirm
    - _Requirements: 15_

- [ ] 10. Promotions and cart intelligence
  - [x] 10.1 Create promotion engine utility
    - Create `apps/vite-template/src/utils/promotion-engine.ts`
    - Implement `PromotionEngine.evaluate(cartItems)` returning
      `appliedCartRules`, `appliedPriceRules`, `suggestions`
    - Support `buy_x_get_y`, `bundle_discount`, `threshold_discount` cart rules
    - Support `quantity_discount`, `member_discount`, `time_discount`,
      `channel_discount` price rules
    - Generate "nearly qualified" suggestions (e.g., "Add 1 more for Buy 3 Get 1
      Free")
    - _Requirements: 16.1, 16.2, 16.4_

  - [ ] 10.2 Integrate promotions display into POSCartPanel
    - Show promotion badges on affected cart items (inline, next to price)
    - Show discounted price with strikethrough original for price rule matches
    - Add promotions summary section above cart total
    - _Requirements: 16.1, 16.2, 16.3_

  - [x] 10.3 Create CartMessageList component and integrate into POSCartPanel
    - Create `CartMessageList` component rendering between item list and totals
      in `pos-cart-panel.tsx`
    - Support message types: promotion, upsell, warning, info
    - Render action buttons ("Apply", "Add Item", "Upgrade") per message
    - Track dismissed messages in a `Set<string>` scoped to the cart session
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [ ]\* 10.4 Write unit tests for promotions and cart messages
    - Test promotion engine evaluates cart rules correctly
    - Test "nearly qualified" suggestion generation
    - Test CartMessageList renders and dismisses messages
    - _Requirements: 16, 17_

- [ ] 11. Checkpoint — Promotions and cart intelligence
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. B2B account loading
  - [x] 12.1 Create `B2BAccountDrawer` component
    - Create `apps/vite-template/src/components/drawers/b2b-account-drawer.tsx`
    - Implement search field for B2B accounts by name, ID, or reference
    - Display account's pending orders with items, quantities, pre-negotiated
      prices
    - On order selection, call `onLoadOrder(items, b2bAccount)` to load into
      cart
    - _Requirements: 18.2, 18.3, 18.4_

  - [x] 12.2 Wire B2BAccountDrawer into POSHomeContent and SmartDock
    - Add "Load B2B" action to SmartDock catalog actions
    - Push `B2BAccountDrawer` onto drawer stack from `pos-home.tsx`
    - On load: populate cart with B2B items at negotiated pricing
    - _Requirements: 18.1_

  - [ ] 12.3 Enforce B2B contract limits in cart panel
    - When B2B order is loaded, allow quantity adjustment within
      `b2bContractLimits.min` / `b2bContractLimits.max` in `POSCartPanel`
    - Show B2B credit balance as payment method in `CheckoutDrawer` when B2B
      items are in cart
    - _Requirements: 18.5, 18.6_

  - [ ]\* 12.4 Write unit tests for B2B account loading
    - Test B2B search and order loading
    - Test contract limit enforcement on quantity changes
    - _Requirements: 18_

- [ ] 13. Ticket tags
  - [x] 13.1 Add ticket tag UI to EventDetailDrawer
    - Display available tags as selectable chips below each ticket type row in
      `event-detail-drawer.tsx`
    - Store selected tag IDs in cart item metadata when adding to cart
    - _Requirements: 19.1, 19.2_

  - [ ] 13.2 Display ticket tags in POSCartPanel
    - Show applied tags as small colored badges on each cart item row in
      `pos-cart-panel.tsx`
    - Persist tag associations with the ticket record on purchase
    - _Requirements: 19.3, 19.4_

  - [ ]\* 13.3 Write unit tests for ticket tags
    - Test tag selection in EventDetailDrawer
    - Test tag badges render in cart panel
    - _Requirements: 19_

- [ ] 14. Pool management (Inventory Pools, Performance, Transfer)
  - [x] 14.1 Create `PoolMeter` component
    - Create `apps/vite-template/src/components/shared/pool-meter.tsx`
    - Render horizontal bar with fill percentage, color-coded by pool type (B2B
      blue, B2C green, Membership purple, POS orange)
    - Show numeric label with remaining units out of total allocation
    - Show "Full" indicator when `remaining === 0`
    - _Requirements: 20.2, 20.3_

  - [ ] 14.2 Integrate PoolMeter into DateTimePickerDrawer
    - Below each timeslot row in `date-time-picker-drawer.tsx`, render
      `PoolMeter` bars for configured pools
    - Prevent timeslot selection from a pool when its remaining capacity is zero
    - Deduct capacity from appropriate pool based on POS sales channel context
      on selection
    - _Requirements: 20.1, 20.3, 20.4_

  - [x] 14.3 Create `PoolPerformanceDrawer` component
    - Create
      `apps/vite-template/src/components/drawers/pool-performance-drawer.tsx`
    - Display utilization %, sell-through rate, remaining capacity per pool
    - Support filtering by date range, event, pool type
    - Auto-refresh metrics every 60 seconds
    - Include "Transfer" action button (restricted to supervisor role)
    - _Requirements: 21.1, 21.2, 21.3, 21.4_

  - [x] 14.4 Create `PoolTransferDrawer` component
    - Create
      `apps/vite-template/src/components/drawers/pool-transfer-drawer.tsx`
    - Source pool selector, destination pool selector, quantity input
    - Validate quantity ≤ source pool remaining; show error if exceeded
    - On confirm, update both pool meters immediately
    - Log transfer with supervisor identity, timestamp, pools, quantity
    - Restrict access to supervisor permissions via `useGetIdentity()` role
      check
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

  - [ ] 14.5 Wire pool drawers into POSHomeContent and SmartDock
    - Add "Pools" action to SmartDock
    - Push `PoolPerformanceDrawer` onto drawer stack
    - From PoolPerformanceDrawer, push `PoolTransferDrawer` for transfer action
    - _Requirements: 21.1, 22.1_

  - [ ]\* 14.6 Write unit tests for pool management
    - Test PoolMeter renders correct fill and "Full" state
    - Test PoolTransferDrawer validates quantity against source pool
    - Test supervisor permission check on transfer
    - _Requirements: 20, 21, 22_

- [ ] 15. Final checkpoint — Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- All new drawers follow the existing `push`/`pop`/`update`/`clear` pattern from
  `@abdokouta/react-ui`
- The `@cart/react` package manages cart state; new features extend metadata,
  not the core cart API
- All code is TypeScript React with Tailwind CSS
