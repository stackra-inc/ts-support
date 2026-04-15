# Requirements Document

## Introduction

The AI Gateway Backend is the server-side AI engine that powers the AI Sidekick
feature in the venue management POS SaaS platform. The frontend already has a
complete AI Sidekick UI layer (provider, suggestion popup, delegation toggles,
capabilities panel) but currently has no real AI backend — suggestions are not
generated and no LLM reasoning occurs. This backend service bridges that gap by
providing an LLM-powered inference engine, a tool system for POS operations, a
RAG knowledge base for venue-specific information, real-time WebSocket
communication, and multi-tenant security isolation. It is deployed as a new
`packages/ai-gateway/` package in the existing turborepo monorepo.

## Glossary

- **AI_Gateway**: The Node.js/TypeScript backend service that receives requests
  from POS terminals and the admin dashboard, orchestrates LLM calls, executes
  tools, and streams responses back to clients.
- **LLM_Provider**: An external large language model API (OpenAI GPT-4o primary,
  GPT-4o-mini fallback) accessed via the Vercel AI SDK.
- **Tool**: A callable function registered with the LLM that performs a specific
  POS, customer, inventory, admin, or external intelligence operation. Tools
  follow an MCP-style definition pattern with name, description, parameter
  schema, and trust level.
- **Tool_Registry**: The server-side registry that maps tool names to their
  implementations, parameter schemas, trust levels, and tenant availability.
- **Trust_Level**: A classification of a tool's risk: "low" (safe to
  auto-execute), "medium" (automatable with caution), or "high" (requires
  explicit user approval regardless of delegation setting).
- **Tenant**: A venue organization in the multi-tenant SaaS platform, identified
  by a unique tenant identifier. Each tenant has isolated configuration, data,
  and AI context.
- **Session**: A per-terminal, per-shift conversation context that maintains
  message history and state between the AI_Gateway and a connected POS terminal.
  Cleared on user logout.
- **System_Prompt**: A role-based and tenant-specific instruction set injected
  into each LLM call to guide the AI's behavior, tone, and available
  capabilities.
- **Knowledge_Base**: A vector store of venue-specific documents (refund
  policies, event descriptions, SOPs, FAQs) searchable via semantic similarity
  using OpenAI embeddings and pgvector.
- **Suggestion**: An AI-generated recommendation pushed from the AI_Gateway to a
  connected POS terminal via WebSocket, containing an action type, description,
  reasoning, and payload.
- **WebSocket_Connection**: A persistent bidirectional channel between a POS
  terminal's AISidekickProvider and the AI_Gateway for real-time suggestion
  streaming and event feedback.
- **Admin_API**: REST endpoints exposed by the AI_Gateway for admin dashboard
  interactions such as analytics queries, coupon creation, and event management.
- **Vercel_AI_SDK**: The `ai` npm package (from ai-sdk.dev) used to interface
  with LLM providers, manage streaming responses, and define tool schemas.
- **RAG**: Retrieval-Augmented Generation — the pattern of retrieving relevant
  documents from the Knowledge_Base and injecting them into the LLM context
  before generating a response.
- **Hono**: The lightweight, TypeScript-first HTTP framework used for the
  AI_Gateway's REST API layer.

## Requirements

### Requirement 1: AI Gateway Server Initialization and Configuration

**User Story:** As a platform operator, I want the AI Gateway to start as a
configured Node.js service within the monorepo, so that it can serve AI-powered
features to all connected POS terminals and admin dashboards.

#### Acceptance Criteria

1. THE AI_Gateway SHALL be implemented as a Node.js/TypeScript package at
   `packages/ai-gateway/` in the turborepo monorepo, following the existing
   package conventions (tsup build, vitest tests, TypeScript strict mode).
2. WHEN the AI_Gateway starts, THE AI_Gateway SHALL load configuration from
   environment variables for LLM API keys, database connection strings,
   WebSocket port, and rate limit thresholds.
3. IF a required environment variable is missing at startup, THEN THE AI_Gateway
   SHALL log a descriptive error message and exit with a non-zero status code.
4. THE AI_Gateway SHALL expose an HTTP server using the Hono framework for REST
   endpoints and a WebSocket server for real-time communication on configurable
   ports.
5. WHEN the AI_Gateway starts, THE AI_Gateway SHALL validate connectivity to the
   LLM_Provider and the PostgreSQL database, logging the status of each
   dependency.

### Requirement 2: LLM Provider Integration via Vercel AI SDK

