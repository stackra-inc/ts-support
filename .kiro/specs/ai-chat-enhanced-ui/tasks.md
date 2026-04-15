# Implementation Plan: AI Chat Enhanced UI

## Overview

This plan transforms the existing plain-text AI chat panel into a rich,
interactive assistant with markdown rendering, tool call cards, approval flow,
walkthrough overlays, UI navigation, full POS context awareness, and answer
caching. Tasks are ordered so each builds on the previous, with frontend and
backend interleaved where dependencies exist.

## Tasks

- [x] 1. Define shared types and install dependencies
  - [x] 1.1 Install frontend dependencies (react-markdown, rehype-sanitize,
        remark-gfm) in `apps/vite-template`
    - Run `npm install react-markdown rehype-sanitize remark-gfm` in the
      vite-template package
    - _Requirements: 1.1_

  - [x] 1.2 Create `ChatMessage` discriminated union types in
        `apps/vite-template/src/contexts/ai-sidekick/chat-types.ts`
    - Define `UserMessage`, `AssistantMessage`, `ToolCallMessage`,
      `ToolResultMessage`, `NavigationMessage`, `SystemMessage` interfaces per
      the design
    - Export the `ChatMessage` union type and `WalkthroughStep` interface
    - _Requirements: 6.4, 2.1, 5.2, 5.4_

  - [x] 1.3 Extend WebSocket protocol types in
        `packages/ai-gateway/src/types.ts`
    - Add `"tool-call"`, `"tool-result"`, `"cached-response"` to
      `WSServerMessage.type`
    - Add `"tool-result"` to `WSClientMessage.type`
    - Add corresponding typed entries to `ServerMessage` and `ClientMessage`
      discriminated unions
    - Keep existing message types unchanged for backward compatibility
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 2. Backend: UI tools and answer cache service
  - [x] 2.1 Create `packages/ai-gateway/src/tools/ui-tools.ts` with `navigateUI`
        and `startWalkthrough` tool definitions
    - Define Zod schemas for parameters per the design
    - Set trustLevel "low", roles ["cashier"], stub handlers returning
      `{ success: true, message: "Frontend-executed tool" }`
    - _Requirements: 9.1, 9.4, 10.1, 10.2_

  - [ ]\* 2.2 Write property test for walkthrough step schema validation
    - **Property 22: Walkthrough step schema validation**
    - **Validates: Requirements 10.2**

  - [x] 2.3 Register UI tools in `packages/ai-gateway/src/index.ts`
    - Import `uiTools` from `./tools/ui-tools.js` and add to the
      `registerAllTools` function
    - _Requirements: 9.1, 10.1_

  - [x] 2.4 Create `packages/ai-gateway/src/answer-cache-service.ts`
    - Implement `AnswerCacheService` class with `findSimilar`, `store`, `list`,
      `update`, `delete`, `refreshStale` methods
    - Use pgvector cosine similarity search scoped by tenant_id
    - Configurable similarity threshold (default 0.92) and TTL (default 30 days)
    - _Requirements: 12.1, 12.2, 12.3, 12.5, 12.6, 12.7_

  - [ ]\* 2.5 Write property tests for answer cache service
    - **Property 25: Answer cache returns only same-tenant results**
    - **Property 26: Cache hit above threshold returns cached answer with flag**
    - **Property 28: Stale cache entries are refreshed after TTL**
    - **Property 29: Factual responses are cached in the knowledge base**
    - **Validates: Requirements 12.1, 12.3, 12.5, 12.7**

  - [x] 2.6 Create the `answer_cache` database table schema in
        `packages/ai-gateway/src/schema.sql`
    - Add CREATE TABLE with id, tenant_id, question, answer, question_embedding,
      hit_count, created_at, updated_at
    - Add ivfflat index on question_embedding for cosine similarity search
    - Add index on tenant_id and stale entry index on (tenant_id, updated_at)
    - _Requirements: 12.1, 12.5_

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Backend: WebSocket protocol extensions and cache integration
  - [x] 4.1 Extend `WSServer.handleChat` in
        `packages/ai-gateway/src/ws-server.ts` to emit `tool-call` and
        `tool-result` messages
    - When the LLM invokes a tool, send a `tool-call` message with toolCallId,
      toolName, args, trustLevel, requiresApproval, and frontendExecutable flags
    - When a tool execution completes, send a `tool-result` message with
      toolCallId, success, data/error
    - For high-trust tools, set `requiresApproval: true` in the tool-call
      payload
    - For `navigateUI` and `startWalkthrough`, set `frontendExecutable: true`
    - _Requirements: 8.1, 8.2, 8.5, 2.5_

  - [ ]\* 4.2 Write property tests for WebSocket protocol messages
    - **Property 6: Gateway tool-call messages contain all required fields**
    - **Property 20: Gateway tool-result messages contain required fields**
    - **Validates: Requirements 2.5, 8.1, 8.2, 8.5**

  - [x] 4.3 Handle incoming `tool-result` client messages in
        `WSServer.handleMessage`
    - Add case for `"tool-result"` in the message router to accept frontend tool
      execution results
    - Inject the result back into the LLM conversation history so the model sees
      the tool output
    - _Requirements: 8.4_

  - [x] 4.4 Integrate `AnswerCacheService` into `WSServer.handleChat`
    - Before sending to LLM, call `answerCache.findSimilar()` for the tenant
    - On cache hit, send a `cached-response` message directly and skip LLM
      invocation
    - On cache miss, proceed with LLM and store factual responses via
      `answerCache.store()`
    - _Requirements: 12.2, 12.3_

  - [x] 4.5 Wire `AnswerCacheService` into the gateway entry point
        (`packages/ai-gateway/src/index.ts`)
    - Instantiate `AnswerCacheService` with the DB pool and LLM service
    - Pass it to `WSServer` and `createApp` deps
    - Add REST endpoints for admin cache management (list, update, delete)
    - _Requirements: 12.6_

