# Requirements Document

## Introduction

A composable, headless transaction engine for managing shopping carts across
multiple sales channels (POS, ecommerce, food ordering, and custom). The system
is split into four packages: a pure-logic core engine (`@cart/core`), a React
integration layer (`@cart/react`), a composable UI component library
(`@cart/ui`), and an optional plugin system (`@cart/plugins`). All pricing
calculations are deterministic and pipeline-based. The engine supports
multi-cart sessions, offline operation, undo/redo, split payments, and real-time
sync.

## Glossary

- **Cart**: A transaction container holding items, customer info, pricing
  snapshot, channel, currency, and status
- **CartItem**: A line item within a Cart, containing product reference,
  quantity, unit price, modifiers, notes, and computed pricing
- **Modifier**: A configurable option attached to a CartItem (e.g., size,
  toppings, extras) with type "single" or "multiple"
- **PricingSnapshot**: An immutable snapshot of computed totals: subtotal,
  discount, tax, service charge, and total
- **ItemPricing**: Per-item computed pricing including line total, item-level
  discount, and item-level tax
- **CartEngine**: The core stateless engine interface that processes cart
  mutations and pricing calculations
- **PricingStep**: A pure function `(cart: Cart) => Cart` that represents one
  stage in the pricing pipeline
- **PricingPipeline**: An ordered sequence of PricingStep functions executed to
  compute final cart totals
- **CartPlugin**: An extension module that can add actions, pricing steps, and
  lifecycle hooks to the CartEngine
- **CartManager**: A controller managing multiple Cart instances with an active
  cart pointer (for POS tabs)
- **CartConfig**: A configuration object defining currency, tax mode, rounding
  strategy, and enabled features per channel
- **Channel**: A sales context identifier: "pos", "ecommerce", "food", or
  "custom"
- **CartProvider**: The React context provider that exposes cart state and
  actions to the component tree
- **ActionQueue**: An ordered list of pending cart mutations buffered during
  offline operation for later sync
- **HistoryStack**: A bounded stack of cart state snapshots enabling undo and
  redo operations

## Requirements

### Requirement 1: Cart Data Model

**User Story:** As a developer, I want a well-defined cart data model, so that I
can represent transactions consistently across all sales channels.

#### Acceptance Criteria

1. THE CartEngine SHALL represent a Cart with the following fields: id (string),
   channel (Channel), items (CartItem[]), currency (string), pricing
   (PricingSnapshot), customer (optional), metadata (record), and status
   ("active" | "held" | "completed")
2. THE CartEngine SHALL represent a CartItem with the following fields: id
   (string), productId (string), name (string), sku (string), quantity (number),
   unitPrice (number), modifiers (Modifier[]), notes (string), pricing
   (ItemPricing), and metadata (record)
3. THE CartEngine SHALL represent a Modifier with the following fields: id
   (string), name (string), type ("single" | "multiple"), and options
   (ModifierOption[])
4. THE CartEngine SHALL represent a PricingSnapshot with the following fields:
   subtotal (number), discount (number), tax (number), service (number), and
   total (number)
5. THE CartEngine SHALL enforce that PricingSnapshot.total equals
   PricingSnapshot.subtotal minus PricingSnapshot.discount plus
   PricingSnapshot.tax plus PricingSnapshot.service

### Requirement 2: Core Engine Operations

**User Story:** As a developer, I want a pure-logic cart engine with standard
mutation operations, so that I can manage cart state without coupling to any UI
framework.

#### Acceptance Criteria

1. WHEN addItem is called with a valid CartItem, THE CartEngine SHALL add the
   item to the Cart items array and recalculate pricing
2. WHEN addItem is called with a CartItem whose productId already exists in the
   Cart, THE CartEngine SHALL increment the existing item quantity instead of
   adding a duplicate
3. WHEN updateItem is called with an item id and partial update, THE CartEngine
   SHALL apply the update to the matching CartItem and recalculate pricing
4. WHEN removeItem is called with an item id, THE CartEngine SHALL remove the
   matching CartItem from the Cart and recalculate pricing
5. IF removeItem is called with an item id that does not exist in the Cart, THEN
   THE CartEngine SHALL return the Cart unchanged
6. WHEN applyDiscount is called with a discount descriptor, THE CartEngine SHALL
   store the discount and recalculate pricing
7. WHEN applyCoupon is called with a coupon code, THE CartEngine SHALL validate
   and apply the coupon discount and recalculate pricing
8. WHEN attachCustomer is called with customer data, THE CartEngine SHALL
   associate the customer with the Cart
