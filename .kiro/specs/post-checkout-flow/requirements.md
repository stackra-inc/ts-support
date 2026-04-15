# Requirements Document

## Introduction

This document defines the requirements for the Post-Checkout Flow in the MNGO
POS system. After a customer completes payment at a venue ticketing counter, the
system chains through a sequence of steps: order confirmation, automatic receipt
printing, RFID media linking, and an experience builder upsell. Each step is
skippable, and the flow returns the cashier to the product catalog upon
completion.

## Glossary

- **POS_System**: The Point of Sale application used by cashiers at venue
  ticketing counters (museums, theme parks, etc.)
- **Post_Checkout_Flow**: The orchestrated sequence of steps that executes after
  payment is completed: Order Confirmation → Receipt Print → RFID Link →
  Experience Builder → Return to Catalog
- **Flow_Controller**: The state machine or orchestrator that manages
  transitions between post-checkout steps, tracks the current step, and handles
  skip/complete actions
- **Order_Confirm_Overlay**: The full-screen success overlay displayed
  immediately after payment, showing order details and a countdown timer
- **Print_Service**: The utility module responsible for printing receipts in
  silent mode (hidden iframe) or preview mode (browser print dialog)
- **Receipt_Content**: The formatted HTML content representing the order
  receipt, including order ID, line items, totals, and venue branding
- **RFID_Link_Prompt**: The UI component that allows a cashier to associate
  purchased tickets with physical RFID media (card, bracelet, or hotel card)
- **RFID_Media**: A physical device (card, bracelet, or hotel_card) containing
  an RFID tag that is linked to a purchased ticket
- **Experience_Builder_Drawer**: The 3-step wizard drawer that allows customers
  to add complementary events or add-ons to their purchase
- **Drawer_Stack**: The stack-based drawer management system that supports push,
  pop, replace, and clear operations for layered UI panels
- **Cashier**: The venue employee operating the POS terminal who processes sales
  and interacts with the post-checkout flow

## Requirements

### Requirement 1: Post-Checkout Flow Orchestration

**User Story:** As a cashier, I want the system to automatically guide me
through post-checkout steps after payment, so that I can efficiently complete
all necessary post-sale tasks without manually navigating between screens.

#### Acceptance Criteria

1. WHEN a payment is completed, THE Flow_Controller SHALL initiate the
   Post_Checkout_Flow starting with the Order_Confirm_Overlay step
2. WHEN the current step is completed or skipped, THE Flow_Controller SHALL
   advance to the next step in the sequence: Order Confirmation → Receipt Print
   → RFID Link → Experience Builder
3. WHEN the final step of the Post_Checkout_Flow is completed or skipped, THE
   Flow_Controller SHALL return the POS_System to the product catalog view
4. THE Flow_Controller SHALL track the current step of the Post_Checkout_Flow
   and expose the step identifier to consuming components
5. WHEN the Post_Checkout_Flow is active, THE Flow_Controller SHALL prevent the
   Cashier from starting a new checkout until the flow completes or is fully
   dismissed

### Requirement 2: Order Confirmation Step

**User Story:** As a cashier, I want to see a clear order confirmation screen
after payment, so that I can verify the transaction was successful before
proceeding.

#### Acceptance Criteria

1. WHEN the Post_Checkout_Flow begins, THE Order_Confirm_Overlay SHALL display
   the order ID, item count, and total amount for the completed order
2. WHEN the Order_Confirm_Overlay countdown timer reaches zero, THE
   Flow_Controller SHALL advance to the Receipt Print step instead of closing
   the overlay
3. WHEN the Cashier taps the dismiss action on the Order_Confirm_Overlay, THE
   Flow_Controller SHALL advance to the Receipt Print step
4. THE Order_Confirm_Overlay SHALL display a "Continue" action that advances to
   the next step in the Post_Checkout_Flow

### Requirement 3: Silent Receipt Printing Step

**User Story:** As a cashier, I want the receipt to print automatically after
order confirmation, so that I can hand the customer a receipt without extra
manual steps.

#### Acceptance Criteria

1. WHEN the Flow_Controller advances to the Receipt Print step, THE
   Print_Service SHALL generate Receipt_Content from the completed order data
   including order ID, line items, quantities, prices, and total