**User Story:** As a developer, I want the AI Gateway to use the Vercel AI SDK
to call LLM providers, so that I get streaming responses, tool calling, and
provider abstraction out of the box.

#### Acceptance Criteria

1. THE AI_Gateway SHALL use the Vercel AI SDK (`ai` package) to send prompts to
   and receive responses from the LLM_Provider.
2. THE AI_Gateway SHALL use OpenAI GPT-4o as the primary LLM_Provider for all
   inference requests.
3. WHEN the primary LLM_Provider returns an error or times out after 30 seconds,
   THE AI_Gateway SHALL retry the request once using GPT-4o-mini as a
   cost-optimized fallback.
4. THE AI_Gateway SHALL stream LLM responses token-by-token to connected clients
   via the WebSocket_Connection, rather than waiting for the full response.
5. WHEN the LLM_Provider invokes a tool call in its response, THE AI_Gateway
   SHALL parse the tool name and arguments, execute the corresponding Tool from
   the Tool_Registry, and return the tool result to the LLM_Provider for
   continued reasoning.
6. IF the LLM_Provider invokes a tool that does not exist in the Tool_Registry,
   THEN THE AI_Gateway SHALL return an error result to the LLM_Provider
   indicating the tool is unavailable.

### Requirement 3: Tool System (MCP-Style Tool Registry)

**User Story:** As a developer, I want a structured tool registry that defines
all POS, customer, inventory, admin, and external intelligence tools, so that
the LLM can interact with the POS system through well-defined, schema-validated
interfaces.

#### Acceptance Criteria

1. THE Tool_Registry SHALL define each Tool with a unique name, human-readable
   description, JSON Schema for input parameters, Trust_Level, and an async
   handler function.
2. THE Tool_Registry SHALL include POS tools: `mergeCarts`, `applyPromoCode`,
   `applyMemberDiscount`, `holdCart`, `resumeCart`, `processRefund`,
   `voidTransaction`, and `assignSeat`.
3. THE Tool_Registry SHALL include customer tools: `lookupCustomer`,
   `getCustomerHistory`, and `getLoyaltyStatus`.
4. THE Tool_Registry SHALL include inventory and catalog tools: `checkStock`,
   `getEventDetails`, and `suggestUpsell`.
5. THE Tool_Registry SHALL include admin tools: `createCoupon`, `createEvent`,
   `updatePricing`, and `getAnalytics`.
6. THE Tool_Registry SHALL include external intelligence tools: `getWeather`,
   `getSeasonalTrends`, `getLocalEvents`, and `getHolidayCalendar`.
7. THE Tool_Registry SHALL include knowledge base tools: `searchKnowledgeBase`
   and `getVenueInfo`.
8. WHEN a Tool is invoked, THE AI_Gateway SHALL validate the input arguments
   against the Tool's JSON Schema before executing the handler.
9. IF input validation fails for a Tool invocation, THEN THE AI_Gateway SHALL
   return a structured error describing which parameters are invalid without
   executing the handler.
10. THE Tool_Registry SHALL assign Trust_Level "high" to `processRefund`,
    `voidTransaction`, and `updatePricing`, requiring explicit user approval
    before execution regardless of delegation settings.

### Requirement 4: Trust Level Enforcement

**User Story:** As a platform operator, I want high-risk tools to require
explicit user approval before execution, so that sensitive operations like
refunds and price changes cannot be auto-executed by the AI.

#### Acceptance Criteria

1. WHEN the LLM_Provider invokes a Tool with Trust_Level "high", THE AI_Gateway
   SHALL pause execution and send an approval request to the connected POS
   terminal via the WebSocket_Connection.
2. WHILE an approval request is pending for a high-trust Tool, THE AI_Gateway
   SHALL hold the LLM conversation state and resume only after receiving an
   approval or rejection from the user.
3. WHEN the user approves a high-trust Tool execution, THE AI_Gateway SHALL
   execute the Tool and return the result to the LLM_Provider.
4. WHEN the user rejects a high-trust Tool execution, THE AI_Gateway SHALL
   return a rejection result to the LLM_Provider indicating the user declined
   the action.
5. IF an approval request receives no response within 60 seconds, THEN THE
   AI_Gateway SHALL treat the request as rejected and inform the LLM_Provider.

### Requirement 5: WebSocket Real-Time Communication

**User Story:** As a cashier, I want the AI Sidekick to push suggestions to my
POS terminal in real time, so that I receive contextual help without polling or
page refreshes.

#### Acceptance Criteria