- [x] 5. Backend: Enhanced prompt builder and POS tool handlers
  - [x] 5.1 Extend `PromptBuilder.build` to include full UI context snapshot
    - Accept extended `posContext` with route, openDrawers, selectedEvent,
      sidebarCollapsed, darkMode, terminalId, currency, language
    - Format the full UI context in the system prompt so the LLM understands the
      cashier's current screen state
    - _Requirements: 7.3, 11.3_

  - [ ]\* 5.2 Write property test for prompt builder UI context inclusion
    - **Property 18: Prompt builder includes full UI context snapshot**
    - **Validates: Requirements 7.3, 11.3**

  - [x] 5.3 Wire stub POS tool handlers to real operations in
        `packages/ai-gateway/src/tools/pos-tools.ts`
    - Implement `applyPromoCode` handler to apply promo to cart and return
      updated total
    - Implement `holdCart` handler to place cart on hold and return confirmation
    - Implement `resumeCart` handler to resume held cart and set as active
    - Add proper error handling: return `{ success: false, error, code }` for
      invalid arguments
    - All handlers return `{ success: boolean, message: string, data? }`
      contract
    - _Requirements: 4.2, 4.3, 4.4, 4.9, 4.10_

  - [x] 5.4 Wire stub customer and inventory tool handlers
    - Implement `lookupCustomer` handler to search customer data by
      name/email/phone
    - Implement `checkStock` handler to query inventory and return stock level
    - _Requirements: 4.5, 4.6_

  - [x] 5.5 Wire stub high-trust tool handlers (processRefund, voidTransaction)
    - Implement `processRefund` handler to initiate refund workflow
    - Implement `voidTransaction` handler to void transaction workflow
    - Both return structured result with success/error
    - _Requirements: 4.7, 4.8_

  - [ ]\* 5.6 Write property tests for tool handler contracts
    - **Property 10: Tool handler result contract**
    - **Property 11: Hold/resume cart round-trip**
    - **Property 12: toggleDarkMode inverts theme state**
    - **Property 13: Customer lookup returns only matching records**
    - **Validates: Requirements 4.1, 4.3, 4.4, 4.5, 4.9, 4.10**

  - [ ]\* 5.7 Write property test for session reconnect
    - **Property 30: Session reconnect preserves conversation history**
    - **Validates: Requirements 6.5**

