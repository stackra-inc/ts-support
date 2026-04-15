# Requirements Document

## Introduction

The AI Sidekick Automation feature introduces a progressive trust model for the
POS terminal's AI engine. The system surfaces repeatable, non-critical actions
to cashiers as interactive suggestions (pop-ups, inline buttons,
recommendations). Each suggestion includes an opt-in toggle that allows the
cashier to delegate that specific action type to the AI Sidekick for automatic
execution in the future. This creates a gradual automation ramp: cashiers start
by manually approving every AI suggestion, then selectively enable auto-approval
for action types they trust. An AI Capabilities settings panel in the profile
drawer gives cashiers full visibility and control over which automations are
active. Because the platform is multi-tenant SaaS, the set of available action
types and automation rules are configurable per tenant.

## Glossary

- **AI_Sidekick**: The AI engine component that observes POS state, generates
  action suggestions, and executes approved automations on behalf of the
  cashier.
- **Action_Type**: A named category of repeatable POS operation that the
  AI_Sidekick can suggest or automate (e.g., "merge-carts", "apply-promo",
  "dismiss-low-stock-alert").
- **Suggestion**: A single instance of an AI-generated recommendation presented
  to the cashier for a specific Action_Type, containing a description, the
  proposed action payload, and contextual reasoning.
- **Suggestion_Popup**: The UI component that presents a Suggestion to the
  cashier with approve/dismiss controls and an opt-in automation toggle.
- **Automation_Preference**: A per-cashier, per-Action_Type boolean flag
  indicating whether the AI_Sidekick is authorized to execute that Action_Type
  automatically without presenting a Suggestion_Popup.
- **Automation_Preference_Store**: The persistence layer that stores and
  retrieves Automation_Preference records, scoped to the current cashier and
  tenant.
- **AI_Capabilities_Panel**: The settings sub-view within the profile drawer
  where cashiers can view and toggle all Automation_Preference entries.
- **Tenant_Action_Registry**: The per-tenant configuration that defines which
  Action_Types are available, their metadata, risk levels, and default
  automation states.
- **Trust_Level**: A classification of an Action_Type's risk: "low" (safe to
  automate), "medium" (automatable with caution), or "high" (requires manual
  approval always).
- **Automation_Event_Log**: A chronological record of all actions the
  AI_Sidekick has executed automatically, available for cashier review.
- **POS_Context**: The existing React context provider (`POSProvider`) that
  manages shared POS terminal state.

## Requirements

### Requirement 1: Action Type Registry and Tenant Configuration

**User Story:** As a platform operator, I want to define which AI action types
are available per tenant, so that different venues with different complexities
get relevant automation options.

#### Acceptance Criteria

1. THE Tenant_Action_Registry SHALL define each Action_Type with an identifier,
   display name, description, icon, Trust_Level, and a default
   Automation_Preference value.
2. WHEN the POS terminal initializes, THE AI_Sidekick SHALL load the
   Tenant_Action_Registry for the current tenant.
3. IF the Tenant_Action_Registry for the current tenant is unavailable, THEN THE
   AI_Sidekick SHALL fall back to an empty registry and surface zero
   suggestions.
4. THE Tenant_Action_Registry SHALL support Action_Types with Trust_Level values
   of "low", "medium", or "high".
5. WHERE a tenant defines a custom set of Action_Types, THE AI_Sidekick SHALL
   display only those Action_Types in the AI_Capabilities_Panel.

### Requirement 2: AI Suggestion Generation and Presentation

**User Story:** As a cashier, I want the AI Sidekick to surface relevant action
suggestions as I work, so that I can handle common tasks faster with AI
assistance.

#### Acceptance Criteria

1. WHEN the AI_Sidekick detects a triggering condition for a registered
   Action_Type, THE AI_Sidekick SHALL generate a Suggestion containing the
   Action_Type identifier, a human-readable description, the proposed action
   payload, and contextual reasoning.
2. WHILE the Automation_Preference for the Suggestion's Action_Type is disabled,
   THE AI_Sidekick SHALL present the Suggestion to the cashier via a
   Suggestion_Popup.
3. THE Suggestion_Popup SHALL display the Suggestion description, the
   Action_Type display name, the contextual reasoning, and approve/dismiss
   action buttons.
4. WHEN the cashier presses the approve button on a Suggestion_Popup, THE
   AI_Sidekick SHALL execute the proposed action and dismiss the
   Suggestion_Popup.
