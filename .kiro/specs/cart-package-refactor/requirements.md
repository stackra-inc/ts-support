# Requirements Document

## Introduction

Refactor the existing `@cart/*` packages (`@cart/core`, `@cart/react`,
`@cart/ui`, `@cart/plugins`) into a production-grade, publishable npm package
suite for enterprise POS systems. The current implementation has critical state
management bugs (cart can be cleared while locked, cart stays locked after
clearing, no enforced state machine transitions) and missing first-class support
for operations like split cart, merge cart, and proper event-driven reactivity.
This refactor introduces a formal finite state machine for cart lifecycle,
enforced transition guards, a plugin architecture, multi-cart session
management, undo/redo history, customer linking, B2B account support, and
framework-agnostic design with React bindings as a separate package.

## Glossary

- **Cart_Engine**: The core, framework-agnostic cart state machine and business
  logic module (`@cart/core`). Manages cart lifecycle, item operations, pricing,
  and state transitions.
- **Cart_State_Machine**: The finite state machine governing cart lifecycle
  transitions between `active`, `held`, `locked`, and `completed` states with
  enforced guards.
- **Cart_Manager**: The multi-cart session orchestrator that manages concurrent
  carts, switching, hold/resume, merge, split, expiration, and deletion.
- **Cart_Item**: A line item in the cart representing a product with quantity,
  unit price, modifiers, and computed pricing.
- **Pricing_Pipeline**: The composable pipeline of pricing steps (subtotal, item
  discounts, cart discounts, tax, service charge, rounding, finalization) that
  computes the cart's pricing snapshot.
- **Plugin_Registry**: The system that manages cart plugins, resolving hooks and
  invoking them at defined lifecycle points.
- **Cart_Plugin**: An extension module conforming to the `CartPlugin` interface
  that adds optional behavior (loyalty, coupons, inventory, kitchen routing) via
  lifecycle hooks.
- **History_Stack**: The undo/redo system that maintains a bounded stack of cart
  snapshots for reverting and replaying mutations.
- **Action_Queue**: The offline-capable queue that buffers cart mutations when
  the network is unavailable and replays them on reconnection.
- **Sync_Adapter**: The interface for real-time synchronization of cart state
  across devices, with conflict resolution via last-writer-wins.
- **Cart_Serializer**: The module responsible for serializing Cart objects to
  JSON and deserializing them back with schema validation.
- **React_Bindings**: The `@cart/react` package providing `CartProvider`,
  consumer hooks (`useCart`, `useCartItems`, `useCartPricing`, `useCartActions`,
  `useCartManager`), and React-specific types.
- **UI_Components**: The `@cart/ui` package providing compound Cart components,
  slot system, and UI hooks for building cart interfaces.
- **Channel**: The sales channel context (`pos`, `ecommerce`, `food`, `custom`)
  that determines default configuration presets.
- **Split_Payment**: A payment mode where the cart total is distributed across
  multiple payment methods.
- **Partial_Checkout**: A checkout mode where a subset of cart items is checked
  out while the remainder stays in the cart.
- **Cart_Slot**: A named extension point in the UI where plugins or consumers
  can inject custom components.
- **B2B_Account**: A business-to-business customer account with contract
  pricing, credit limits, and assigned product catalogs.
- **Event_Emitter**: The pub/sub system that broadcasts cart state changes (item
  added, status changed, customer linked, etc.) to subscribers.

## Requirements

### Requirement 1: Cart State Machine with Enforced Transitions

**User Story:** As a developer integrating the cart package, I want a formal
state machine with enforced transition guards, so that invalid operations
(editing a locked cart, checking out a held cart) are rejected
deterministically.

#### Acceptance Criteria

1. THE Cart_State_Machine SHALL support exactly four states: `active`, `held`,
   `locked`, and `completed`
2. WHEN a state transition is requested, THE Cart_State_Machine SHALL validate
   the transition against the allowed transition map before applying the change