- [x] 6. Checkpoint — Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Frontend: Message store and enhanced provider
  - [x] 7.1 Add `messages: ChatMessage[]` state and message store logic to
        `AISidekickProvider`
    - Replace the simple `chatTokens: string` with a `messages` array of
      `ChatMessage` objects
    - Add `isStreaming`, `streamingMessageId`, `pendingApprovalId`, and
      `walkthrough` state
    - Expose `messages`, `addMessage`, `updateMessage` via context value
    - Messages persist in React state for the browser session (cleared on
      refresh)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 7.2 Update `useAIGatewaySocket` callbacks to populate the message store
    - On `token` messages: create/update an `AssistantMessage` in the store
    - On `tool-call` messages: create a `ToolCallMessage` in the store
    - On `tool-result` messages: update the corresponding `ToolCallMessage`
      status and result
    - On `cached-response` messages: create an `AssistantMessage` with
      `cached: true`
    - On `error` messages: create a `SystemMessage` with variant "error"
    - On connection status changes: create `SystemMessage` entries for
      disconnect/reconnect
    - _Requirements: 2.1, 2.3, 2.4, 5.2, 5.4, 5.5, 12.4_

  - [ ]\* 7.3 Write property tests for message store
    - **Property 3: Tool-call messages are created from WebSocket tool-call
      events**
    - **Property 4: Tool result updates the corresponding tool-call message
      status**
    - **Property 14: Connection state transitions produce system messages**
    - **Property 15: Chat history persists across panel close/reopen**
    - **Property 16: Message store accepts all ChatMessage types**
    - **Validates: Requirements 2.1, 2.3, 2.4, 5.4, 5.5, 6.1, 6.2, 6.4**

- [x] 8. Frontend: UIContextCollector and FrontendToolExecutor
  - [x] 8.1 Create `useUIContextCollector` hook in
        `apps/vite-template/src/contexts/ai-sidekick/ui-context-collector.ts`
    - Aggregate state from `usePOS()`, `useLocation()`, and `useDrawerStack()`
    - Build `UIContextSnapshot` with route, activeCart, assignedCustomer,
      selectedEvent, openDrawers, sidebarCollapsed, darkMode, terminalId,
      currency, language
    - Debounce changes at 500ms before sending via
      `gateway.sendPosStateUpdate()`
    - Exclude sensitive data (payment card numbers, auth tokens)
    - _Requirements: 7.1, 7.2, 11.1, 11.2, 11.5_

  - [ ]\* 8.2 Write property tests for UI context collector
    - **Property 17: UI context changes trigger debounced pos-state-update**
    - **Property 19: UI context snapshot contains all required fields and
      excludes sensitive data**
    - **Validates: Requirements 7.1, 7.2, 11.1, 11.2, 11.5**

  - [x] 8.3 Create `FrontendToolExecutor` in
        `apps/vite-template/src/contexts/ai-sidekick/frontend-tool-executor.ts`
    - Implement `navigateUI` handler: use drawer stack `push()` to open drawers,
      `scrollIntoView()` for sections, temporary CSS highlight class for
      elements
    - Implement `startWalkthrough` handler: set walkthrough state in provider to
      trigger overlay
    - Send `tool-result` message back to gateway after execution
    - _Requirements: 9.2, 9.3, 9.5, 10.1_

  - [ ]\* 8.4 Write property test for navigateUI executor
    - **Property 21: NavigateUI executor opens correct drawer and returns
      confirmation**
    - **Validates: Requirements 9.2, 9.5**

  - [x] 8.5 Integrate `useUIContextCollector` and `FrontendToolExecutor` into
        `AISidekickProvider`
    - Call `useUIContextCollector` inside the provider to start collecting
      context
    - Intercept incoming `tool-call` messages with `frontendExecutable: true`
      and route to `FrontendToolExecutor`
    - _Requirements: 7.1, 9.2, 10.1, 11.2_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Frontend: MarkdownRenderer component
  - [x] 10.1 Create `MarkdownRenderer` component in
        `apps/vite-template/src/components/ai-sidekick/markdown-renderer.tsx`
    - Use `react-markdown` with `rehype-sanitize` for XSS prevention and
      `remark-gfm` for GFM support
    - Custom component overrides for `code` (monospace + dark bg), `a`
      (target="\_blank", rel="noopener noreferrer"), `pre` (distinct background)
    - Use `React.memo` with content comparison to avoid re-renders of completed
      bubbles
    - Accept `content` and `isStreaming` props
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]\* 10.2 Write property tests for MarkdownRenderer
    - **Property 1: Markdown renders all syntax elements as correct HTML**
    - **Property 2: Markdown sanitization removes XSS vectors**
    - **Validates: Requirements 1.1, 1.3, 1.4**