1. THE AI_Gateway SHALL expose a WebSocket endpoint that POS terminals connect
   to for bidirectional real-time communication.
2. WHEN a POS terminal establishes a WebSocket_Connection, THE AI_Gateway SHALL
   authenticate the connection using the tenant token and user token provided in
   the connection handshake.
3. IF WebSocket authentication fails, THEN THE AI_Gateway SHALL close the
   connection with a 4001 status code and a descriptive error message.
4. THE AI_Gateway SHALL push Suggestion messages to connected POS terminals when
   the LLM generates actionable recommendations.
5. WHEN a POS terminal sends an approval, dismissal, or delegation change
   message via the WebSocket_Connection, THE AI_Gateway SHALL process the
   message and update the Session state accordingly.
6. IF a WebSocket_Connection drops unexpectedly, THEN THE AI_Gateway SHALL clean
   up the associated Session resources and allow the terminal to reconnect with
   Session continuity within 5 minutes.
7. THE AI_Gateway SHALL support concurrent WebSocket connections from multiple
   POS terminals belonging to the same Tenant.

### Requirement 6: REST API for Admin Dashboard

**User Story:** As a venue manager, I want to interact with the AI through the
admin dashboard for analytics, coupon creation, and event management, so that I
can leverage AI assistance for back-office tasks.

#### Acceptance Criteria

1. THE AI_Gateway SHALL expose REST endpoints via the Hono framework for admin
   dashboard AI interactions.
2. WHEN an admin sends a chat message via the REST API, THE AI_Gateway SHALL
   process the message through the LLM with admin-scoped System_Prompt and
   tools, and return the response.
3. THE Admin_API SHALL authenticate each request using a tenant token and admin
   user token in the Authorization header.
4. IF Admin_API authentication fails, THEN THE AI_Gateway SHALL return HTTP 401
   with a structured error response.
5. THE Admin_API SHALL support streaming responses using Server-Sent Events for
   long-running LLM interactions.

### Requirement 7: System Prompt Management

**User Story:** As a developer, I want role-based and tenant-specific system
prompts, so that the LLM behaves appropriately for cashiers versus admins and
incorporates venue-specific context.

#### Acceptance Criteria

1. THE AI_Gateway SHALL construct a System_Prompt for each LLM call that
   includes the user's role (cashier or admin), available tools for that role,
   and behavioral instructions.
2. WHEN constructing a System_Prompt for a cashier, THE AI_Gateway SHALL include
   POS-focused instructions, available POS and customer tools, and the current
   cart/transaction context.
3. WHEN constructing a System_Prompt for an admin, THE AI_Gateway SHALL include
   dashboard-focused instructions, available admin and analytics tools, and
   venue management context.
4. THE System_Prompt SHALL include tenant-specific context: venue name,
   available features, pricing rules, and operational policies retrieved from
   the Knowledge_Base.
5. THE System_Prompt SHALL instruct the LLM to provide reasoning with each
   suggestion and to respect the Trust_Level constraints of available tools.

### Requirement 8: Conversation Memory and Session Management

**User Story:** As a cashier, I want the AI to remember our conversation within
my shift, so that I do not have to repeat context when asking follow-up
questions.

#### Acceptance Criteria

1. THE AI_Gateway SHALL maintain a per-terminal Session that stores conversation
   message history for the duration of the user's shift.
2. WHEN a user sends a message, THE AI_Gateway SHALL include the Session's
   conversation history in the LLM context, up to a configurable token limit.
3. WHEN the conversation history exceeds the configured token limit, THE
   AI_Gateway SHALL summarize older messages and retain the summary plus recent
   messages.
4. WHEN a user logs out or the Session expires, THE AI_Gateway SHALL clear the
   conversation history and release associated memory.
5. THE AI_Gateway SHALL scope each Session to a specific terminal, user, and
   Tenant combination, preventing cross-session data leakage.

### Requirement 9: RAG Knowledge Base

**User Story:** As a cashier, I want the AI to answer questions about
venue-specific policies and procedures, so that I can quickly find information
without searching through documents manually.

#### Acceptance Criteria

1. THE Knowledge_Base SHALL store vector embeddings of venue documents (refund
   policies, event descriptions, SOPs, FAQs) in PostgreSQL using the pgvector
   extension.
2. THE AI_Gateway SHALL generate embeddings using the OpenAI embeddings API when
   documents are ingested into the Knowledge_Base.