3. THE Cart_State_Machine SHALL allow the following transitions:
   `active → held`, `active → locked`, `active → completed`, `held → active`,
   `locked → active`, `locked → completed`
4. IF a disallowed state transition is requested, THEN THE Cart_State_Machine
   SHALL throw an `InvalidTransitionError` containing the current state, the
   requested state, and a human-readable message
5. WHILE the cart status is `locked`, THE Cart_Engine SHALL reject all item
   mutation operations (`addItem`, `updateItem`, `removeItem`, `applyDiscount`,
   `applyCoupon`) by throwing a `CartLockedError`
6. WHILE the cart status is `held`, THE Cart_Engine SHALL reject `lockCart` and
   `completeCart` operations by throwing an `InvalidTransitionError`
7. WHILE the cart status is `completed`, THE Cart_Engine SHALL reject all
   mutation and transition operations by throwing a `CartCompletedError`
8. WHEN `clearCart` is called, THE Cart_Engine SHALL check the cart status
   before clearing and reject the operation if the cart is `locked` or
   `completed`

### Requirement 2: Multi-Cart Session Management

**User Story:** As a POS cashier, I want to manage multiple concurrent carts
with hold, resume, merge, split, and expiration, so that I can serve multiple
customers efficiently.

#### Acceptance Criteria

1. THE Cart_Manager SHALL maintain an ordered list of carts and track the
   currently active cart by ID
2. WHEN `createCart` is called, THE Cart_Manager SHALL create a new cart with
   `active` status using the resolved channel configuration and set the new cart
   as the active cart
3. WHEN `switchCart` is called with a valid cart ID, THE Cart_Manager SHALL set
   the specified cart as the active cart
4. IF `switchCart` is called with a non-existent cart ID, THEN THE Cart_Manager
   SHALL throw a `CartNotFoundError`
5. WHEN `holdCart` is called, THE Cart_Manager SHALL transition the active cart
   to `held` status and switch to the next available `active` cart
6. WHEN `resumeCart` is called with a held cart ID, THE Cart_Manager SHALL
   transition the cart to `active` status and set the cart as the active cart
7. WHEN `mergeCarts` is called with a target ID and source IDs, THE Cart_Manager
   SHALL combine all source cart items into the target cart, summing quantities
   for matching product IDs, and move source carts to deleted history with
   reason `merged`
8. WHEN `splitCart` is called with a cart ID and a list of item IDs, THE
   Cart_Manager SHALL create a new cart containing the specified items removed
   from the source cart, and set the new cart as the active cart
9. WHEN `expireStaleCarts` is called with a TTL, THE Cart_Manager SHALL move all
   non-completed carts whose `updatedAt` is older than the TTL to deleted
   history with reason `expired` or `abandoned`
10. THE Cart_Manager SHALL maintain at least one cart at all times, creating a
    replacement cart when the last cart is deleted, expired, or completed
11. WHEN `duplicateCart` is called with a cart ID, THE Cart_Manager SHALL create
    a deep copy of the cart with a new ID and set the copy as the active cart

### Requirement 3: Event System for State Changes

**User Story:** As a developer, I want the cart to emit events on every state
change, so that UI components and external systems can react to cart mutations
without polling.

#### Acceptance Criteria

1. THE Event_Emitter SHALL support subscribing to and unsubscribing from named
   event channels
2. WHEN an item is added to the cart, THE Cart_Engine SHALL emit an `item:added`
   event containing the added Cart_Item
3. WHEN an item is removed from the cart, THE Cart_Engine SHALL emit an
   `item:removed` event containing the removed Cart_Item ID
4. WHEN an item is updated in the cart, THE Cart_Engine SHALL emit an
   `item:updated` event containing the item ID and the applied changes
5. WHEN the cart status changes, THE Cart_Engine SHALL emit a `status:changed`
   event containing the previous status and the new status
