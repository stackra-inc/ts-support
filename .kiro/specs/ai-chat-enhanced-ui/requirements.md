# Requirements Document

## Introduction

The AI Chat Enhanced UI feature upgrades the existing AI Sidekick chat panel
from a plain-text streaming interface into a rich, interactive assistant. The
current system has a working AI Gateway backend with 24 registered tools (all
stub handlers), a WebSocket server streaming GPT-4o responses, and a basic chat
panel. This feature adds markdown rendering in chat bubbles, interactive
tool-call UI with approve/execute buttons, wiring of stub tool handlers to real
POS operations, rich message components (tool cards, approval cards, typing
indicators, error display), session-scoped chat history persistence, and
real-time POS context injection so the AI can give contextual suggestions.

## Glossary

- **Chat_Panel**: The floating React component (`ai-chat.tsx`) that renders the
  conversation between the cashier and the AI assistant.
- **AI_Gateway**: The backend WebSocket server (`ws-server.ts`) that manages
  sessions, streams LLM responses, and executes tool calls.
- **Tool_Registry**: The backend module that registers all 24 tool definitions
  across POS, customer, inventory, knowledge, external, and admin categories.
- **Tool_Handler**: The `handler` function on a `ToolDefinition` that executes
  the actual POS operation when a tool is invoked by the LLM.
- **Trust_Gate**: The backend module that enforces trust-level policies (low =
  auto-execute, medium = suggest, high = require approval) before tool
  execution.
- **Markdown_Renderer**: A frontend component that parses markdown syntax (bold,
  italic, lists, code blocks, links) and renders it as styled HTML within chat
  bubbles.
- **Tool_Call_Card**: A UI component displayed inline in the chat conversation
  showing the tool name, arguments, execution status, and result.
- **Approval_Card**: A UI component displayed inline for high-trust tool calls
  that presents Approve and Reject buttons to the cashier before execution
  proceeds.
- **POS_Context**: The real-time state of the POS terminal (active cart items,
  selected customer, currency, dark mode) provided by `POSProvider`.
- **Chat_Message**: A single message object in the conversation, which may be a
  user text message, assistant text message, tool call, tool result, or error.
- **Session_History**: The array of Chat_Message objects persisted in React
  state for the duration of the browser session.
- **Navigation_Card**: A UI component displayed inline in the chat conversation
  showing where the AI navigated the user, with a re-navigate button.
- **navigateUI**: A frontend-executed tool that opens drawers, navigates to
  specific sections, and highlights UI elements to guide the cashier.
- **Walkthrough_Overlay**: A full-screen overlay component that dims the UI
  except for a spotlight cutout around the current target element, with an
  anchored popover showing step instructions.
- **startWalkthrough**: A frontend-executed tool that initiates a multi-step
  interactive walkthrough with highlights and popovers on actual UI elements.
- **UI_Context_Snapshot**: A comprehensive object capturing the full state of
  the POS terminal UI: current route, open drawers, active cart, selected
  customer, selected event, sidebar state, dark mode, and terminal ID.
- **Answer_Cache**: A collection of question-answer pairs stored as embeddings
  in the Knowledge_Base, enabling instant retrieval of previously generated
  answers via semantic similarity search.

## Requirements

### Requirement 1: Markdown Rendering in Chat Bubbles

**User Story:** As a cashier, I want AI responses rendered with proper markdown
formatting, so that I can easily read structured information like lists, code
snippets, and emphasized text.

#### Acceptance Criteria

1. WHEN the AI_Gateway streams a response containing markdown syntax, THE
   Markdown_Renderer SHALL parse and render bold, italic, inline code, code
   blocks, ordered lists, unordered lists, and links as styled HTML elements.
2. WHEN a code block is present in the response, THE Markdown_Renderer SHALL
   display the code block with a distinct background color and monospace font.
3. WHEN a markdown link is present in the response, THE Markdown_Renderer SHALL
   render the link as a clickable anchor element that opens in a new browser
   tab.
4. THE Markdown_Renderer SHALL sanitize all rendered HTML to prevent cross-site
   scripting (XSS) injection.
5. WHEN the AI_Gateway streams tokens incrementally, THE Markdown_Renderer SHALL
   re-render the partial markdown content on each token update without layout
   flickering.

### Requirement 2: Interactive Tool Call Display

**User Story:** As a cashier, I want to see what tools the AI is calling and
their results inline in the chat, so that I understand what actions the
assistant is taking on my behalf.

#### Acceptance Criteria

1. WHEN the AI_Gateway executes a tool call during a chat response, THE
   Chat_Panel SHALL display a Tool_Call_Card inline in the conversation at the
   point the tool was invoked.
2. THE Tool_Call_Card SHALL display the tool name, a human-readable summary of
   the arguments, and a status indicator (pending, success, or failed).
