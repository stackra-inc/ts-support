# Requirements Document

## Introduction

This document defines the requirements for the MNGO POS v2 Checkout Experience —
a comprehensive overhaul of the point-of-sale checkout flow for venue management
(theme parks, museums, theatres, arenas). The scope covers core checkout flow
fixes, payment system enhancements (split payment, foreign currency, wallet,
gift vouchers), cart operations (split cart), post-payment UX (success page,
printing, RFID linking), an experience builder wizard, promotions and cart
intelligence, B2B account loading, ticket tagging, and pool/capacity management.

The POS uses a drawer stack UI pattern (push/pop/replace/clear), a split-panel
layout (catalog left, cart right), and integrates an AI Sidekick. It is
multi-tenant, multi-currency, and multi-language.

## Glossary

- **POS**: Point of Sale — the cashier-facing terminal application for on-site
  ticket and product sales.
- **Drawer_Stack**: The stacked drawer UI system (`DrawerStackProvider`) that
  manages push/pop/replace/clear operations for overlay panels.
- **Cart_Panel**: The right-side panel in the POS split layout that displays the
  active cart items, totals, and actions.
- **Catalog_Panel**: The left-side panel in the POS split layout that displays
  the product grid, category rail, and event tiles.
- **Event_Detail_Drawer**: The drawer that opens when a cashier selects an
  event, showing ticket types, date/time selection, seat selection, and
  add-to-cart actions.
- **Date_Time_Picker_Drawer**: The drawer for selecting a date and timeslot for
  a timed event.
- **Seat_Map_Drawer**: The drawer for interactive seat selection on seated
  events.
- **Checkout_Drawer**: The drawer that handles the payment flow including order
  review, tip, payment method selection, split payment, and receipt options.
- **Order_Confirm_Overlay**: The success/confirmation overlay shown after a
  completed payment.
- **Product_Grid**: The grid of event/product tiles in the catalog panel.
- **Smart_Dock**: The context-aware floating action bar at the bottom of the
  POS.
- **Split_Payment**: A payment where the total is covered by multiple payment
  methods with a running balance.
- **Foreign_Currency_Payment**: A payment where the cashier accepts a non-base
  currency, with exchange rate conversion.
- **Customer_Wallet**: A stored-value balance associated with a customer
  account, usable as a payment method.
- **Gift_Voucher**: A prepaid voucher identified by serial number, redeemable as
  a payment method.
- **Split_Cart**: The operation of dividing items from one cart into two
  separate carts.
- **Merge_Cart**: The existing operation of combining two carts into one.
- **RFID_Media**: Physical media (card, bracelet, hotel card) that can be linked
  to purchased tickets via RFID scan.
- **Experience_Builder**: A stepped wizard flow for browsing categories, events,
  and tickets before adding to cart.
- **Cart_Rule**: A promotion rule that evaluates cart contents and applies
  discounts or offers (e.g., buy 3 get 1 free).
- **Price_Rule**: A promotion rule that modifies individual item pricing based
  on conditions.
- **Cart_Message**: An interactive message displayed in the cart for promotions,
  upsells, or warnings.
- **B2B_Account**: A business account (school, tour operator) with pre-booked
  bulk orders and credit.
- **Ticket_Tag**: A metadata label attached to a ticket for categorization,
  filtering, and reporting.
- **Inventory_Pool**: A capacity allocation bucket assigned to a sales channel
  (B2B, B2C, Membership).
- **Pool_Meter**: A visual component showing remaining capacity within an
  inventory pool.
- **Pool_Transfer**: The operation of moving capacity units from one inventory
  pool to another.
- **Cashier**: The human operator using the POS terminal.
- **Supervisor**: A user with elevated permissions who can approve restricted
  actions.

## Requirements

### Requirement 1: Date/Time Selection Before Seat Selection

**User Story:** As a cashier, I want to select the date and timeslot before
choosing seats, so that seat availability is shown for the correct session.