6. WHEN a customer is attached or detached, THE Cart_Engine SHALL emit a
   `customer:changed` event containing the previous and new customer values
7. WHEN a discount or coupon is applied or removed, THE Cart_Engine SHALL emit a
   `discount:changed` event containing the updated discounts array
8. WHEN the pricing snapshot is recalculated, THE Cart_Engine SHALL emit a
   `pricing:recalculated` event containing the new Pricing_Snapshot
9. THE Event_Emitter SHALL deliver events synchronously to all registered
   listeners in subscription order
10. THE Event_Emitter SHALL support a wildcard subscriber (`*`) that receives
    all events

### Requirement 4: Plugin Architecture

**User Story:** As a developer, I want a plugin system with well-defined
lifecycle hooks, so that I can extend the cart with loyalty, coupons,
promotions, fees, inventory checks, and custom logic without modifying the core
engine.

#### Acceptance Criteria

1. THE Plugin_Registry SHALL accept plugins conforming to the `CartPlugin`
   interface, each declaring a unique `id` and optional lifecycle hooks
2. WHEN a plugin is registered, THE Plugin_Registry SHALL validate that no other
   plugin with the same `id` is already registered
3. IF a duplicate plugin ID is registered, THEN THE Plugin_Registry SHALL throw
   a `DuplicatePluginError`
4. THE Plugin_Registry SHALL invoke plugin hooks at the following lifecycle
   points: `beforeAddItem`, `afterAddItem`, `beforeRemoveItem`,
   `afterRemoveItem`, `beforeCalculate`, `afterCalculate`, `beforeStatusChange`,
   `afterStatusChange`
5. WHEN multiple plugins register the same hook, THE Plugin_Registry SHALL
   invoke them in registration order
6. THE Plugin_Registry SHALL pass a `CartEngineContext` to each hook, providing
   read access to the current cart state and config
7. IF a plugin hook throws an error, THEN THE Plugin_Registry SHALL propagate
   the error to the caller and halt the operation

### Requirement 5: Pricing Pipeline

**User Story:** As a developer, I want a composable pricing pipeline with
ordered steps, so that I can customize tax calculation, discount application,
service charges, and rounding for different channels and regions.

#### Acceptance Criteria

1. THE Pricing_Pipeline SHALL execute steps in a defined order: subtotal
   calculation, item discount application, cart discount application, tax
   calculation, service charge application, rounding, and total finalization
2. WHEN `createPipeline` is called, THE Pricing_Pipeline SHALL return a pipeline
   with the default step sequence
3. WHEN `insertStep` is called with a step and a position, THE Pricing_Pipeline
   SHALL insert the custom step at the specified position in the pipeline
4. WHEN `calculate` is called with a cart and config, THE Pricing_Pipeline SHALL
   execute all steps sequentially, passing the accumulated pricing snapshot
   through each step
5. THE Pricing_Pipeline SHALL support three rounding modes: `round` (standard),
   `ceil` (round up), and `floor` (round down)
6. THE Pricing_Pipeline SHALL support two tax modes: `exclusive` (tax added on
   top) and `inclusive` (tax included in price)
7. FOR ALL valid Cart objects, THE Pricing_Pipeline SHALL produce a
   PricingSnapshot where `total` equals `subtotal - discount + tax + service`
   after rounding

### Requirement 6: Cart Serialization and Deserialization

**User Story:** As a developer, I want reliable serialization and
deserialization of cart state, so that carts can be persisted to storage,
transmitted over the network, and restored without data loss.

#### Acceptance Criteria

1. WHEN `serialize` is called with a valid Cart object, THE Cart_Serializer
   SHALL produce a JSON string representation of the complete cart state
2. WHEN `deserialize` is called with a valid JSON string, THE Cart_Serializer
   SHALL reconstruct the original Cart object