- [x] 11. Frontend: ToolCallCard and ApprovalCard components
  - [x] 11.1 Create `ToolCallCard` component in
        `apps/vite-template/src/components/ai-sidekick/tool-call-card.tsx`
    - Display tool name, summarized arguments, status badge
      (spinner/checkmark/X)
    - Expandable result section on success, error message on failure
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 11.2 Create `ApprovalCard` component in
        `apps/vite-template/src/components/ai-sidekick/approval-card.tsx`
    - Warning-styled card with tool name, action description, monetary amounts
      highlighted
    - Approve (green) and Reject (red) buttons, disabled when not pending
    - Timer indicator for remaining approval time
    - On approve: send "approve" message via WebSocket; on reject: send "reject"
      message
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]\* 11.3 Write property tests for tool cards and approval flow
    - **Property 5: Tool-related cards display all required information**
    - **Property 7: High-trust tool calls render as ApprovalCards**
    - **Property 8: Approval actions send correct WebSocket messages**
    - **Property 9: Pending approval disables chat input**
    - **Validates: Requirements 2.2, 3.1, 3.2, 3.3, 3.4, 3.6**

- [x] 12. Frontend: NavigationCard and WalkthroughOverlay components
  - [x] 12.1 Create `NavigationCard` component in
        `apps/vite-template/src/components/ai-sidekick/navigation-card.tsx`
    - Display navigation target description with icon
    - "Go There" button that re-executes navigation if drawer was closed
    - _Requirements: 9.6_

  - [x] 12.2 Create `WalkthroughOverlay` component in
        `apps/vite-template/src/components/ai-sidekick/walkthrough-overlay.tsx`
    - React portal attached to `document.body`
    - SVG mask overlay with spotlight cutout around target element via
      `getBoundingClientRect()` + `ResizeObserver`
    - Popover anchored to target with title, description, action hint, step
      counter, Next/Back/Skip/Done buttons
    - Escape key dismisses walkthrough
    - Skip steps where target selector doesn't match any DOM element
    - _Requirements: 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10_

  - [ ]\* 12.3 Write property tests for walkthrough overlay
    - **Property 23: Walkthrough navigation advances and retreats correctly**
    - **Property 24: Walkthrough popover displays all required elements**
    - **Validates: Requirements 10.4, 10.5, 10.6, 10.7**

- [x] 13. Frontend: Enhanced ChatPanel wiring
  - [x] 13.1 Rewrite `AIChatPanel` in
        `apps/vite-template/src/components/overlays/ai-chat.tsx` to use the
        message store
    - Replace local `messages` state with `messages` from `useAISidekick()`
      context
    - Render `ChatMessage` variants: `UserBubble`, `AssistantBubble` (with
      `MarkdownRenderer`), `ToolCallCard`, `ApprovalCard`, `NavigationCard`,
      `SystemNotification`, `TypingIndicator`
    - Disable chat input when a pending approval exists
    - Display connection status indicator in header
    - Display cached response indicator (lightning bolt) for `cached: true`
      messages
    - Remove simulated fallback responses (all responses now come from the
      gateway or message store)
    - _Requirements: 1.1, 1.5, 2.1, 3.1, 3.6, 5.1, 5.2, 5.3, 9.6, 12.4_

  - [ ]\* 13.2 Write property test for cached response indicator
    - **Property 27: Cached response indicator in chat UI**
    - **Validates: Requirements 12.4**

  - [x] 13.3 Wire `WalkthroughOverlay` into the chat panel / layout
    - When walkthrough state is active in the provider, render
      `WalkthroughOverlay` as a portal
    - On walkthrough complete, add a completion message to the message store
    - On walkthrough skip, dismiss overlay and remove highlights
    - _Requirements: 10.3, 10.7, 10.8_

- [x] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document (30 total)
- Frontend and backend tasks are interleaved where dependencies exist (e.g.,
  protocol types before message handling)
- The existing `useAIGatewaySocket` hook, `TrustGate`, `ToolRegistry`, and
  `RAGService` are extended, not replaced