#### Acceptance Criteria

1. WHEN a cashier opens the Event_Detail_Drawer for a timed seated event, THE
   Event_Detail_Drawer SHALL render the Date_Time_Picker section above the
   Seat_Map section in the scrollable body.
2. WHILE no timeslot is selected for a timed seated event, THE
   Event_Detail_Drawer SHALL disable the seat selection button and display a
   message indicating that a date and time must be selected first.
3. WHEN a cashier confirms a timeslot in the Date_Time_Picker_Drawer, THE
   Event_Detail_Drawer SHALL enable the seat selection button and pass the
   selected timeslot context to the Seat_Map_Drawer.

### Requirement 2: Seat Selection Drawer State Reflection

**User Story:** As a cashier, I want the seat selection button to show my
confirmed seats after selection, so that I can verify my choices without
reopening the drawer.

#### Acceptance Criteria

1. WHEN a cashier confirms seats in the Seat_Map_Drawer, THE Event_Detail_Drawer
   SHALL update the seat selection button to display the selected seat
   identifiers and total seat price.
2. WHEN a cashier confirms seats in the Seat_Map_Drawer, THE Event_Detail_Drawer
   SHALL replace the "Choose Seats" label with the selected seat summary within
   100ms of the Seat_Map_Drawer closing.
3. WHEN no seats are selected, THE Event_Detail_Drawer SHALL display the seat
   selection button with the label "Choose Seats" and the subtitle "Interactive
   seat map".

### Requirement 3: Date/Time Drawer Update Behavior

**User Story:** As a cashier, I want the date/time button to update in place
after confirming a selection, so that I do not see a redundant new drawer.

#### Acceptance Criteria

1. WHEN a cashier confirms a date and timeslot in the Date_Time_Picker_Drawer,
   THE Drawer_Stack SHALL pop the Date_Time_Picker_Drawer and update the
   underlying Event_Detail_Drawer via the `update` operation.
2. WHEN a cashier confirms a date and timeslot, THE Event_Detail_Drawer SHALL
   display the selected date and time on the date/time button in place of the
   "Choose Date & Time" label.
3. THE Drawer_Stack SHALL NOT push a new Event_Detail_Drawer instance when the
   Date_Time_Picker_Drawer confirms a selection.

### Requirement 4: Product Grid Layout

**User Story:** As a cashier, I want the product grid to use the full available
width with proper spacing, so that tiles are readable and the layout does not
feel cramped.

#### Acceptance Criteria

1. THE Product_Grid SHALL distribute event tiles across the available width of
   the Catalog_Panel using a responsive grid that adjusts column count based on
   panel width.
2. THE Product_Grid SHALL maintain a minimum tile width of 180px and a
   consistent gap of 12px between tiles.
3. WHEN the Catalog_Panel is resized via the drag handle, THE Product_Grid SHALL
   reflow tiles within 100ms to fill the new available width.

### Requirement 5: Drawer Dismiss Button Consistency

**User Story:** As a cashier, I want consistent dismiss behavior across all
drawers, so that I can predict how to close any drawer.

#### Acceptance Criteria

1. THE Drawer_Stack SHALL support a configurable `dismissible` property per
   drawer instance that controls whether an X button is rendered.
2. WHEN a drawer is configured as dismissible, THE DrawerHeader component SHALL
   render an X close button in the top-right corner.
3. THE POS SHALL apply the following dismiss rules: the Profile_Drawer,
   Notification_Panel, and Shift_Panel SHALL be dismissible via ESC key only (no
   X button); the Event_Detail_Drawer, Checkout_Drawer, Seat_Map_Drawer, and
   Date_Time_Picker_Drawer SHALL render both an X button and support ESC key
   dismissal.
4. THE Drawer_Stack SHALL allow all drawers to be dismissed via the ESC key
   regardless of the X button configuration.

### Requirement 6: Collapsible Details Section