3. FOR ALL valid Cart objects, THE Cart_Serializer SHALL satisfy the round-trip
   property: `deserialize(serialize(cart))` produces an object deeply equal to
   the original cart
4. IF `deserialize` is called with malformed JSON, THEN THE Cart_Serializer
   SHALL throw a `DeserializationError` with the underlying parse error detail
5. IF `deserialize` is called with JSON that does not conform to the Cart
   schema, THEN THE Cart_Serializer SHALL throw a `SchemaValidationError`
   listing all specific violations
6. THE Cart_Serializer SHALL validate the following schema constraints: `id` is
   a string, `channel` is one of the valid Channel values, `status` is one of
   the valid CartStatus values, `items` is an array, `pricing` contains numeric
   fields (`subtotal`, `discount`, `tax`, `service`, `total`), `metadata` is a
   non-null object

### Requirement 7: Undo/Redo History

**User Story:** As a POS cashier, I want to undo and redo cart changes, so that
I can quickly correct mistakes without manually reverting each change.

#### Acceptance Criteria

1. THE History_Stack SHALL maintain a bounded stack of cart snapshots with a
   configurable maximum depth
2. WHEN a cart mutation occurs, THE History_Stack SHALL push the pre-mutation
   cart snapshot onto the undo stack and clear the redo stack
3. WHEN `undo` is called and the undo stack is non-empty, THE History_Stack
   SHALL pop the most recent snapshot from the undo stack, push the current cart
   onto the redo stack, and return the restored cart
4. WHEN `redo` is called and the redo stack is non-empty, THE History_Stack
   SHALL pop the most recent snapshot from the redo stack, push the current cart
   onto the undo stack, and return the restored cart
5. IF `undo` is called when the undo stack is empty, THEN THE History_Stack
   SHALL return the current cart unchanged
6. IF `redo` is called when the redo stack is empty, THEN THE History_Stack
   SHALL return the current cart unchanged
7. WHEN the undo stack exceeds the maximum depth, THE History_Stack SHALL
   discard the oldest snapshot

### Requirement 8: Offline Action Queue

**User Story:** As a POS cashier working in an environment with intermittent
connectivity, I want cart operations to be queued when offline and replayed when
connectivity is restored, so that no transactions are lost.

#### Acceptance Criteria

1. THE Action_Queue SHALL buffer cart mutation actions when the system is
   offline
2. WHEN connectivity is restored, THE Action_Queue SHALL replay queued actions
   in FIFO order
3. WHEN `enqueue` is called, THE Action_Queue SHALL add the action to the queue
   with a unique ID, timestamp, and retry count of zero
4. WHEN `dequeue` is called, THE Action_Queue SHALL remove and return the oldest
   action from the queue
5. IF an action fails during replay, THEN THE Action_Queue SHALL increment the
   retry count and re-enqueue the action
6. IF an action exceeds the maximum retry count (3 retries), THEN THE
   Action_Queue SHALL move the action to a dead-letter list
7. WHEN `persistQueue` is called, THE Action_Queue SHALL serialize the queue
   state to a JSON string for storage
8. WHEN `restoreQueue` is called with a JSON string, THE Action_Queue SHALL
   deserialize and restore the queue state

### Requirement 9: Split Payment and Partial Checkout

**User Story:** As a POS cashier, I want to split payment across multiple
methods and partially check out selected items, so that I can handle complex
payment scenarios.

#### Acceptance Criteria

1. WHEN `validateSplitPayment` is called with payment allocations, THE
   Cart_Engine SHALL verify that the sum of all allocation amounts equals the
   cart total
2. IF the split payment feature is disabled in the cart config, THEN THE
   Cart_Engine SHALL throw a `SplitPaymentDisabledError`
3. IF the sum of payment allocations does not equal the cart total, THEN THE
   Cart_Engine SHALL throw a `SplitPaymentMismatchError` containing the expected
   total and the actual sum
