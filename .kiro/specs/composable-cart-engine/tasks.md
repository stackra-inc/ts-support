# Implementation Plan: Composable Cart Engine

## Overview

Incremental implementation of the composable cart engine across four packages
(`@cart/core`, `@cart/react`, `@cart/ui`, `@cart/plugins`) within the pnpm
monorepo. Each task builds on the previous, starting with core types and engine
logic, then layering React bindings, UI components, and plugins. Testing is
integrated alongside implementation using vitest and fast-check.

## Tasks

- [x] 1. Scaffold package structure and configuration
  - [x] 1.1 Create `packages/cart/core/` with `package.json`, `tsconfig.json`,
        `tsup.config.ts`, `vitest.config.ts`, and `src/index.ts`
    - Package name: `@cart/core`, zero runtime dependencies
    - Follow existing monorepo conventions (ESM + CJS output, vitest globals,
      path aliases)
    - Add `fast-check` as a devDependency for property-based testing
    - _Requirements: 15.1, 15.5_
  - [x] 1.2 Create `packages/cart/react/` with `package.json`, `tsconfig.json`,
        `tsup.config.ts`, `vitest.config.ts`, and `src/index.ts`
    - Package name: `@cart/react`, depends on `@cart/core` (workspace:\*) and
      React as peerDependency
    - Add `@testing-library/react` and `jsdom` as devDependencies
    - _Requirements: 15.2_
  - [x] 1.3 Create `packages/cart/ui/` with `package.json`, `tsconfig.json`,
        `tsup.config.ts`, `vitest.config.ts`, and `src/index.ts`
    - Package name: `@cart/ui`, depends on `@cart/react` (workspace:\*) and
      `@heroui/react` as peerDependency
    - _Requirements: 15.3_
  - [x] 1.4 Create `packages/cart/plugins/` with `package.json`,
        `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, and
        `src/index.ts`
    - Package name: `@cart/plugins`, depends on `@cart/core` (workspace:\*) only
    - _Requirements: 15.4_

- [x] 2. Implement core data models, types, and configuration
  - [x] 2.1 Create `packages/cart/core/src/types.ts` with all core type
        definitions
    - Define `Channel`, `CartConfig`, `CartItem`, `NewCartItem`,
      `CartItemUpdate`, `Modifier`, `ModifierOption`, `ItemPricing`,
      `PricingSnapshot`, `Customer`, `DiscountDescriptor`, `DiscountType`,
      `CartStatus`, `Cart`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.2 Create `packages/cart/core/src/config.ts` with channel presets and
        config merging
    - Define `CHANNEL_PRESETS` for "pos", "ecommerce", "food", "custom"
    - Implement `resolveConfig(channel, overrides?)` that merges overrides on
      top of channel preset
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]\* 2.3 Write property test for channel config resolution
    - **Property 14: Channel config resolution**
    - **Validates: Requirements 5.3, 5.4**

- [x] 3. Implement pricing pipeline
  - [x] 3.1 Create `packages/cart/core/src/pipeline.ts` with PricingPipeline and
        built-in steps
    - Implement `createPipeline`, `insertStep`
    - Implement built-in steps: `calculateSubtotal`, `applyItemDiscounts`,
      `applyCartDiscounts`, `applyTaxes`, `applyServiceCharge`, `finalizeTotal`
    - Steps execute sequentially, each receiving the Cart output of the previous
      step
    - _Requirements: 3.1, 3.2, 3.6, 3.7, 3.8, 3.9_
  - [ ]\* 3.2 Write property test for pricing total invariant
    - **Property 1: Pricing total invariant**
    - **Validates: Requirements 1.5**
  - [ ]\* 3.3 Write property test for subtotal formula correctness
    - **Property 9: Subtotal formula correctness**
    - **Validates: Requirements 3.6**
  - [ ]\* 3.4 Write property test for tax mode correctness
    - **Property 10: Tax mode correctness**
    - **Validates: Requirements 3.7, 3.8**
  - [ ]\* 3.5 Write property test for rounding strategy application
    - **Property 11: Rounding strategy application**
    - **Validates: Requirements 3.9**
  - [ ]\* 3.6 Write property test for pricing pipeline idempotence
    - **Property 8: Pricing pipeline idempotence**
    - **Validates: Requirements 3.5**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement core engine functions
  - [x] 5.1 Create `packages/cart/core/src/engine.ts` with cart mutation
        functions
    - Implement `createCart`, `addItem` (with duplicate productId merge),
      `updateItem`, `removeItem`, `applyDiscount`, `applyCoupon`,
      `attachCustomer`, `calculate`
    - Each function returns a new immutable Cart; pricing is recalculated after
      every mutation
    - Enforce `allowNegativeQty` and `features.modifiers` config flags
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 5.5, 5.6_
  - [ ]\* 5.2 Write property test for adding an item
    - **Property 2: Adding an item grows the cart**
    - **Validates: Requirements 2.1**
  - [ ]\* 5.3 Write property test for duplicate productId merge
    - **Property 3: Duplicate productId merges quantity**
    - **Validates: Requirements 2.2**
  - [ ]\* 5.4 Write property test for removing an item
    - **Property 4: Remove item shrinks the cart**
    - **Validates: Requirements 2.4**
  - [ ]\* 5.5 Write property test for updating an item
    - **Property 5: Update item applies changes**
    - **Validates: Requirements 2.3**
  - [ ]\* 5.6 Write property test for discount application
    - **Property 6: Discount application recalculates pricing**
    - **Validates: Requirements 2.6, 2.7**
  - [ ]\* 5.7 Write property test for negative quantity rejection
    - **Property 15: Negative quantity rejection**
    - **Validates: Requirements 5.5**
  - [ ]\* 5.8 Write property test for modifiers ignored when feature disabled
    - **Property 16: Modifiers ignored when feature disabled**
    - **Validates: Requirements 5.6**

- [x] 6. Implement serialization
  - [x] 6.1 Create `packages/cart/core/src/serialization.ts` with
        serialize/deserialize functions
    - Implement `serialize(cart)` and `deserialize(json)` with schema validation
    - Handle error cases: invalid JSON → `DeserializationError`, invalid schema
      → `SchemaValidationError`
    - _Requirements: 2.10, 2.11, 12.1, 12.2, 12.4, 12.5_
  - [ ]\* 6.2 Write property test for serialization round-trip
    - **Property 7: Serialization round-trip**
    - **Validates: Requirements 2.10, 2.11, 12.1, 12.2, 12.3**

- [x] 7. Implement plugin system
  - [x] 7.1 Create `packages/cart/core/src/plugins.ts` with plugin registry and
        hook invocation
    - Implement `createPluginRegistry`, `registerPlugin`
    - Implement `invokeHook` with try-catch error isolation (log warning, never
      interrupt)
    - Plugin pricing steps are inserted into the pipeline; hooks are stored for
      lifecycle invocation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  - [ ]\* 7.2 Write property test for plugin pricing steps inclusion
    - **Property 12: Plugin pricing steps are included in pipeline**
    - **Validates: Requirements 3.3, 4.4**
  - [ ]\* 7.3 Write property test for plugin hooks invocation
    - **Property 13: Plugin hooks are invoked on corresponding operations**
    - **Validates: Requirements 4.5, 4.6, 4.7**

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement CartManager for multi-cart sessions
  - [x] 9.1 Create `packages/cart/core/src/manager.ts` with CartManager
        functions
    - Implement `createCartManager`, `managerCreateCart`, `switchCart`,
      `deleteCart`, `holdCart`, `resumeCart`
    - Enforce: deleteCart on last cart creates a new empty cart first;
      activeCartId always references an existing cart
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  - [ ]\* 9.2 Write property test for CartManager state consistency
    - **Property 17: CartManager state consistency**
    - **Validates: Requirements 6.2, 6.3, 6.4**
  - [ ]\* 9.3 Write property test for hold and resume round-trip
    - **Property 18: Hold and resume round-trip**
    - **Validates: Requirements 6.6, 6.7**

- [x] 10. Implement undo/redo history
  - [x] 10.1 Create `packages/cart/core/src/history.ts` with HistoryStack
        functions
    - Implement `createHistory`, `pushHistory`, `undo`, `redo`
    - Enforce configurable max depth, redo stack cleared on new mutation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  - [ ]\* 10.2 Write property test for undo/redo round-trip
    - **Property 19: Undo/redo round-trip**
    - **Validates: Requirements 7.8**
  - [ ]\* 10.3 Write property test for mutation after undo clears redo stack
    - **Property 20: Mutation after undo clears redo stack**
    - **Validates: Requirements 7.5**

- [x] 11. Implement offline action queue
  - [x] 11.1 Create `packages/cart/core/src/queue.ts` with ActionQueue functions
    - Implement `createActionQueue`, `enqueue`, `dequeue`, `markFailed`,
      `persistQueue`, `restoreQueue`
    - FIFO ordering, retry up to 3 times with exponential backoff, persist to
      JSON
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]\* 11.2 Write property test for offline queue order preservation
    - **Property 21: Offline queue preserves operation order**
    - **Validates: Requirements 8.1, 8.2**
  - [ ]\* 11.3 Write property test for action queue persistence round-trip
    - **Property 22: Action queue persistence round-trip**
    - **Validates: Requirements 8.5**

- [x] 12. Implement split payment and partial checkout
  - [x] 12.1 Create `packages/cart/core/src/payment.ts` with split payment and
        partial checkout functions
    - Implement `validateSplitPayment` and `partialCheckout`
    - Enforce: split payment disabled check, allocation sum validation, partial
      checkout item partitioning with pricing recalculation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4_
  - [ ]\* 12.2 Write property test for split payment validation
    - **Property 23: Split payment validation**
    - **Validates: Requirements 9.2, 9.3**
  - [ ]\* 12.3 Write property test for partial checkout total invariant
    - **Property 24: Partial checkout total invariant**
    - **Validates: Requirements 10.4**
  - [ ]\* 12.4 Write property test for partial checkout item partitioning
    - **Property 25: Partial checkout partitions items correctly**
    - **Validates: Requirements 10.1, 10.2**

- [x] 13. Implement real-time sync
  - [x] 13.1 Create `packages/cart/core/src/sync.ts` with sync adapter types and
        conflict resolution
    - Implement `SyncEvent`, `SyncAdapter` interface, `applySyncDelta`,
      `resolveConflict` (last-writer-wins)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  - [ ]\* 13.2 Write property test for sync conflict resolution
    - **Property 26: Sync conflict resolution is last-writer-wins**
    - **Validates: Requirements 11.3**

- [x] 14. Wire up `@cart/core` exports and finalize package
  - Re-export all public APIs from `packages/cart/core/src/index.ts`
  - Ensure all types, functions, and constants are accessible from the package
    entry point
  - _Requirements: 15.1, 15.5_

- [x] 15. Checkpoint - Ensure all @cart/core tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Implement React integration layer (`@cart/react`)
  - [x] 16.1 Create `packages/cart/react/src/context.ts` with CartProvider and
        internal context
    - Implement `CartProvider` that accepts `config`, `channel`, `plugins`,
      `syncAdapter`, `children`
    - Initialize CartEngine, HistoryStack, CartManager, PluginRegistry, and
      PricingPipeline internally
    - Manage state with `useReducer` or `useState`; expose via React context
    - _Requirements: 13.1, 13.2_
  - [x] 16.2 Create `packages/cart/react/src/hooks.ts` with all consumer hooks
    - Implement `useCart`, `useCartItems`, `useCartPricing`, `useCartActions`,
      `useCartManager`
    - Each hook throws a descriptive error when called outside `CartProvider`
    - `useCartActions` returns bound functions: addItem, updateItem, removeItem,
      applyDiscount, applyCoupon, attachCustomer, undo, redo
    - `useCartManager` returns carts, activeCartId, createCart, switchCart,
      deleteCart, holdCart, resumeCart
    - _Requirements: 13.3, 13.4, 13.5, 13.6, 13.7_
  - [x] 16.3 Wire up `packages/cart/react/src/index.ts` exports
    - Re-export CartProvider, all hooks, and re-export core types from
      `@cart/core`
    - _Requirements: 15.2_
  - [ ]\* 16.4 Write unit tests for hooks within CartProvider and error when
    outside
    - Test each hook returns correct data within provider
    - Test each hook throws descriptive error outside provider
    - _Requirements: 13.3, 13.4, 13.5, 13.6, 13.7_

- [x] 17. Implement composable UI components (`@cart/ui`)
  - [x] 17.1 Create `packages/cart/ui/src/cart.tsx` with compound Cart component
        namespace
    - Implement `Cart.Root` (accepts layout and density props), `Cart.Header`,
      `Cart.Items` (with virtualization threshold), `Cart.Item` with
      sub-components (Image, Info, Modifiers, Quantity, Price, Actions),
      `Cart.Summary`, `Cart.Footer`, `Cart.Modifiers`
    - Built on HeroUI components and Tailwind CSS v4
    - `Cart.Summary` renders all PricingSnapshot fields (subtotal, discount,
      tax, service, total)
    - `Cart.Modifiers` supports inline and modal editing modes
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8_
  - [x] 17.2 Wire up `packages/cart/ui/src/index.ts` exports
    - Re-export Cart compound component and re-export hooks/types from
      `@cart/react`
    - _Requirements: 15.3_
  - [ ]\* 17.3 Write property test for Cart.Summary rendering all pricing fields
    - **Property 27: Cart Summary renders all pricing fields**
    - **Validates: Requirements 14.5**
  - [ ]\* 17.4 Write unit tests for compound component rendering
    - Test Cart.Root with different layout/density combinations
    - Test Cart.Item sub-component composition
    - _Requirements: 14.1, 14.4_

- [x] 18. Implement pre-built plugins (`@cart/plugins`)
  - [x] 18.1 Create plugin factory functions in `packages/cart/plugins/src/`
    - Implement `createLoyaltyPlugin`, `createCouponPlugin`,
      `createInventoryPlugin`, `createKitchenPlugin`
    - Each returns a valid `CartPlugin` with appropriate pricingSteps and hooks
    - _Requirements: 4.1, 4.2_
  - [x] 18.2 Wire up `packages/cart/plugins/src/index.ts` exports
    - Re-export all plugin factory functions
    - _Requirements: 15.4_
  - [ ]\* 18.3 Write unit tests for each pre-built plugin
    - Test plugin registration and hook invocation
    - Test plugin pricing steps modify cart correctly
    - _Requirements: 4.4, 4.5, 4.6, 4.7_

- [x] 19. Create custom fast-check arbitraries
  - [x] 19.1 Create `packages/cart/core/__tests__/arbitraries.ts` with reusable
        test data generators
    - Implement `cartItemArbitrary`, `modifierArbitrary`, `cartArbitrary`,
      `configArbitrary`, `discountArbitrary`, `paymentAllocationArbitrary`,
      `syncEventArbitrary`
    - Used by all property-based tests across the cart packages
    - _Requirements: (testing infrastructure)_

- [x] 20. Final checkpoint - Ensure all tests pass across all packages
  - Ensure all tests pass across `@cart/core`, `@cart/react`, `@cart/ui`, and
    `@cart/plugins`, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document
- Unit tests validate specific examples and edge cases
- All property-based tests use `fast-check` with minimum 100 iterations
- The `@cart/core` package has zero runtime dependencies — all framework
  bindings are in separate packages