5. WHEN the cashier presses the dismiss button on a Suggestion_Popup, THE
   AI_Sidekick SHALL discard the Suggestion and dismiss the Suggestion_Popup
   without executing the action.
6. IF multiple Suggestions are generated simultaneously, THEN THE AI_Sidekick
   SHALL queue them and present one Suggestion_Popup at a time.

### Requirement 3: Opt-In Automation Toggle on Suggestions

**User Story:** As a cashier, I want to opt in to automatic handling of a
specific action type directly from the suggestion pop-up, so that I stop seeing
repetitive prompts for actions I trust.

#### Acceptance Criteria

1. THE Suggestion_Popup SHALL display an opt-in toggle labeled "Allow AI
   Sidekick to handle this automatically" below the approve/dismiss buttons.
2. WHEN the cashier enables the opt-in toggle on a Suggestion_Popup, THE
   Automation_Preference_Store SHALL set the Automation_Preference for that
   Action_Type to enabled for the current cashier.
3. WHEN the cashier enables the opt-in toggle, THE Suggestion_Popup SHALL
   display a confirmation message indicating that future instances of this
   Action_Type will be handled automatically.
4. WHILE the opt-in toggle is being enabled for an Action_Type with Trust_Level
   "high", THE Suggestion_Popup SHALL display a warning that this action type
   carries higher risk and request explicit confirmation.
5. WHEN the cashier enables the opt-in toggle, THE AI_Sidekick SHALL still
   execute or dismiss the current Suggestion based on which action button the
   cashier presses.

### Requirement 4: Automatic Action Execution

**User Story:** As a cashier, I want the AI Sidekick to automatically execute
action types I have opted into, so that I am not interrupted by pop-ups for
trusted, routine tasks.

#### Acceptance Criteria

1. WHILE the Automation_Preference for an Action_Type is enabled, THE
   AI_Sidekick SHALL execute Suggestions of that Action_Type automatically
   without presenting a Suggestion_Popup.
2. WHEN the AI_Sidekick executes a Suggestion automatically, THE AI_Sidekick
   SHALL display a brief, non-blocking toast notification indicating the action
   taken.
3. THE toast notification SHALL include the Action_Type display name, a short
   summary of the action, and an "Undo" button.
4. WHEN the cashier presses the "Undo" button on a toast notification within 5
   seconds, THE AI_Sidekick SHALL reverse the automatically executed action.
5. IF the automatic execution of a Suggestion fails, THEN THE AI_Sidekick SHALL
   fall back to presenting the Suggestion via a Suggestion_Popup with an error
   context message.

### Requirement 5: AI Capabilities Settings Panel

**User Story:** As a cashier, I want a dedicated settings section where I can
see and control all AI automation preferences, so that I have full visibility
over what the AI Sidekick does on my behalf.

#### Acceptance Criteria

1. THE AI_Capabilities_Panel SHALL be accessible as a sub-view within the
   profile drawer, listed under a menu row labeled "AI Capabilities" with a
   Sparkles icon.
2. THE AI_Capabilities_Panel SHALL display a list of all Action_Types from the
   Tenant_Action_Registry, grouped by Trust_Level.
3. EACH Action_Type row in the AI_Capabilities_Panel SHALL display the
   Action_Type display name, description, Trust_Level badge, and a toggle switch
   reflecting the current Automation_Preference.
4. WHEN the cashier toggles an Automation_Preference in the
   AI_Capabilities_Panel, THE Automation_Preference_Store SHALL persist the
   updated preference immediately.
5. THE AI_Capabilities_Panel SHALL display a summary count showing how many
   Action_Types are currently automated out of the total available.
6. WHILE the AI_Capabilities_Panel is open, THE AI_Capabilities_Panel SHALL
   display a "Disable All Automations" button that sets all
   Automation_Preferences to disabled.
7. WHEN the cashier presses "Disable All Automations", THE
   Automation_Preference_Store SHALL set all Automation_Preferences for the
   current cashier to disabled.

### Requirement 6: Automation Preference Persistence

**User Story:** As a cashier, I want my automation preferences to persist across
sessions, so that I do not have to re-enable my trusted automations every time I
log in.

#### Acceptance Criteria

1. THE Automation_Preference_Store SHALL persist Automation_Preference records
   scoped to the combination of cashier identifier and tenant identifier.