3. WHEN the tool execution completes successfully, THE Tool_Call_Card SHALL
   update to show the result data returned by the Tool_Handler.
4. WHEN the tool execution fails, THE Tool_Call_Card SHALL display the error
   message returned by the Tool_Handler.
5. WHEN the AI_Gateway sends a tool call message, THE AI_Gateway SHALL include
   the tool name, arguments, and a unique tool call identifier in the WebSocket
   message payload.

### Requirement 3: High-Trust Tool Approval Flow

**User Story:** As a cashier, I want to explicitly approve or reject high-risk
actions like refunds and void transactions before they execute, so that I
maintain control over sensitive operations.

#### Acceptance Criteria

1. WHEN the Trust_Gate classifies a tool call as high trust level, THE
   Chat_Panel SHALL display an Approval_Card with Approve and Reject buttons
   instead of auto-executing.
2. THE Approval_Card SHALL display the tool name, a human-readable description
   of the action, the arguments (including monetary amounts), and the reason the
   action requires approval.
3. WHEN the cashier presses the Approve button on an Approval_Card, THE
   Chat_Panel SHALL send an "approve" message to the AI_Gateway with the
   corresponding request identifier.
4. WHEN the cashier presses the Reject button on an Approval_Card, THE
   Chat_Panel SHALL send a "reject" message to the AI_Gateway with the
   corresponding request identifier.
5. WHEN the approval request times out on the AI_Gateway (default 60 seconds),
   THE Approval_Card SHALL update to show a "Timed Out" status and disable the
   Approve and Reject buttons.
6. WHILE an Approval_Card is pending, THE Chat_Panel SHALL disable the chat
   input to prevent conflicting interactions.

### Requirement 4: POS Tool Handler Integration

**User Story:** As a cashier, I want the AI assistant to execute real POS
operations when I approve tool calls, so that the assistant can actually help me
with my workflow.

#### Acceptance Criteria

1. WHEN the "toggleDarkMode" tool is invoked, THE Tool_Handler SHALL toggle the
   POS terminal theme between light and dark mode by dispatching the action
   through POS_Context.
2. WHEN the "applyPromoCode" tool is invoked with a cart identifier and promo
   code, THE Tool_Handler SHALL apply the promotional discount to the specified
   cart and return the updated cart total.
3. WHEN the "holdCart" tool is invoked with a cart identifier, THE Tool_Handler
   SHALL place the specified cart on hold via POS_Context and return a
   confirmation with the held cart label.
4. WHEN the "resumeCart" tool is invoked with a cart identifier, THE
   Tool_Handler SHALL resume the specified held cart via POS_Context and set the
   cart as the active cart.
5. WHEN the "lookupCustomer" tool is invoked with a search query, THE
   Tool_Handler SHALL search the customer data source by name, email, or phone
   and return matching customer records.
6. WHEN the "checkStock" tool is invoked with an item identifier, THE
   Tool_Handler SHALL query the inventory data source and return the current
   stock level and availability status.
7. WHEN the "processRefund" tool is invoked with a transaction identifier,
   amount, and reason, THE Tool_Handler SHALL initiate the refund through the
   POS refund workflow and return the refund confirmation or error.
8. WHEN the "voidTransaction" tool is invoked with a transaction identifier and
   reason, THE Tool_Handler SHALL void the transaction through the POS void
   workflow and return the void confirmation or error.
9. IF a Tool_Handler receives invalid or missing arguments, THEN THE
   Tool_Handler SHALL return a structured error object with a descriptive error
   message and error code.
10. WHEN any Tool_Handler completes execution, THE Tool_Handler SHALL return a
    result object containing a success boolean, a human-readable message, and
    any relevant data payload.

### Requirement 5: Rich Chat Message Components

**User Story:** As a cashier, I want the chat interface to show clear visual
indicators for streaming, errors, and connection status, so that I always know
the state of my interaction with the AI.

#### Acceptance Criteria

1. WHILE the AI_Gateway is streaming a response, THE Chat_Panel SHALL display a
   typing indicator animation below the last message.
2. WHEN the AI_Gateway sends an error message, THE Chat_Panel SHALL display an
   error message component with the error code and a human-readable description
   styled distinctly from normal messages.
3. THE Chat_Panel SHALL display a connection status indicator in the header
   showing the current WebSocket connection state (connected, connecting,
   disconnected, or error).
4. WHEN the WebSocket connection transitions from connected to disconnected, THE
   Chat_Panel SHALL display an inline notification in the message area informing
   the cashier of the disconnection.
5. WHEN the WebSocket connection transitions from disconnected to connected, THE
   Chat_Panel SHALL display an inline notification in the message area
   confirming reconnection.

### Requirement 6: Chat History Session Persistence