9. WHEN calculate is called, THE CartEngine SHALL execute the full
   PricingPipeline and return a Cart with an updated PricingSnapshot
10. WHEN serialize is called, THE CartEngine SHALL produce a JSON-serializable
    representation of the Cart
11. WHEN the serialized Cart JSON is deserialized back through the CartEngine,
    THE CartEngine SHALL produce a Cart equivalent to the original (round-trip
    property)

### Requirement 3: Pipeline-Based Pricing

**User Story:** As a developer, I want pricing to be computed through a
composable pipeline of pure functions, so that I can customize pricing logic per
channel without modifying core code.

#### Acceptance Criteria

1. THE PricingPipeline SHALL execute PricingStep functions in sequential order:
   calculateSubtotal, applyItemDiscounts, applyCartDiscounts, applyTaxes,
   applyServiceCharge, finalizeTotal
2. WHEN a PricingStep is executed, THE PricingPipeline SHALL pass the Cart
   output of the previous step as input to the next step
3. THE PricingPipeline SHALL accept additional PricingStep functions injected by
   CartPlugin modules
4. WHEN plugin PricingStep functions are registered, THE PricingPipeline SHALL
   insert the plugin steps at the position specified by the plugin or append
   them before finalizeTotal
5. FOR ALL valid Cart states, executing the PricingPipeline twice on the same
   Cart SHALL produce identical PricingSnapshot values (idempotence property)
6. THE calculateSubtotal step SHALL compute subtotal as the sum of each CartItem
   quantity multiplied by CartItem unitPrice plus the sum of selected modifier
   option prices
7. WHEN CartConfig.taxMode is "exclusive", THE applyTaxes step SHALL add tax on
   top of the subtotal
8. WHEN CartConfig.taxMode is "inclusive", THE applyTaxes step SHALL extract tax
   from the subtotal without changing the total
9. THE finalizeTotal step SHALL apply the rounding strategy specified in
   CartConfig.rounding ("floor", "ceil", or "round") to the final total

### Requirement 4: Plugin System

**User Story:** As a developer, I want a plugin architecture, so that I can
extend the cart engine with optional features like loyalty, coupons, kitchen
routing, and inventory validation without modifying core code.

#### Acceptance Criteria

1. THE CartEngine SHALL accept CartPlugin registrations through a register
   method
2. THE CartPlugin interface SHALL define optional fields: name (string,
   required), extendActions (function to add new actions to the engine),
   pricingSteps (PricingStep[]), and hooks (object with optional onItemAdd,
   onItemRemove, onCheckout callbacks)
3. WHEN a CartPlugin with extendActions is registered, THE CartEngine SHALL make
   the extended actions available on the engine instance
4. WHEN a CartPlugin with pricingSteps is registered, THE CartEngine SHALL
   include the plugin pricing steps in the PricingPipeline
5. WHEN a CartPlugin with an onItemAdd hook is registered, THE CartEngine SHALL
   invoke the hook after every addItem operation
6. WHEN a CartPlugin with an onItemRemove hook is registered, THE CartEngine
   SHALL invoke the hook after every removeItem operation
7. WHEN a CartPlugin with an onCheckout hook is registered, THE CartEngine SHALL
   invoke the hook when checkout is initiated
8. IF a CartPlugin hook throws an error, THEN THE CartEngine SHALL catch the
   error, log a warning, and continue operation without interrupting the cart
   transaction

### Requirement 5: Configuration System

**User Story:** As a developer, I want a configuration system with per-channel
presets, so that I can tailor cart behavior for POS, ecommerce, and food
ordering without manual setup.

#### Acceptance Criteria

1. THE CartConfig SHALL define the following fields: currency (string), taxMode
   ("inclusive" | "exclusive"), allowNegativeQty (boolean), rounding ("floor" |
   "ceil" | "round"), and features (object with boolean flags: modifiers,
   discounts, notes, splitPayment)
2. THE CartEngine SHALL provide default CartConfig presets for channels: "pos",
   "ecommerce", and "food"
3. WHEN a Cart is created with a Channel value, THE CartEngine SHALL apply the
   corresponding default CartConfig preset
4. WHEN a Cart is created with a Channel value and explicit CartConfig
   overrides, THE CartEngine SHALL merge the overrides on top of the channel
   preset
5. WHILE CartConfig.allowNegativeQty is false, THE CartEngine SHALL reject
   updateItem calls that would set quantity below zero
6. WHILE CartConfig.features.modifiers is false, THE CartEngine SHALL ignore
   modifier data on CartItem additions

### Requirement 6: Multi-Cart Management