**User Story:** As a cashier, I want location, hours, includes, and rules to be
in a collapsible section, so that the ticket selection area is immediately
visible without scrolling.

#### Acceptance Criteria

1. THE Event_Detail_Drawer SHALL group location details, operating hours,
   languages, group size, accessibility info, what-to-bring, description,
   includes, and restrictions into a single collapsible section labeled
   "Details, Includes & Rules".
2. WHEN the Event_Detail_Drawer opens, THE collapsible details section SHALL be
   collapsed by default.
3. WHEN a cashier taps the collapsible section header, THE Event_Detail_Drawer
   SHALL toggle the section open or closed with a slide animation completing
   within 200ms.

### Requirement 7: Split Payment Calculator

**User Story:** As a cashier, I want to split a payment across multiple methods
with a running balance, so that I can handle customers paying with a combination
of card, cash, and other methods.

#### Acceptance Criteria

1. WHEN a cashier opens the Checkout_Drawer, THE Checkout_Drawer SHALL display
   the total amount due and a "remaining" balance initialized to the total
   (including tip).
2. WHEN a cashier selects a payment method and enters an amount via the keypad,
   THE Checkout_Drawer SHALL add a payment split record and reduce the remaining
   balance by the entered amount.
3. WHEN the cashier adds a cash payment exceeding the remaining balance, THE
   Checkout_Drawer SHALL accept the overpayment and display the change due
   amount.
4. WHEN the cashier adds a non-cash payment, THE Checkout_Drawer SHALL cap the
   entered amount at the remaining balance.
5. WHEN the sum of all payment splits equals or exceeds the total, THE
   Checkout_Drawer SHALL enable the "Confirm Payment" button.
6. WHEN a cashier removes a payment split, THE Checkout_Drawer SHALL recalculate
   the remaining balance by subtracting all remaining splits from the total.
7. THE Checkout_Drawer SHALL display each applied payment split with its method
   icon, label, and amount, along with a remove button.

### Requirement 8: Foreign Currency Payment

**User Story:** As a cashier, I want to accept payment in a foreign currency
with automatic exchange rate conversion, so that I can serve international
customers.

#### Acceptance Criteria

1. WHEN a cashier selects a payment method in the Checkout_Drawer, THE
   Checkout_Drawer SHALL offer a currency selector showing all currencies
   defined in the POS context with their exchange rates.
2. WHEN a cashier selects a foreign currency, THE Checkout_Drawer SHALL display
   the remaining balance converted to the selected currency using the exchange
   rate from the POS context.
3. WHEN a cashier enters an amount in a foreign currency, THE Checkout_Drawer
   SHALL convert the entered amount back to the base currency (AED) and apply it
   as a payment split in the base currency.
4. THE Checkout_Drawer SHALL display both the foreign currency amount entered
   and the base currency equivalent on the payment split record.

### Requirement 9: Customer Wallet Payment

**User Story:** As a cashier, I want to use a linked customer's wallet balance
as a payment method, so that customers can pay from their stored value.

#### Acceptance Criteria

1. WHEN a customer is linked to the active cart, THE Checkout_Drawer SHALL
   display a "Wallet" payment method showing the customer's available wallet
   balance and credit.
2. WHILE no customer is linked to the active cart, THE Checkout_Drawer SHALL NOT
   display the Wallet payment method.
3. WHEN a cashier selects the Wallet payment method, THE Checkout_Drawer SHALL
   pre-fill the keypad with the lesser of the remaining balance and the
   available wallet balance.
4. WHEN a cashier applies a wallet payment, THE Checkout_Drawer SHALL validate
   that the entered amount does not exceed the customer's available wallet
   balance.
5. IF a cashier enters a wallet payment amount exceeding the available balance,
   THEN THE Checkout_Drawer SHALL display an error message and prevent the split
   from being added.

### Requirement 10: Gift Voucher Payment

**User Story:** As a cashier, I want to accept gift voucher serial numbers as a
payment method, so that customers can redeem prepaid vouchers.

