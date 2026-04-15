# Implementation Plan: AI Gateway Backend

## Overview

Incrementally build the `packages/ai-gateway/` service — starting with project
scaffolding and core types, then layering in each component (config, auth,
sessions, tools, LLM, trust gate, RAG, prompts, suggestions, admin API,
WebSocket server) and wiring everything together. Each task builds on the
previous ones so there is no orphaned code.

## Tasks

- [x] 1. Scaffold package and core types
  - [x] 1.1 Create `packages/ai-gateway/` with `package.json`, `tsconfig.json`,
        `tsup.config.ts`, `vitest.config.ts`
    - Add dependencies: `ai`, `@ai-sdk/openai`, `hono`, `ws`, `zod`, `pg`,
      `pgvector`
    - Add devDependencies: `vitest`, `fast-check`, `@types/ws`, `@types/pg`,
      `tsup`, `typescript`
    - Configure tsup for ESM + CJS output, vitest for the `__tests__/` directory
    - _Requirements: 1.1_

  - [x] 1.2 Define shared types and interfaces in `src/types.ts`
    - `AuthContext`, `TrustLevel`, `WSClientMessage`, `WSServerMessage`,
      `ClientMessage`, `ServerMessage` union types
    - `Session`, `PendingApproval`, `ToolDefinition`, `ToolContext`,
      `DocumentChunk`, `AuditEntry`
    - `RateLimiterConfig`, environment variable config type
    - Ensure `Suggestion` and `AutomationEvent` types match the frontend
      `types.ts` exactly
    - _Requirements: 5.4, 11.3_

  - [x] 1.3 Create `src/config.ts` — environment variable loader with Zod
        validation
    - Parse and validate `OPENAI_API_KEY`, `DATABASE_URL` (required), plus
      optional vars with defaults (`WS_PORT`, `HTTP_PORT`, `RATE_LIMIT_LLM`,
      `RATE_LIMIT_TOOL`, `RATE_LIMIT_WS`, `MAX_HISTORY_TOKENS`,
      `APPROVAL_TIMEOUT_MS`)
    - Throw descriptive error naming missing required variables
    - _Requirements: 1.2, 1.3_

  - [ ]\* 1.4 Write property test for config loader
    - **Property 1: Configuration loading validates required environment
      variables**
    - **Validates: Requirements 1.2, 1.3**

- [x] 2. Implement Auth Middleware
  - [x] 2.1 Create `src/auth.ts` — shared authentication for WebSocket and HTTP
    - `authenticate(tenantToken, userToken)` → `AuthContext` or throws
    - Token validation logic (decode, verify tenant/user, extract role)
    - _Requirements: 5.2, 5.3, 6.3, 6.4, 10.1_

  - [ ]\* 2.2 Write property test for WebSocket authentication
    - **Property 8: WebSocket authentication**
    - **Validates: Requirements 5.2, 5.3**

  - [ ]\* 2.3 Write property test for REST API authentication enforcement
    - **Property 22: REST API authentication enforcement**
    - **Validates: Requirements 6.3, 6.4**

- [x] 3. Implement Rate Limiter
  - [x] 3.1 Create `src/rate-limiter.ts` — per-tenant sliding window rate
        limiter
    - In-memory `Map<tenantId, SlidingWindowCounter>` per category (`llm`,
      `tool`, `ws`)
    - `check(tenantId, category)` → boolean, `remaining(tenantId, category)` →
      number
    - Configurable thresholds from `RateLimiterConfig`
    - _Requirements: 10.4, 10.5_

  - [ ]\* 3.2 Write property test for rate limiter
    - **Property 17: Rate limiter enforces per-tenant thresholds**
    - **Validates: Requirements 10.4, 10.5**

- [x] 4. Implement Session Manager
  - [x] 4.1 Create `src/session-manager.ts` — in-memory session store with TTL
    - `create(auth)`, `get(sessionId)`, `resume(sessionId)`,
      `destroy(sessionId)`
    - Session key: `${tenantId}:${userId}:${terminalId}`
    - 5-minute reconnect window after disconnect, cleanup of expired sessions
    - `trimHistory(session, maxTokens)` — summarize older messages when token
      limit exceeded
    - Store `pendingApprovals` and `delegationPreferences` per session
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 5.6_

  - [ ]\* 4.2 Write property tests for session manager
    - **Property 9: Session reconnection within window**
    - **Property 11: Conversation history respects token limit**
    - **Property 12: Session cleared on logout**
    - **Property 13: Session tenant isolation**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5, 5.6**