**User Story:** As a POS operator, I want to manage multiple cart sessions
simultaneously, so that I can hold and resume orders across tabs.

#### Acceptance Criteria

1. THE CartManager SHALL maintain an array of Cart instances and an activeCartId
   pointer
2. WHEN createCart is called, THE CartManager SHALL create a new Cart with a
   unique id and set the new Cart as active
3. WHEN switchCart is called with a cart id, THE CartManager SHALL set the
   matching Cart as active
4. WHEN deleteCart is called with a cart id, THE CartManager SHALL remove the
   matching Cart from the array
5. IF deleteCart is called and only one Cart remains, THEN THE CartManager SHALL
   create a new empty Cart before deleting the last one
6. WHEN holdCart is called, THE CartManager SHALL set the active Cart status to
   "held" and switch to the next available active Cart
7. WHEN resumeCart is called with a held cart id, THE CartManager SHALL set the
   matching Cart status to "active" and switch to the resumed Cart

### Requirement 7: Undo/Redo Support

**User Story:** As a POS cashier, I want to undo and redo cart actions, so that
I can quickly correct mistakes during checkout.

#### Acceptance Criteria

1. THE CartEngine SHALL maintain a HistoryStack of cart state snapshots with a
   configurable maximum depth
2. WHEN any mutation operation (addItem, updateItem, removeItem, applyDiscount,
   applyCoupon) is performed, THE CartEngine SHALL push the pre-mutation Cart
   state onto the undo stack
3. WHEN undo is called and the undo stack is not empty, THE CartEngine SHALL
   restore the Cart to the most recent snapshot from the undo stack and push the
   current state onto the redo stack
4. WHEN redo is called and the redo stack is not empty, THE CartEngine SHALL
   restore the Cart to the most recent snapshot from the redo stack and push the
   current state onto the undo stack
5. WHEN a new mutation is performed after an undo, THE CartEngine SHALL clear
   the redo stack
6. IF undo is called and the undo stack is empty, THEN THE CartEngine SHALL
   return the Cart unchanged
7. IF redo is called and the redo stack is empty, THEN THE CartEngine SHALL
   return the Cart unchanged
8. FOR ALL sequences of N mutations followed by N undos, THE CartEngine SHALL
   restore the Cart to the initial state (round-trip property)

### Requirement 8: Offline Mode and Action Queue

**User Story:** As a POS operator, I want the cart to work offline and sync when
connectivity is restored, so that sales are not interrupted by network issues.

#### Acceptance Criteria

1. WHILE the system is offline, THE CartEngine SHALL queue all mutation
   operations in the ActionQueue and apply them to local state immediately
2. WHEN connectivity is restored, THE CartEngine SHALL replay the ActionQueue
   against the backend in order
3. WHEN an ActionQueue item fails during replay, THE CartEngine SHALL retry the
   failed action up to 3 times with exponential backoff
4. IF an ActionQueue item fails after all retries, THEN THE CartEngine SHALL
   mark the action as failed and emit an error event
5. THE ActionQueue SHALL persist queued actions to local storage so that actions
   survive page reloads

### Requirement 9: Split Payments

**User Story:** As a POS operator, I want to split a cart total across multiple
payment methods, so that customers can pay with different methods or split
bills.

#### Acceptance Criteria

1. WHEN splitPayment is initiated, THE CartEngine SHALL accept an array of
   payment allocations, each specifying a payment method and amount
2. THE CartEngine SHALL validate that the sum of all payment allocation amounts
   equals the Cart PricingSnapshot total
3. IF the sum of payment allocations does not equal the Cart total, THEN THE
   CartEngine SHALL return a validation error indicating the remaining balance
4. WHILE CartConfig.features.splitPayment is false, THE CartEngine SHALL reject
   splitPayment calls with a configuration error

### Requirement 10: Partial Checkout

**User Story:** As a food service operator, I want to check out a subset of
items from a cart, so that diners can split bills by selecting individual items.

#### Acceptance Criteria

1. WHEN partialCheckout is called with a list of CartItem ids, THE CartEngine
   SHALL create a new checkout containing only the specified items with
   recalculated pricing
2. WHEN partialCheckout completes, THE CartEngine SHALL remove the checked-out
   items from the original Cart and recalculate the remaining Cart pricing
3. IF partialCheckout is called with an item id that does not exist in the Cart,
   THEN THE CartEngine SHALL return an error identifying the invalid item id
4. THE CartEngine SHALL ensure that the sum of all partial checkout totals plus
   the remaining Cart total equals the original Cart total (invariant property)

### Requirement 11: Real-Time Sync