#### Acceptance Criteria

1. THE Checkout_Drawer SHALL include a "Gift Voucher" payment method in the
   payment method grid.
2. WHEN a cashier selects the Gift Voucher method, THE Checkout_Drawer SHALL
   display an input field for scanning or manually entering a voucher serial
   number.
3. WHEN a cashier submits a voucher serial number, THE Checkout_Drawer SHALL
   validate the voucher and display the voucher's remaining value.
4. IF the voucher serial number is invalid or already fully redeemed, THEN THE
   Checkout_Drawer SHALL display a descriptive error message and prevent the
   split from being added.
5. WHEN a valid voucher is applied, THE Checkout_Drawer SHALL add a payment
   split for the lesser of the voucher's remaining value and the cart's
   remaining balance.

### Requirement 11: Split Cart

**User Story:** As a cashier, I want to split items from one cart into two
separate carts, so that customers can divide an order between themselves.

#### Acceptance Criteria

1. THE Smart_Dock SHALL include a "Split" action button when the active cart
   contains two or more items.
2. WHEN a cashier activates the split cart action, THE POS SHALL open a
   Split_Cart_Drawer showing all items in the current cart with checkboxes.
3. WHEN a cashier selects items and confirms the split, THE POS SHALL create a
   new cart containing the selected items and remove those items from the
   original cart.
4. WHEN a split is confirmed, THE POS SHALL set the newly created cart as the
   active cart.
5. IF a cashier attempts to split with zero items selected, THEN THE
   Split_Cart_Drawer SHALL disable the confirm button.
6. IF a cashier attempts to split all items (leaving the original cart empty),
   THEN THE Split_Cart_Drawer SHALL display a warning and prevent the operation.

### Requirement 12: Success Page Refactor

**User Story:** As a cashier, I want a clear and informative confirmation screen
after payment, so that I can quickly verify the order and proceed to the next
customer.

#### Acceptance Criteria

1. WHEN a payment is completed, THE Order_Confirm_Overlay SHALL display the
   order ID, total paid, number of items, payment method summary, and a
   timestamp.
2. THE Order_Confirm_Overlay SHALL provide action buttons for "Print Receipt",
   "Send E-Ticket", and "New Order".
3. WHEN a cashier clicks "New Order", THE Order_Confirm_Overlay SHALL close and
   the POS SHALL activate a fresh empty cart.
4. THE Order_Confirm_Overlay SHALL auto-dismiss after 30 seconds if no action is
   taken, returning the cashier to the POS home with a fresh cart.

### Requirement 13: Printing UX

**User Story:** As a cashier, I want a streamlined printing experience without
browser prompts, so that receipt and ticket printing does not interrupt my
workflow.

#### Acceptance Criteria

1. WHEN the receipt option is set to "print" and payment is completed, THE POS
   SHALL attempt silent printing using the Web Print API without displaying a
   browser print dialog.
2. IF silent printing is not supported by the browser, THEN THE POS SHALL fall
   back to the browser's native print dialog with a pre-formatted
   print-optimized layout.
3. THE POS SHALL provide a print preview toggle in the terminal settings that
   allows the cashier to choose between silent print and print preview modes.
4. WHEN a cashier clicks "Print Receipt" on the Order_Confirm_Overlay, THE POS
   SHALL print the receipt for the most recent completed order using the
   configured print mode.

### Requirement 14: RFID Linking Post-Checkout

**User Story:** As a cashier, I want to link purchased tickets to a customer's
RFID media after checkout, so that the customer can use their physical card or
bracelet for access.

#### Acceptance Criteria

1. WHEN a payment is completed and the purchased tickets support RFID media, THE
   Order_Confirm_Overlay SHALL display an "Link RFID" prompt with a scan
   instruction.
2. WHEN a cashier scans an RFID tag (card, bracelet, or hotel card), THE POS
   SHALL associate the scanned RFID identifier with the purchased tickets.