- [x] 5. Implement Tool Registry and Tool Catalog
  - [x] 5.1 Create `src/tool-registry.ts` — central tool registry
    - `register(definition)`, `get(name)`, `getForRole(role)`,
      `toAITools(role)`, `validateArgs(name, args)`
    - Zod schema validation on invocation, structured error on failure
    - Convert registered tools to Vercel AI SDK `tool()` format
    - _Requirements: 3.1, 3.8, 3.9_

  - [x] 5.2 Create `src/tools/pos-tools.ts` — POS tool definitions
    - `mergeCarts` (medium), `applyPromoCode` (low), `applyMemberDiscount`
      (medium), `holdCart` (low), `resumeCart` (low), `processRefund` (high),
      `voidTransaction` (high), `assignSeat` (medium)
    - Each with Zod parameter schema, trust level, roles, and stub handler
    - _Requirements: 3.2, 3.10_

  - [x] 5.3 Create `src/tools/customer-tools.ts` — Customer tool definitions
    - `lookupCustomer` (low), `getCustomerHistory` (low), `getLoyaltyStatus`
      (low)
    - _Requirements: 3.3_

  - [x] 5.4 Create `src/tools/inventory-tools.ts` — Inventory/catalog tool
        definitions
    - `checkStock` (low), `getEventDetails` (low), `suggestUpsell` (low)
    - _Requirements: 3.4_

  - [x] 5.5 Create `src/tools/admin-tools.ts` — Admin tool definitions
    - `createCoupon` (medium), `createEvent` (medium), `updatePricing` (high),
      `getAnalytics` (low)
    - _Requirements: 3.5, 3.10_

  - [x] 5.6 Create `src/tools/external-tools.ts` — External intelligence tool
        definitions
    - `getWeather` (low), `getSeasonalTrends` (low), `getLocalEvents` (low),
      `getHolidayCalendar` (low)
    - _Requirements: 3.6_

  - [x] 5.7 Create `src/tools/knowledge-tools.ts` — Knowledge base tool
        definitions
    - `searchKnowledgeBase` (low), `getVenueInfo` (low)
    - These will call into the RAG service (wired in a later task)
    - _Requirements: 3.7_

  - [ ]\* 5.8 Write property tests for tool registry
    - **Property 2: Tool registry schema invariant**
    - **Property 3: Tool input validation gates execution**
    - **Property 4: LLM tool call dispatch**
    - **Validates: Requirements 3.1, 3.8, 3.9, 2.5, 2.6**

- [x] 6. Checkpoint — Verify core components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Audit Logger
  - [x] 7.1 Create `src/audit-logger.ts` — append-only, tenant-scoped audit
        trail
    - `log(entry)` — insert into `audit_log` table (PII redacted)
    - `query(tenantId, filters)` — query audit entries with optional
      tool/user/date filters
    - In-memory buffer for writes during DB outage, flush on reconnect
    - _Requirements: 10.6, 10.7_

  - [ ]\* 7.2 Write property test for audit logger
    - **Property 18: Audit log records every tool execution with tenant scope**
    - **Validates: Requirements 10.6, 10.7**

- [x] 8. Implement Trust Level Gate
  - [x] 8.1 Create `src/trust-gate.ts` — intercepts tool calls and enforces
        trust policies
    - For low/medium trust: execute tool immediately via registry
    - For high trust: send approval request to client via `sendToClient`, create
      `PendingApproval` in session, await approval/rejection/timeout (60s)
    - On approval: execute tool, return result
    - On rejection or timeout: return rejection result to LLM
    - Log all executions via audit logger
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]\* 8.2 Write property test for trust gate
    - **Property 7: Trust level gate enforcement**
    - **Validates: Requirements 4.1, 4.3, 4.4, 4.5**

  - [ ]\* 8.3 Write property test for tool error handling
    - **Property 21: Tool error handling and audit logging**
    - **Validates: Requirements 12.2, 12.3**

- [x] 9. Implement LLM Service
  - [x] 9.1 Create `src/llm-service.ts` — Vercel AI SDK wrapper
    - `stream(params)` — `streamText` with tool calling support, primary GPT-4o
      with 30s timeout, fallback to GPT-4o-mini on error
    - `generate(params)` — `generateText` for summarization and admin sync
      responses
    - `embed(text)` — generate 1536-dim embeddings via OpenAI embeddings API
    - Wire `onToolCall` callback through trust gate for tool execution
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]\* 9.2 Write property tests for LLM service
    - **Property 5: LLM fallback on primary provider failure**
    - **Property 6: Streaming delivers incremental tokens**
    - **Validates: Requirements 2.3, 2.4**