3. WHEN the `searchKnowledgeBase` Tool is invoked, THE AI_Gateway SHALL perform
   a cosine similarity search against the Knowledge_Base and return the top-k
   most relevant document chunks.
4. THE Knowledge_Base SHALL scope all stored documents and embeddings by Tenant
   identifier, preventing cross-tenant document access.
5. THE AI_Gateway SHALL expose a REST endpoint for ingesting new documents into
   the Knowledge_Base, accepting text content and metadata.
6. WHEN a document is ingested, THE AI_Gateway SHALL split the document into
   chunks, generate embeddings for each chunk, and store the chunks with their
   embeddings and metadata.
7. FOR ALL document chunks, ingesting a chunk then searching for the chunk's
   original text SHALL return that chunk among the top results (round-trip
   property).

### Requirement 10: Multi-Tenant Security and Isolation

**User Story:** As a platform operator, I want all AI Gateway operations to be
fully isolated between tenants, so that one venue's data, configuration, and AI
context cannot leak to another.

#### Acceptance Criteria

1. THE AI_Gateway SHALL authenticate every incoming request (WebSocket handshake
   and REST API call) with a valid tenant token and user token.
2. THE AI_Gateway SHALL enforce tenant isolation on all data access: tool
   executions, Knowledge_Base queries, Session data, and configuration lookups
   SHALL be scoped to the authenticated Tenant.
3. IF a request attempts to access data belonging to a different Tenant, THEN
   THE AI_Gateway SHALL reject the request with an authorization error.
4. THE AI_Gateway SHALL enforce rate limiting per Tenant, with configurable
   thresholds for LLM calls, tool executions, and WebSocket messages per minute.
5. IF a Tenant exceeds the configured rate limit, THEN THE AI_Gateway SHALL
   return HTTP 429 or a WebSocket rate-limit message and reject further requests
   until the rate window resets.
6. THE AI_Gateway SHALL log an audit entry for every tool execution, including
   the Tenant identifier, user identifier, tool name, input parameters (with PII
   redacted), execution result, and timestamp.
7. THE audit log SHALL be append-only and scoped per Tenant, queryable for
   compliance and debugging purposes.

### Requirement 11: Suggestion Generation and Push

**User Story:** As a cashier, I want the AI to proactively detect actionable
conditions and push suggestions to my terminal, so that I receive timely help
without having to ask.

#### Acceptance Criteria

1. WHEN the AI_Gateway receives POS state updates (cart changes, customer
   identification, stock alerts) via the WebSocket_Connection, THE AI_Gateway
   SHALL evaluate whether any registered Tool could provide a useful suggestion.
2. WHEN the AI_Gateway determines a suggestion is warranted, THE AI_Gateway
   SHALL generate a Suggestion containing the action type identifier, a
   human-readable description, contextual reasoning, and the proposed action
   payload.
3. THE AI_Gateway SHALL push the generated Suggestion to the connected POS
   terminal via the WebSocket_Connection in a format compatible with the
   frontend's `Suggestion` type interface.
4. THE AI_Gateway SHALL respect the user's delegation preferences when
   generating suggestions: if a user has auto-delegation enabled for an action
   type, THE AI_Gateway SHALL execute the tool directly and send an execution
   notification instead of a suggestion.
5. IF the AI_Gateway generates a suggestion for a Tool with Trust_Level "high",
   THEN THE AI_Gateway SHALL send the suggestion as an approval request
   regardless of the user's delegation preferences.

### Requirement 12: Error Handling and Resilience

**User Story:** As a developer, I want the AI Gateway to handle failures
gracefully, so that LLM outages, tool errors, and network issues do not crash
the service or corrupt state.

#### Acceptance Criteria

1. IF the LLM_Provider is unreachable for all retry attempts, THEN THE
   AI_Gateway SHALL return a structured error to the client indicating the AI
   service is temporarily unavailable.
2. IF a Tool handler throws an error during execution, THEN THE AI_Gateway SHALL
   catch the error, return a structured error result to the LLM_Provider, and
   log the error with full context.
3. WHEN a Tool execution fails, THE AI_Gateway SHALL include the error details
   in the audit log entry for that execution.
4. THE AI_Gateway SHALL implement graceful shutdown: on receiving SIGTERM, THE
   AI_Gateway SHALL stop accepting new connections, complete in-flight requests
   within 10 seconds, and then exit.
5. IF the PostgreSQL database connection is lost, THEN THE AI_Gateway SHALL
   attempt reconnection with exponential backoff and serve degraded responses
   (without RAG) during the outage.