3. IF the RFID scan fails or times out after 15 seconds, THEN THE POS SHALL
   display an error message and allow the cashier to retry or skip the RFID
   linking step.
4. WHEN a cashier skips RFID linking, THE Order_Confirm_Overlay SHALL proceed to
   the standard post-payment state without blocking.
5. THE POS SHALL support linking multiple RFID tags to multiple tickets within
   the same order (one tag per ticket).

### Requirement 15: Experience Builder Flow

**User Story:** As a cashier, I want a stepped builder to browse categories,
events, and tickets, so that I can guide customers through building a complete
experience before adding to cart.

#### Acceptance Criteria

1. THE POS SHALL provide an "Experience Builder" entry point accessible from the
   Catalog_Panel or Smart_Dock.
2. WHEN a cashier opens the Experience Builder, THE POS SHALL display Step 1: a
   grid of ticket categories (e.g., Admissions, Shows, Experiences) with visual
   tiles.
3. WHEN a cashier selects a category in Step 1, THE Experience Builder SHALL
   transition to Step 2: a list of all events within the selected category.
4. WHEN a cashier selects an event in Step 2, THE Experience Builder SHALL
   transition to Step 3: the event's ticket types with quantity steppers for
   bulk or single booking.
5. WHEN a cashier confirms ticket selections in Step 3, THE Experience Builder
   SHALL add the selected items to the active cart and return to Step 1 for
   additional selections.
6. THE Experience Builder SHALL display a running cart summary showing items
   added so far, with a "Checkout" button to proceed to the Checkout_Drawer.
7. THE Experience Builder SHALL support a "Back" navigation at each step to
   return to the previous step without losing selections made in other steps.

### Requirement 16: Dynamic Offers and Promotions Display

**User Story:** As a cashier, I want to see applicable promotions and offers
visually on the cart, so that I can inform customers about available deals.

#### Acceptance Criteria

1. WHEN cart contents match a Cart_Rule condition (e.g., buy 3 get 1 free), THE
   Cart_Panel SHALL display a promotion badge on the affected items showing the
   offer description.
2. WHEN cart contents match a Price_Rule condition (e.g., 10% discount for 5+
   tickets), THE Cart_Panel SHALL display the discounted price alongside the
   original price for affected items.
3. THE Cart_Panel SHALL display a promotions summary section above the cart
   total showing all active promotions applied to the current cart.
4. WHEN a promotion is nearly triggered (e.g., customer has 2 of 3 required
   items), THE Cart_Panel SHALL display a suggestion message indicating how to
   qualify for the promotion.

### Requirement 17: Cart Messages

**User Story:** As a cashier, I want the cart to show interactive messages for
promotions, upsells, and warnings, so that I can act on opportunities and
resolve issues.

#### Acceptance Criteria

1. THE Cart_Panel SHALL support rendering a list of Cart_Message items between
   the item list and the totals section.
2. WHEN a promotion suggestion is available, THE Cart_Panel SHALL display a
   Cart_Message with the promotion description and an "Apply" or "Add Item"
   action button.
3. WHEN an upsell opportunity exists (e.g., upgrade to VIP), THE Cart_Panel
   SHALL display a Cart_Message with the upsell description, price difference,
   and an "Upgrade" action button.
4. WHEN a cart validation warning exists (e.g., exceeds max tickets per order),
   THE Cart_Panel SHALL display a Cart_Message with a warning icon and
   description.
5. WHEN a cashier dismisses a Cart_Message, THE Cart_Panel SHALL hide that
   message for the duration of the current cart session.

### Requirement 18: B2B Account Loading

**User Story:** As a cashier, I want to load a B2B account's pending orders at
the POS, so that I can process pre-booked bulk tickets when the entity visits.

#### Acceptance Criteria

1. THE POS SHALL provide a "Load B2B Order" action accessible from the
   Smart_Dock or Catalog_Panel.