- [x] 10. Implement RAG Service and Database Schema
  - [x] 10.1 Create `src/db.ts` — PostgreSQL connection pool (Neon serverless)
        with reconnection and exponential backoff
    - _Requirements: 12.5_

  - [x] 10.2 Create `src/schema.sql` — PostgreSQL schema with pgvector extension
    - `knowledge_chunks` table with `vector(1536)` embedding column,
      tenant-scoped indexes
    - `audit_log` table with tenant-scoped indexes
    - `rate_limits` table (DB fallback)
    - _Requirements: 9.1_

  - [x] 10.3 Create `src/rag-service.ts` — document ingestion, chunking,
        embedding, and semantic search
    - `ingest(tenantId, content, metadata)` — split document into chunks, embed
      each, store in `knowledge_chunks`
    - `search(tenantId, query, topK)` — cosine similarity search scoped by
      `tenant_id`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]\* 10.4 Write property tests for RAG service
    - **Property 14: Knowledge base document ingestion round-trip**
    - **Property 15: Knowledge base tenant isolation**
    - **Property 16: Document ingestion produces chunks with embeddings**
    - **Validates: Requirements 9.2, 9.4, 9.6, 9.7**

- [x] 11. Implement System Prompt Builder
  - [x] 11.1 Create `src/prompt-builder.ts` — role-specific, tenant-aware system
        prompt construction
    - `build(params)` — assemble system prompt from role, tenant context,
      available tools, cart context
    - Cashier prompt: POS-focused instructions, POS/customer tools, cart context
    - Admin prompt: dashboard-focused instructions, admin/analytics tools, venue
      management context
    - Include tenant-specific context from RAG (venue name, policies, features)
    - Instruct LLM to provide reasoning and respect trust levels
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]\* 11.2 Write property test for prompt builder
    - **Property 10: System prompt role-based scoping**
    - **Property 23: Admin chat uses admin-scoped prompt and tools**
    - **Validates: Requirements 7.1, 7.2, 7.3, 6.2**

- [x] 12. Checkpoint — Verify all services
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement WebSocket Server
  - [x] 13.1 Create `src/ws-server.ts` — WebSocket server for POS terminal
        connections
    - Connection handshake: authenticate via query params (`tenantToken`,
      `userToken`)
    - On auth failure: close with code 4001 and descriptive error
    - On connect: create/resume session, map connection to session
    - Handle incoming `ClientMessage` types: `chat`, `pos-state-update`,
      `approve`, `reject`, `dismiss`, `delegation-change`
    - For `chat`: append to session history, build prompt, stream LLM response
      as `token` messages, send `stream-end`
    - For `pos-state-update`: update session context, evaluate for proactive
      suggestions
    - For `approve`/`reject`: resolve pending approval in session
    - For `delegation-change`: update session delegation preferences
    - On disconnect: preserve session for 5-minute reconnect window
    - Rate limit incoming messages via rate limiter
    - Support concurrent connections per tenant
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 11.1_

  - [ ]\* 13.2 Write property test for suggestion format
    - **Property 19: Suggestion format compatibility with frontend types**
    - **Validates: Requirements 11.2, 11.3**

  - [ ]\* 13.3 Write property test for suggestion routing
    - **Property 20: Suggestion routing respects delegation and trust level**
    - **Validates: Requirements 11.4, 11.5**

- [x] 14. Implement Hono HTTP Server (Admin API)
  - [x] 14.1 Create `src/server.ts` — Hono HTTP server with admin REST endpoints
    - `POST /api/admin/chat` — SSE streaming admin chat (auth required)
    - `POST /api/admin/chat/sync` — full JSON response admin chat (auth
      required)
    - `POST /api/knowledge/ingest` — ingest document into knowledge base (auth
      required)
    - `GET /api/knowledge/search` — search knowledge base (auth required)
    - `GET /api/health` — health check (no auth)
    - Auth middleware: parse `Authorization: Bearer <tenantToken>:<userToken>`,
      validate via auth module
    - On auth failure: HTTP 401 with structured error body
    - Admin chat uses admin-scoped prompt and admin-only tools
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 9.5_

- [x] 15. Wire everything together and create entry point
  - [x] 15.1 Create `src/index.ts` — main entry point
    - Load config, initialize DB pool, create all service instances
    - Register all 24 tools in the tool registry
    - Wire knowledge tools to RAG service
    - Start Hono HTTP server and WebSocket server on configured ports
    - Validate LLM provider and DB connectivity on startup, log status
    - Implement graceful shutdown on SIGTERM: stop accepting connections, close
      WebSocket clients, wait for in-flight requests (10s), flush audit buffer,
      exit 0
    - _Requirements: 1.4, 1.5, 12.4_

  - [x] 15.2 Wire tool execution pipeline end-to-end
    - LLM tool call → trust gate → tool registry (validate + execute) → audit
      log → result back to LLM
    - Ensure unknown tool names return error result to LLM
    - Ensure tool handler errors are caught, logged, and returned as structured
      errors
    - _Requirements: 2.5, 2.6, 12.2, 12.3_

- [x] 16. Final checkpoint — Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document
- All 24 tools start with stub handlers — real POS/DB integrations are wired
  later when the data layer is available
- The frontend `Suggestion` and `AutomationEvent` types in
  `apps/vite-template/src/contexts/ai-sidekick/types.ts` are the source of truth
  for message format compatibility