2. WHEN the cashier logs in, THE Automation_Preference_Store SHALL load the
   previously saved Automation_Preferences for the current cashier and tenant.
3. WHEN an Automation_Preference is updated, THE Automation_Preference_Store
   SHALL persist the change within 1 second.
4. IF the Automation_Preference_Store fails to load saved preferences, THEN THE
   AI_Sidekick SHALL use the default Automation_Preference values from the
   Tenant_Action_Registry.
5. THE Automation_Preference_Store SHALL store preferences in local storage with
   a key structure that includes the cashier identifier and tenant identifier.

### Requirement 7: Automation Event Log

**User Story:** As a cashier, I want to review a log of actions the AI Sidekick
has taken automatically, so that I can verify what happened and catch any
mistakes.

#### Acceptance Criteria

1. WHEN the AI_Sidekick executes a Suggestion automatically, THE
   Automation_Event_Log SHALL record the Action_Type, timestamp, action summary,
   and execution status.
2. THE AI_Capabilities_Panel SHALL include a "Recent Activity" section
   displaying the last 20 entries from the Automation_Event_Log.
3. EACH entry in the Automation_Event_Log display SHALL show the Action_Type
   icon, display name, time elapsed since execution, and a status indicator
   (success or failed).
4. WHEN the cashier taps an Automation_Event_Log entry, THE
   AI_Capabilities_Panel SHALL display the full action details including the
   payload summary and contextual reasoning.
5. THE Automation_Event_Log SHALL be scoped to the current cashier session and
   cleared on logout.

### Requirement 8: Suggestion Popup Accessibility and Keyboard Support

**User Story:** As a cashier, I want to interact with AI suggestion pop-ups
using the keyboard, so that the feature is accessible and efficient during
fast-paced POS operations.

#### Acceptance Criteria

1. WHEN a Suggestion_Popup appears, THE Suggestion_Popup SHALL move focus to the
   approve button.
2. THE Suggestion_Popup SHALL support keyboard navigation: Tab to cycle between
   approve, dismiss, and the opt-in toggle; Enter or Space to activate the
   focused control.
3. WHEN the cashier presses the Escape key while a Suggestion_Popup is visible,
   THE AI_Sidekick SHALL dismiss the Suggestion without executing the action.
4. THE Suggestion_Popup SHALL set `role="alertdialog"` and include an
   `aria-label` describing the suggested action.
5. THE opt-in toggle SHALL have an accessible label that includes the
   Action_Type display name.

### Requirement 9: AI Sidekick Context Integration

**User Story:** As a developer, I want the AI Sidekick state to integrate with
the existing POS context architecture, so that suggestion state and automation
preferences are accessible throughout the component tree.

#### Acceptance Criteria

1. THE AI_Sidekick SHALL expose its state and operations via a dedicated
   `AISidekickProvider` React context, separate from the existing POS_Context.
2. THE `AISidekickProvider` SHALL be nested within the `POSProvider` in the
   component tree so that it can access tenant and cashier information from
   POS_Context.
3. THE `AISidekickProvider` SHALL expose a `useAISidekick` hook that provides:
   the current Suggestion queue, Automation_Preferences, methods to
   approve/dismiss Suggestions, methods to toggle Automation_Preferences, and
   the Automation_Event_Log.
4. IF `useAISidekick` is called outside of the `AISidekickProvider`, THEN THE
   hook SHALL throw a descriptive error.
5. THE `AISidekickProvider` SHALL accept the Tenant_Action_Registry as a prop or
   load it based on the current tenant context.

### Requirement 10: Multi-Tenant Isolation

**User Story:** As a platform operator, I want automation preferences and action
registries to be fully isolated between tenants, so that one tenant's
configuration does not affect another.

#### Acceptance Criteria

1. THE Automation_Preference_Store SHALL namespace all stored preferences by
   tenant identifier, preventing cross-tenant data leakage.
2. WHEN a cashier switches tenants, THE AI_Sidekick SHALL reload the
   Tenant_Action_Registry and Automation_Preferences for the new tenant.
3. THE Tenant_Action_Registry SHALL be independently configurable per tenant,
   allowing different tenants to have different sets of Action_Types.
4. IF a cashier has Automation_Preferences saved for Action_Types that no longer
   exist in the current Tenant_Action_Registry, THEN THE
   Automation_Preference_Store SHALL ignore those stale preferences.
