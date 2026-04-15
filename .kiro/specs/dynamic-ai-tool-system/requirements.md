# Requirements Document

## Introduction

The Dynamic AI Tool System replaces the current hardcoded, multi-file tool
registration approach in the POS AI Sidekick with a declarative, metadata-driven
architecture. Today, adding a frontend-executable tool requires changes in 3+
places (PHP tool class, agent tools() array, frontend-tools.ts registry,
executeFrontendToolAction switch case). The new system allows backend tools to
self-declare their execution context (server vs. frontend), enables per-tenant
tool configuration, and lets the frontend dynamically handle new tool types
without code changes.

## Glossary

- **Tool_Registry**: The backend service responsible for collecting, indexing,
  and resolving available tools based on role and tenant configuration.
- **Tool_Metadata**: A structured descriptor attached to each tool class that
  declares its name, execution context, trust level, frontend action type, and
  schema.
- **Frontend_Tool_Dispatcher**: The frontend module that receives tool call
  events from the SSE stream and dynamically executes frontend-executable tools
  based on their metadata, without hardcoded switch statements.
- **Tool_Manifest**: A JSON payload served by the backend that describes all
  tools available for a given role and tenant, including which tools are
  frontend-executable and their action descriptors.
- **Execution_Context**: A classification on each tool indicating where it runs:
  "server" (backend only) or "frontend" (browser-side execution required).
- **Action_Descriptor**: A structured object within Tool_Metadata that tells the
  Frontend_Tool_Dispatcher how to execute a frontend tool (e.g., dispatch a
  CustomEvent, invoke a React callback, or set context state).
- **Tenant_Tool_Config**: A per-tenant configuration that specifies which tools
  are enabled or disabled, overriding the default role-based tool set.
- **Agent**: A role-specific AI assistant class (CashierAgent, SupervisorAgent,
  etc.) that resolves its tool set from the Tool_Registry.
- **SSE_Stream**: The Server-Sent Events stream from the Laravel backend that
  delivers tool call events to the frontend in real time.
- **Tool_Result_Channel**: The mechanism by which frontend-executed tool results
  are communicated back to the backend so the LLM conversation remains
  consistent.

## Requirements

### Requirement 1: Tool Metadata Declaration

**User Story:** As a developer, I want to declare a tool's execution context,
trust level, and frontend action type directly in the PHP tool class, so that I
only need to modify one file when adding or changing a tool.

#### Acceptance Criteria

1. THE Tool_Metadata SHALL include the following fields: name, execution context
   ("server" or "frontend"), trust level ("low", "medium", or "high"), and an
   optional Action_Descriptor for frontend tools.
2. WHEN a tool class implements the Tool_Metadata interface, THE Tool_Registry
   SHALL read the metadata from that class without requiring registration in any
   other file.
3. WHEN a tool declares its Execution_Context as "frontend", THE Tool_Metadata
   SHALL require a valid Action_Descriptor specifying the frontend action type.
4. IF a tool class does not provide Tool_Metadata, THEN THE Tool_Registry SHALL
   default to Execution_Context "server" and trust level "low".

### Requirement 2: Backend Tool Registry

**User Story:** As a developer, I want a centralized tool registry that
auto-discovers tools from their metadata, so that agents do not need manually
maintained tool arrays.

#### Acceptance Criteria

1. THE Tool_Registry SHALL auto-discover all tool classes in the `App\Ai\Tools`
   namespace that implement the Tool interface.
2. WHEN an Agent requests its tool set, THE Tool_Registry SHALL return only
   tools that match the agent's role and the active Tenant_Tool_Config.
3. THE Tool_Registry SHALL expose a method to retrieve the Tool_Manifest for a
   given role and tenant combination.
4. WHEN a new tool class is added to the Tools namespace with valid
   Tool_Metadata, THE Tool_Registry SHALL include the tool in resolution without
   any additional registration steps.

### Requirement 3: Tool Manifest API

**User Story:** As a frontend developer, I want the backend to serve a manifest
of available tools (including which are frontend-executable and how to execute
them), so that the frontend can handle new tools dynamically.

#### Acceptance Criteria

1. THE Tool_Manifest SHALL be a JSON object containing an array of tool
   descriptors, each with: tool name, execution context, schema, and
   Action_Descriptor (for frontend tools).
2. WHEN the frontend requests the Tool_Manifest, THE backend SHALL return only
   tools authorized for the current user's role and tenant.
3. THE Tool_Manifest SHALL be served via a dedicated API endpoint accessible to
   authenticated users.
4. WHEN the Tool_Manifest changes (tools added, removed, or reconfigured), THE
   frontend SHALL receive the updated manifest on the next request without
   requiring a code deployment.

### Requirement 4: Dynamic Frontend Tool Dispatcher