**User Story:** As a cashier, I want my chat history to persist when I close and
reopen the chat panel during my shift, so that I do not lose conversation
context.

#### Acceptance Criteria

1. WHEN the cashier closes the Chat_Panel, THE AISidekickProvider SHALL retain
   all Chat_Message objects in React state.
2. WHEN the cashier reopens the Chat_Panel, THE Chat_Panel SHALL render all
   previously retained Chat_Message objects in chronological order.
3. WHEN the cashier's browser session ends (page refresh or tab close), THE
   Session_History SHALL be cleared.
4. THE Session_History SHALL include all message types: user messages, assistant
   text messages, tool call cards, tool results, approval cards, and error
   messages.
5. WHEN the WebSocket session reconnects after a brief disconnection, THE
   AI_Gateway SHALL resume the existing server-side session with its
   conversation history intact (within the 5-minute reconnect window).

### Requirement 7: POS Context Awareness

**User Story:** As a cashier, I want the AI assistant to know about my current
cart, selected customer, and terminal state, so that it can give me relevant and
contextual suggestions.

#### Acceptance Criteria

1. WHEN the active cart changes (items added, removed, or cart switched), THE
   AISidekickProvider SHALL send a "pos-state-update" message to the AI_Gateway
   containing the current cart state.
2. WHEN a customer is selected or deselected in the POS, THE AISidekickProvider
   SHALL send a "pos-state-update" message to the AI_Gateway containing the
   current customer information.
3. THE AI_Gateway prompt builder SHALL include the current POS_Context (cart
   contents, selected customer, terminal settings) in the system prompt sent to
   the LLM.
4. WHEN the cashier sends a chat message, THE AI_Gateway SHALL use the most
   recent POS_Context to provide contextually relevant responses (referencing
   current cart items, customer name, and applicable promotions).
5. IF the POS_Context is unavailable or empty, THEN THE AI_Gateway SHALL proceed
   without POS context and respond based on the conversation history alone.

### Requirement 8: Tool Call WebSocket Protocol Extension

**User Story:** As a developer, I want the WebSocket protocol to support tool
call and tool result message types, so that the frontend can render interactive
tool UI components.

#### Acceptance Criteria

1. WHEN the LLM invokes a tool during response generation, THE AI_Gateway SHALL
   send a "tool-call" message to the client containing the tool name, arguments,
   tool call identifier, and trust level.
2. WHEN a tool execution completes, THE AI_Gateway SHALL send a "tool-result"
   message to the client containing the tool call identifier, success status,
   result data, and error message if applicable.
3. THE WSServerMessage type definition SHALL include "tool-call" and
   "tool-result" as valid message types.
4. THE WSClientMessage type definition SHALL remain backward-compatible with
   existing message types (chat, pos-state-update, approve, reject, dismiss,
   delegation-change).
5. WHEN the AI_Gateway sends a tool-call message for a high-trust tool, THE
   AI_Gateway SHALL include a "requiresApproval" flag set to true in the message
   payload.

### Requirement 9: AI-Guided UI Navigation

**User Story:** As a cashier, I want the AI assistant to navigate me to the
exact screen and setting I need when I ask about configuration, hardware, or
terminal settings, so that I get hands-on help instead of just instructions.

#### Acceptance Criteria

1. WHEN the cashier asks about hardware configuration, printer setup, or
   terminal settings, THE AI_Gateway SHALL invoke a "navigateUI" tool with the
   target drawer, section, and optional highlight element.
2. WHEN the "navigateUI" tool is executed on the frontend, THE Tool_Handler
   SHALL open the specified drawer (e.g. profile drawer), navigate to the
   specified section (e.g. "Terminal Settings"), and scroll to the specified
   subsection (e.g. "Hardware").
3. WHEN a UI element is specified for highlighting, THE Tool_Handler SHALL apply
   a temporary visual highlight (pulse animation or glow border) to the target
   element for 3 seconds to draw the cashier's attention.
4. THE "navigateUI" tool SHALL support navigation targets including: profile
   drawer sections (Terminal Settings, Hardware, Display, Network), account
   settings, AI capabilities panel, and notification panel.
5. WHEN the "navigateUI" tool completes navigation, THE Tool_Handler SHALL
   return a confirmation message indicating which screen was opened and which
   element was highlighted.
6. THE Chat_Panel SHALL display a Navigation_Card inline in the conversation
   showing where the AI navigated the user, with a "Go There" button if the
   drawer was closed before the cashier could see it.

### Requirement 10: AI-Generated Interactive Walkthroughs

**User Story:** As a cashier, I want the AI assistant to generate step-by-step
interactive walkthroughs with popovers and highlights on the actual UI, so that
I can learn how to use features by seeing them in context rather than reading
instructions.