4. WHEN `partialCheckout` is called with a list of item IDs, THE Cart_Engine
   SHALL create a completed cart containing the specified items and return the
   remaining cart with the checked-out items removed
5. IF `partialCheckout` is called with an item ID that does not exist in the
   cart, THEN THE Cart_Engine SHALL throw a `PartialCheckoutError`
6. WHEN a partial checkout is completed, THE Cart_Engine SHALL recalculate the
   pricing of the remaining cart

### Requirement 10: Real-Time Sync

**User Story:** As a developer deploying the cart across multiple POS terminals,
I want real-time synchronization of cart state with conflict resolution, so that
concurrent edits on different devices converge to a consistent state.

#### Acceptance Criteria

1. THE Sync_Adapter SHALL define an interface with `send`, `onReceive`, and
   `disconnect` methods
2. WHEN a local cart mutation occurs, THE Cart_Engine SHALL create a `SyncEvent`
   containing the cart ID, a delta describing the change, and a timestamp
3. WHEN a remote `SyncEvent` is received, THE Cart_Engine SHALL apply the delta
   to the local cart state via `applySyncDelta`
4. WHEN two conflicting deltas target the same item, THE Cart_Engine SHALL
   resolve the conflict using last-writer-wins based on the `SyncEvent`
   timestamp
5. THE Sync_Adapter SHALL support pluggable transport implementations
   (WebSocket, HTTP polling, custom)

### Requirement 11: Customer Linking and Preferences

**User Story:** As a POS cashier, I want to link a customer to the cart and have
their preferences (membership tier, loyalty points, default discounts) applied
automatically, so that repeat customers get a personalized experience.

#### Acceptance Criteria

1. WHEN `attachCustomer` is called with a Customer object, THE Cart_Engine SHALL
   associate the customer with the cart and emit a `customer:changed` event
2. WHEN `detachCustomer` is called, THE Cart_Engine SHALL remove the customer
   association from the cart and emit a `customer:changed` event
3. WHEN a customer with a membership tier is attached, THE Plugin_Registry SHALL
   invoke the loyalty plugin to apply tier-based discounts automatically
4. THE Customer object SHALL support the following fields: `id`, `name`,
   `email`, `phone`, `tier`, `loyaltyPoints`, `preferences`, and `metadata`
5. WHEN a customer is attached to the cart, THE Cart_Engine SHALL recalculate
   pricing to reflect any customer-specific discounts

### Requirement 12: Channel Configuration and Presets

**User Story:** As a developer, I want channel-specific configuration presets
with deep-merge overrides, so that each sales channel (POS, ecommerce, food,
custom) has sensible defaults while remaining fully customizable.

#### Acceptance Criteria

1. THE Cart_Engine SHALL provide default configuration presets for channels:
   `pos`, `ecommerce`, `food`, and `custom`
2. WHEN `resolveConfig` is called with a channel and optional overrides, THE
   Cart_Engine SHALL deep-merge the overrides on top of the channel preset,
   merging the `features` object at the field level
3. THE configuration SHALL include the following fields: `currency` (ISO 4217),
   `taxMode` (`exclusive` or `inclusive`), `taxRate` (number),
   `allowNegativeQty` (boolean), `rounding` mode, and `features` (modifiers,
   discounts, notes, splitPayment)
4. WHEN no overrides are provided, THE Cart_Engine SHALL return a shallow copy
   of the channel preset so that consumers receive their own mutable object

### Requirement 13: React Bindings Package

**User Story:** As a React developer, I want a dedicated React bindings package
with a context provider and consumer hooks, so that I can integrate the cart
engine into React applications with idiomatic patterns and optimal re-render
behavior.

#### Acceptance Criteria

1. THE React_Bindings SHALL export a `CartProvider` component that initializes
   the Cart_Engine, Plugin_Registry, Cart_Manager, and History_Stack