**User Story:** As a multi-device operator, I want cart changes to sync in real
time across devices, so that kitchen screens and multiple terminals stay in
sync.

#### Acceptance Criteria

1. WHEN a Cart mutation occurs, THE CartEngine SHALL emit a sync event
   containing the cart id and the mutation delta
2. WHEN a sync event is received from another device, THE CartEngine SHALL apply
   the mutation delta to the local Cart state
3. IF a sync conflict is detected (concurrent mutations to the same CartItem),
   THEN THE CartEngine SHALL resolve the conflict using a last-writer-wins
   strategy based on timestamps
4. WHILE the system is offline, THE CartEngine SHALL buffer outgoing sync events
   and transmit the buffer when connectivity is restored

### Requirement 12: Cart Serialization and Deserialization

**User Story:** As a developer, I want to serialize and deserialize cart state,
so that carts can be persisted, transferred, and restored reliably.

#### Acceptance Criteria

1. WHEN serialize is called, THE CartEngine SHALL produce a valid JSON string
   representing the complete Cart state including all items, modifiers, pricing,
   and metadata
2. WHEN deserialize is called with a valid JSON string, THE CartEngine SHALL
   reconstruct a Cart object with all fields intact
3. FOR ALL valid Cart objects, deserialize(serialize(cart)) SHALL produce a Cart
   equivalent to the original (round-trip property)
4. IF deserialize is called with invalid JSON, THEN THE CartEngine SHALL return
   a descriptive parse error
5. IF deserialize is called with JSON that does not conform to the Cart schema,
   THEN THE CartEngine SHALL return a descriptive validation error

### Requirement 13: React Integration Layer

**User Story:** As a React developer, I want hooks and context providers for the
cart engine, so that I can integrate cart functionality into React applications
with minimal boilerplate.

#### Acceptance Criteria

1. THE CartProvider SHALL accept a CartConfig prop and initialize a CartEngine
   instance
2. THE CartProvider SHALL accept an optional plugins prop containing an array of
   CartPlugin instances to register
3. WHEN useCart is called within a CartProvider, THE Hook SHALL return the
   current Cart state
4. WHEN useCartItems is called within a CartProvider, THE Hook SHALL return the
   current Cart items array
5. WHEN useCartPricing is called within a CartProvider, THE Hook SHALL return
   the current PricingSnapshot
6. WHEN useCartActions is called within a CartProvider, THE Hook SHALL return
   bound action functions: addItem, updateItem, removeItem, applyDiscount,
   applyCoupon, undo, redo
7. IF useCart, useCartItems, useCartPricing, or useCartActions is called outside
   a CartProvider, THEN THE Hook SHALL throw a descriptive error

### Requirement 14: Composable UI Components

**User Story:** As a frontend developer, I want composable, compound UI
components for the cart, so that I can assemble cart interfaces tailored to each
sales channel.

#### Acceptance Criteria

1. THE Cart.Root component SHALL accept layout ("pos" | "ecommerce" | "food")
   and density ("compact" | "comfy") props to configure visual presentation
2. THE Cart.Header component SHALL render title, customer info, and
   channel-specific metadata (table number for food, order type for POS)
3. THE Cart.Items component SHALL render the list of CartItems with support for
   virtualization when the item count exceeds a configurable threshold
4. THE Cart.Item component SHALL expose sub-composable children:
   Cart.Item.Image, Cart.Item.Info, Cart.Item.Modifiers, Cart.Item.Quantity,
   Cart.Item.Price, Cart.Item.Actions
5. THE Cart.Summary component SHALL render the PricingSnapshot fields: subtotal,
   discount, tax, service charge, and total
6. THE Cart.Footer component SHALL render action buttons configurable per
   channel (checkout, hold cart, send to kitchen, payment split)
7. WHEN Cart state changes, THE Cart.Summary component SHALL re-render with
   updated PricingSnapshot values within the same render cycle
8. THE Cart.Modifiers component SHALL support both inline and modal editing
   modes for modifier selection

### Requirement 15: Package Architecture

**User Story:** As a monorepo maintainer, I want the cart system split into four
independent packages, so that consumers can install only what they need and the
core logic remains framework-agnostic.

#### Acceptance Criteria

1. THE @cart/core package SHALL contain zero React or DOM dependencies
2. THE @cart/react package SHALL depend only on @cart/core and React
3. THE @cart/ui package SHALL depend on @cart/react and the project UI framework
   (HeroUI)
4. THE @cart/plugins package SHALL depend only on @cart/core
5. WHEN @cart/core is imported in a non-browser environment (Node.js, test
   runner), THE package SHALL function without errors