#### Acceptance Criteria

1. WHEN the cashier asks how to use a feature (e.g. "how do I navigate
   categories", "how do I swipe between events"), THE AI_Gateway SHALL invoke a
   "startWalkthrough" tool with an ordered array of walkthrough steps.
2. EACH walkthrough step SHALL contain a target element selector (CSS selector
   or data attribute), a popover title, a popover description, a popover
   position (top, bottom, left, right), and an optional action hint (e.g. "swipe
   left", "tap here", "scroll down").
3. WHEN a walkthrough is active, THE Walkthrough_Overlay SHALL highlight the
   target element by dimming the rest of the screen and applying a spotlight
   cutout around the target.
4. THE Walkthrough_Overlay SHALL display a popover anchored to the target
   element containing the step title, description, action hint, step counter
   (e.g. "Step 2 of 5"), and Next/Back/Skip buttons.
5. WHEN the cashier presses the Next button, THE Walkthrough_Overlay SHALL
   advance to the next step, scrolling and highlighting the next target element.
6. WHEN the cashier presses the Back button, THE Walkthrough_Overlay SHALL
   return to the previous step.
7. WHEN the cashier presses the Skip button or presses Escape, THE
   Walkthrough_Overlay SHALL dismiss the walkthrough and remove all highlights.
8. WHEN the walkthrough reaches the final step and the cashier presses Done, THE
   Walkthrough_Overlay SHALL dismiss and THE Chat_Panel SHALL display a
   completion message.
9. IF a target element specified in a walkthrough step is not found in the DOM,
   THE Walkthrough_Overlay SHALL skip that step and advance to the next
   available step.
10. THE "startWalkthrough" tool SHALL support walkthroughs across the POS layout
    including: category tabs, event tiles, cart panel, sidebar navigation,
    header actions, drawer sections, and seat map components.

### Requirement 11: Full UI Context Awareness

**User Story:** As a cashier, I want the AI assistant to be aware of everything
happening on my screen — which page I'm on, which drawers are open, which event
I'm viewing, which customer is assigned — so that it can give me perfectly
contextual help and predict what I might need.

#### Acceptance Criteria

1. THE AISidekickProvider SHALL collect a comprehensive UI_Context_Snapshot
   containing: current route/page, active cart contents and totals, assigned
   customer (if any), selected event details (if any), open drawers and their
   current section, sidebar collapsed/expanded state, dark mode state, and
   terminal identifier.
2. WHEN any component of the UI_Context_Snapshot changes, THE AISidekickProvider
   SHALL send a "pos-state-update" message to the AI_Gateway within 500
   milliseconds of the change, debounced to avoid flooding.
3. THE AI_Gateway prompt builder SHALL include the full UI_Context_Snapshot in
   the system prompt, formatted so the LLM understands the cashier's current
   screen state.
4. WHEN the AI_Gateway evaluates proactive suggestions, THE AI_Gateway SHALL use
   the full UI_Context_Snapshot to generate contextually relevant suggestions
   (e.g. suggesting member discount when a loyalty customer is assigned,
   suggesting upsells based on cart contents).
5. THE UI_Context_Snapshot SHALL NOT include sensitive data such as full payment
   card numbers or authentication tokens.

### Requirement 12: Answer Caching and Cross-Cashier Knowledge Sharing

**User Story:** As a platform operator, I want frequently asked questions and
their AI-generated answers to be cached in the knowledge base, so that future
cashiers get instant, consistent answers without waiting for the LLM.

#### Acceptance Criteria

1. WHEN the AI_Gateway generates a response to a cashier question that is
   classified as a factual or procedural answer (not a transactional tool call),
   THE AI_Gateway SHALL store the question-answer pair as a document in the
   Knowledge_Base with category "faq" and the tenant identifier.
2. BEFORE sending a new question to the LLM, THE AI_Gateway SHALL perform a
   semantic similarity search against cached Q&A pairs in the Knowledge_Base for
   the authenticated tenant.
3. IF a cached answer with a similarity score above a configurable threshold
   (default 0.92) is found, THE AI_Gateway SHALL return the cached answer
   directly to the client without invoking the LLM, and SHALL include a "cached"
   flag in the response metadata.
4. WHEN a cached answer is returned, THE Chat_Panel SHALL display a subtle
   indicator (e.g. a small lightning bolt icon) showing the response was instant
   from cache.
5. THE cached Q&A pairs SHALL be scoped per tenant, preventing cross-tenant
   answer leakage.
6. THE AI_Gateway SHALL expose a REST endpoint for administrators to review,
   edit, or delete cached Q&A pairs in the Knowledge_Base.
7. WHEN a cached answer is older than a configurable TTL (default 30 days), THE
   AI_Gateway SHALL re-query the LLM and update the cached answer.