2. THE React_Bindings SHALL export the following consumer hooks: `useCart` (full
   cart state), `useCartItems` (items array), `useCartPricing` (pricing
   snapshot), `useCartActions` (mutation functions), and `useCartManager`
   (multi-cart session functions)
3. WHEN a cart mutation occurs via `useCartActions`, THE React_Bindings SHALL
   trigger a re-render only in components subscribed to the changed slice of
   state
4. THE `CartProvider` SHALL accept a `channel` prop, an optional `config`
   override prop, and an optional `plugins` array prop
5. WHEN `CartProvider` is unmounted, THE React_Bindings SHALL clean up all
   subscriptions and event listeners
6. THE React_Bindings SHALL re-export all core types from `@cart/core` so that
   consumers do not need a direct dependency on the core package

### Requirement 14: UI Compound Components and Slot System

**User Story:** As a UI developer, I want pre-built compound components and a
slot system for the cart UI, so that I can compose cart interfaces with
consistent behavior while injecting custom content at defined extension points.

#### Acceptance Criteria

1. THE UI_Components SHALL export a `Cart` compound component namespace with
   sub-components: `Root`, `Header`, `Items`, `Item`, `Summary`, `Footer`,
   `Modifiers`, `Messages`, `Customer`, `Coupon`, `HoldBanner`, `Empty`, and
   `SessionSelector`
2. THE UI_Components SHALL export a `CartSlot` component that renders content
   registered at a named extension point
3. WHEN a plugin registers content for a Cart_Slot name, THE UI_Components SHALL
   render that content at the corresponding `CartSlot` location
4. THE `Cart.Root` component SHALL accept `layout` (`pos` or `standard`) and
   `density` (`compact` or `comfortable`) props to control visual presentation
5. THE UI_Components SHALL export hooks: `useCartCoupon` (coupon validation and
   application), `useCartCustomer` (customer search and linking),
   `useCartDerived` (computed state like item count, hold status), and
   `useCartMessages` (message management)
6. THE UI_Components SHALL be built on top of `@cart/react` hooks and remain
   decoupled from any specific design system

### Requirement 15: B2B Account Support

**User Story:** As an enterprise operator, I want B2B account support with
contract pricing, credit limits, and assigned product catalogs, so that reseller
partners can place orders within their negotiated terms.

#### Acceptance Criteria

1. WHEN a B2B_Account is loaded into the cart, THE Cart_Engine SHALL apply the
   account's contract pricing to all applicable items, overriding standard
   pricing
2. WHILE a B2B_Account is active on the cart, THE Cart_Engine SHALL enforce the
   account's credit limit by rejecting item additions that would exceed the
   remaining credit
3. IF an item addition would exceed the B2B_Account credit limit, THEN THE
   Cart_Engine SHALL throw a `CreditLimitExceededError` containing the current
   balance and the attempted amount
4. WHEN a B2B_Account is loaded, THE Cart_Engine SHALL filter the available
   product catalog to show only products assigned to the account
5. THE B2B_Account object SHALL support the following fields: `id`,
   `companyName`, `contractId`, `creditLimit`, `creditUsed`, `assignedProducts`,
   `pricingOverrides`, and `metadata`

### Requirement 16: Error Handling and Error Types

**User Story:** As a developer, I want well-defined, typed error classes for all
cart failure modes, so that I can handle errors programmatically and provide
meaningful feedback to users.

#### Acceptance Criteria

1. THE Cart_Engine SHALL define the following error classes:
   `InvalidTransitionError`, `CartLockedError`, `CartCompletedError`,
   `CartNotFoundError`, `DeserializationError`, `SchemaValidationError`,
   `SplitPaymentDisabledError`, `SplitPaymentMismatchError`,
   `PartialCheckoutError`, `DuplicatePluginError`, and
   `CreditLimitExceededError`
2. THE Cart_Engine SHALL ensure all error classes extend a base `CartError`
   class that includes a `code` property with a machine-readable error
   identifier