**User Story:** As a frontend developer, I want the frontend to execute tools
based on their Action_Descriptor from the manifest, so that I never need to add
switch cases or hardcoded tool names for new frontend tools.

#### Acceptance Criteria

1. WHEN the SSE_Stream delivers a tool call event with a tool marked as
   frontend-executable in the Tool_Manifest, THE Frontend_Tool_Dispatcher SHALL
   execute the tool using its Action_Descriptor.
2. THE Frontend_Tool_Dispatcher SHALL support the following action types:
   "custom-event" (dispatch a browser CustomEvent), "react-callback" (invoke a
   registered React callback function), and "context-update" (update React
   context state).
3. WHEN a tool call arrives for a tool name not present in the Tool_Manifest,
   THE Frontend_Tool_Dispatcher SHALL treat the tool as server-only and skip
   frontend execution.
4. IF a frontend tool execution fails (e.g., target element not found, callback
   not registered), THEN THE Frontend_Tool_Dispatcher SHALL return a structured
   error result with a descriptive message.
5. THE Frontend_Tool_Dispatcher SHALL replace the existing hardcoded
   `FRONTEND_TOOL_NAMES` set and `executeFrontendToolAction` switch statement in
   `frontend-tools.ts`.

### Requirement 5: Per-Tenant Tool Configuration

**User Story:** As a platform admin, I want to enable or disable specific tools
per tenant, so that different venues can have customized AI capabilities.

#### Acceptance Criteria

1. THE Tenant_Tool_Config SHALL support enabling and disabling individual tools
   by tool name for each tenant.
2. WHEN a tool is disabled in the Tenant_Tool_Config for a tenant, THE
   Tool_Registry SHALL exclude that tool from the agent's tool set and from the
   Tool_Manifest for that tenant.
3. WHEN no Tenant_Tool_Config exists for a tenant, THE Tool_Registry SHALL use
   the default role-based tool set with all tools enabled.
4. WHEN a Tenant_Tool_Config is updated, THE Tool_Registry SHALL reflect the
   change on the next tool resolution request without requiring a server
   restart.

### Requirement 6: Frontend Tool Result Feedback

**User Story:** As a developer, I want frontend-executed tool results to flow
back to the backend in a standardized format, so that the LLM conversation stays
consistent regardless of where the tool executed.

#### Acceptance Criteria

1. WHEN a frontend tool completes execution, THE Frontend_Tool_Dispatcher SHALL
   send the result back to the backend via the Tool_Result_Channel.
2. THE tool result payload SHALL include: tool call ID, success status
   (boolean), a human-readable message, and an optional data object.
3. WHEN the backend receives a frontend tool result, THE backend SHALL inject
   the result into the LLM conversation context as if the tool had executed
   server-side.
4. IF the frontend does not send a tool result within 10 seconds of the tool
   call, THEN THE backend SHALL treat the tool call as timed out and inject a
   timeout error into the conversation.

### Requirement 7: Action Descriptor Specification

**User Story:** As a developer, I want a well-defined Action_Descriptor format,
so that I can predictably describe how any frontend tool should execute.

#### Acceptance Criteria

1. THE Action_Descriptor SHALL contain: an action type ("custom-event",
   "react-callback", or "context-update"), an action target (event name,
   callback key, or context key), and an optional argument mapping that maps
   tool schema fields to action parameters.
2. WHEN the action type is "custom-event", THE Frontend_Tool_Dispatcher SHALL
   dispatch a CustomEvent on the window object with the action target as the
   event name and the mapped arguments as the event detail.
3. WHEN the action type is "react-callback", THE Frontend_Tool_Dispatcher SHALL
   invoke the callback registered under the action target key, passing the
   mapped arguments.
4. WHEN the action type is "context-update", THE Frontend_Tool_Dispatcher SHALL
   update the React context value identified by the action target key with the
   mapped arguments.
5. IF the Action_Descriptor references a callback key that has not been
   registered, THEN THE Frontend_Tool_Dispatcher SHALL return an error result
   indicating the callback is not available.

### Requirement 8: Backward Compatibility

**User Story:** As a developer, I want the new dynamic tool system to work
alongside existing tool classes without breaking current functionality, so that
migration can happen incrementally.

#### Acceptance Criteria

1. WHILE existing tool classes do not implement the new Tool_Metadata interface,
   THE Tool_Registry SHALL continue to resolve those tools using the current
   manual registration in agent tools() arrays.
2. WHEN a tool class is migrated to use Tool_Metadata, THE Tool_Registry SHALL
   prefer the metadata-based registration over the manual registration.
3. THE Frontend_Tool_Dispatcher SHALL support both the legacy hardcoded tool
   names and the new manifest-driven tool names during the migration period.
4. WHEN all tools have been migrated to Tool_Metadata, THE legacy hardcoded
   frontend tool registry SHALL be removable without affecting functionality.