2. WHEN a cashier activates the B2B loading action, THE POS SHALL open a
   B2B_Account_Drawer with a search field for finding B2B accounts by name, ID,
   or reference number.
3. WHEN a cashier selects a B2B account, THE B2B_Account_Drawer SHALL display
   the account's pending orders with order details (items, quantities,
   pre-negotiated prices).
4. WHEN a cashier selects a pending order, THE POS SHALL load the order items
   into the active cart with the pre-negotiated B2B pricing.
5. WHILE a B2B order is loaded in the cart, THE Cart_Panel SHALL allow the
   cashier to increase or decrease item quantities within the B2B contract
   limits.
6. WHEN a cashier proceeds to checkout with a loaded B2B order, THE
   Checkout_Drawer SHALL display the B2B account's credit balance as an
   available payment method.

### Requirement 19: Ticket Tags

**User Story:** As a cashier, I want to tag tickets with metadata labels, so
that tickets can be categorized, filtered, and reported on.

#### Acceptance Criteria

1. THE Event_Detail_Drawer SHALL display available tags for each ticket type as
   selectable chips.
2. WHEN a cashier selects tags for a ticket, THE POS SHALL attach the selected
   tag identifiers to the cart item metadata.
3. THE Cart_Panel SHALL display applied tags as small badges on each cart item.
4. WHEN a tagged ticket is purchased, THE POS SHALL persist the tag associations
   with the issued ticket record.

### Requirement 20: Inventory Pools on Calendar

**User Story:** As a cashier, I want to see pool capacity allocations on the
calendar and timeslot selection, so that I can sell from the correct inventory
pool.

#### Acceptance Criteria

1. WHEN a timeslot has inventory pools configured, THE Date_Time_Picker_Drawer
   SHALL display a Pool_Meter component for each pool (B2B, B2C, Membership)
   showing remaining capacity.
2. THE Pool_Meter SHALL render as a horizontal bar with a fill percentage,
   color-coded by pool type, and a numeric label showing remaining units out of
   total allocation.
3. WHEN a pool's remaining capacity reaches zero, THE Pool_Meter SHALL display a
   "Full" indicator and THE Date_Time_Picker_Drawer SHALL prevent selection from
   that pool.
4. WHEN a cashier selects a timeslot, THE POS SHALL deduct capacity from the
   appropriate pool based on the sales channel context.

### Requirement 21: Pool Performance Section

**User Story:** As a cashier or supervisor, I want to see pool performance
metrics, so that I can understand utilization and sell-through rates.

#### Acceptance Criteria

1. THE POS SHALL provide a Pool Performance section accessible from the
   Smart_Dock or a dedicated dashboard view.
2. THE Pool Performance section SHALL display utilization percentage,
   sell-through rate, and remaining capacity for each inventory pool.
3. THE Pool Performance section SHALL update metrics in real-time or within a
   60-second refresh interval.
4. THE Pool Performance section SHALL support filtering by date range, event,
   and pool type.

### Requirement 22: Pool Transfer

**User Story:** As a supervisor, I want to transfer capacity from one inventory
pool to another, so that I can rebalance allocations based on demand.

#### Acceptance Criteria

1. THE POS SHALL provide a Pool Transfer action accessible from the Pool
   Performance section, restricted to users with supervisor permissions.
2. WHEN a supervisor initiates a pool transfer, THE POS SHALL display a
   Pool_Transfer_Drawer showing source pool, destination pool, and a quantity
   input.
3. WHEN a supervisor confirms a transfer, THE POS SHALL move the specified
   quantity from the source pool to the destination pool and update both
   Pool_Meters immediately.
4. IF a supervisor enters a transfer quantity exceeding the source pool's
   available capacity, THEN THE Pool_Transfer_Drawer SHALL display an error and
   prevent the transfer.
5. THE POS SHALL log each pool transfer with the supervisor's identity,
   timestamp, source pool, destination pool, and quantity transferred for audit
   purposes.