3. WHEN an error is thrown, THE Cart_Engine SHALL include contextual information
   (cart ID, current state, attempted operation) in the error message
4. THE Cart_Engine SHALL export all error classes from the package entry point
   so consumers can use `instanceof` checks for error handling

### Requirement 17: TypeScript Types and Documentation

**User Story:** As a developer consuming the cart package, I want comprehensive
TypeScript type definitions and JSDoc documentation, so that I get full
IntelliSense support and can understand the API without reading source code.

#### Acceptance Criteria

1. THE Cart_Engine SHALL export TypeScript type definitions for all public
   interfaces, types, and function signatures
2. THE Cart_Engine SHALL include JSDoc comments on all exported functions
   describing parameters, return values, thrown errors, and usage examples
3. THE Cart_Engine SHALL export all public types from a single barrel entry
   point (`@cart/core`, `@cart/react`, `@cart/ui`, `@cart/plugins`)
4. THE Cart_Engine SHALL ensure that all generic type parameters have
   descriptive names and constraints

### Requirement 18: Loyalty Plugin

**User Story:** As a venue operator, I want a loyalty plugin that earns and
redeems points based on cart activity, so that customers are rewarded for
purchases and can redeem points for discounts.

#### Acceptance Criteria

1. WHEN `createLoyaltyPlugin` is called with a config specifying `pointsPerUnit`
   and `redemptionRate`, THE Plugin_Registry SHALL register a plugin that
   calculates loyalty points earned on each pricing calculation
2. WHEN the cart pricing is calculated, THE loyalty plugin SHALL compute points
   earned as `subtotal × pointsPerUnit` and attach the value to the cart
   metadata
3. WHEN a customer redeems loyalty points, THE loyalty plugin SHALL apply a
   discount of `redeemedPoints × redemptionRate` to the cart total
4. THE loyalty plugin SHALL expose its configuration type `LoyaltyPluginConfig`
   for consumers to customize

### Requirement 19: Coupon Plugin

**User Story:** As a venue operator, I want a coupon plugin that validates and
applies promotional codes, so that customers can receive discounts through
marketing campaigns.

#### Acceptance Criteria

1. WHEN `createCouponPlugin` is called with a `validateFn` callback, THE
   Plugin_Registry SHALL register a plugin that validates coupon codes against
   the provided function
2. WHEN a coupon code is applied, THE coupon plugin SHALL call the `validateFn`
   and return a result containing `valid` (boolean), `discount` (number), and
   `message` (string)
3. IF the coupon code is invalid, THEN THE coupon plugin SHALL reject the
   application and return the validation message
4. WHEN a valid coupon is applied, THE coupon plugin SHALL add a discount
   descriptor to the cart and trigger a pricing recalculation
5. WHEN a coupon is removed, THE coupon plugin SHALL remove the corresponding
   discount descriptor and trigger a pricing recalculation

### Requirement 20: Package Structure and Publishing

**User Story:** As a package maintainer, I want the cart packages structured as
independent, publishable npm packages with proper peer dependencies, so that
consumers can install only the packages they need.

#### Acceptance Criteria

1. THE package suite SHALL be organized as four independent packages:
   `@cart/core` (zero runtime dependencies), `@cart/react` (peer dependency on
   `react` and `@cart/core`), `@cart/ui` (peer dependency on `react` and
   `@cart/react`), and `@cart/plugins` (peer dependency on `@cart/core`)
2. THE `@cart/core` package SHALL be framework-agnostic with zero framework
   dependencies
3. EACH package SHALL include a `package.json` with `main`, `module`, `types`,
   `exports`, and `files` fields configured for dual CJS/ESM output
4. EACH package SHALL include a `README.md` with installation instructions, API
   overview, and usage examples
5. THE package suite SHALL use a monorepo structure with shared build tooling
   and consistent versioning