2. WHEN the terminal print mode is set to "silent", THE Print_Service SHALL
   print the Receipt_Content using the hidden iframe approach without displaying
   a print dialog
3. WHEN the terminal print mode is set to "preview", THE Print_Service SHALL
   open the browser print dialog with the Receipt_Content
4. IF the silent print operation fails, THEN THE Print_Service SHALL fall back
   to preview mode and log a warning
5. WHEN the receipt print operation completes or the print dialog is dismissed,
   THE Flow_Controller SHALL advance to the RFID Link step
6. WHEN the receipt print operation is initiated, THE POS_System SHALL display a
   brief printing status indicator to the Cashier

### Requirement 4: RFID Media Linking Step

**User Story:** As a cashier, I want to be prompted to link purchased tickets to
physical RFID media, so that customers can use their wristband, card, or hotel
key to access purchased experiences.

#### Acceptance Criteria

1. WHEN the Flow_Controller advances to the RFID Link step, THE RFID_Link_Prompt
   SHALL display a list of all tickets from the completed order that are
   eligible for RFID linking
2. THE RFID_Link_Prompt SHALL allow the Cashier to select a media type (card,
   bracelet, or hotel_card) for each ticket
3. WHEN the Cashier scans or enters an RFID tag value, THE RFID_Link_Prompt
   SHALL associate the tag with the selected ticket and record the media type,
   timestamp, and Cashier identifier
4. WHEN all tickets have been linked or the Cashier chooses to skip, THE
   Flow_Controller SHALL advance to the Experience Builder step
5. THE RFID_Link_Prompt SHALL display a "Skip" action that allows the Cashier to
   bypass RFID linking for all remaining unlinked tickets
6. THE RFID_Link_Prompt SHALL display the linking status for each ticket (linked
   or pending) so the Cashier can track progress
7. IF an RFID tag value is already associated with another ticket, THEN THE
   RFID_Link_Prompt SHALL display an error message and prevent the duplicate
   association

### Requirement 5: Experience Builder Upsell Step

**User Story:** As a cashier, I want to offer customers complementary
experiences after their purchase, so that I can increase revenue and enhance the
customer's visit.

#### Acceptance Criteria

1. WHEN the Flow_Controller advances to the Experience Builder step, THE
   Experience_Builder_Drawer SHALL open in the Drawer_Stack displaying available
   event categories
2. THE Experience_Builder_Drawer SHALL allow the Cashier to browse categories,
   select events, and add ticket quantities for complementary experiences
3. WHEN the Cashier adds items in the Experience_Builder_Drawer, THE POS_System
   SHALL create a new cart with the selected upsell items and proceed to
   checkout for those items
4. THE Experience_Builder_Drawer SHALL display a "Skip" action that allows the
   Cashier to bypass the upsell step
5. WHEN the Cashier completes or skips the Experience Builder step, THE
   Flow_Controller SHALL end the Post_Checkout_Flow and return to the product
   catalog view

### Requirement 6: Flow Step Skipping

**User Story:** As a cashier, I want to skip any post-checkout step, so that I
can serve customers quickly when they do not need RFID linking or upsell offers.

#### Acceptance Criteria

1. THE RFID_Link_Prompt SHALL provide a visible "Skip" action at all times
   during the RFID linking step
2. THE Experience_Builder_Drawer SHALL provide a visible "Skip" or "No Thanks"
   action at all times during the upsell step
3. WHEN the Cashier activates a skip action, THE Flow_Controller SHALL
   immediately advance to the next step without requiring confirmation
4. THE Flow_Controller SHALL support a "Skip All" action on the
   Order_Confirm_Overlay that bypasses all remaining post-checkout steps and
   returns directly to the product catalog

### Requirement 7: Receipt Content Generation

**User Story:** As a cashier, I want receipts to contain all relevant order
information in a print-optimized format, so that customers receive a clear and
complete record of their purchase.

#### Acceptance Criteria

1. THE Print_Service SHALL generate Receipt_Content that includes the order ID,
   venue name, date and time of purchase, line items with names and quantities,
   individual prices, and the order total
2. THE Print_Service SHALL format Receipt_Content using print-optimized CSS
   targeting 80mm thermal receipt paper
3. THE Print_Service SHALL include a machine-readable order identifier (barcode
   or QR placeholder) on the Receipt_Content
