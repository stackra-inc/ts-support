# Implementation Plan: AI Sidekick Automation

## Overview

Incrementally build the AI Sidekick Automation feature as a vertical slice
alongside the existing POS architecture. Start with core data types and pure
logic modules, layer on the React context provider, then build UI components,
and finally wire everything together into the existing POS layout.
Property-based tests (fast-check) and unit tests are added alongside each
module.

## Tasks

- [x] 1. Set up project structure, types, and test infrastructure
  - [x] 1.1 Create core type definitions and directory scaffold
    - Create `apps/vite-template/src/contexts/ai-sidekick/` directory
    - Create `apps/vite-template/src/contexts/ai-sidekick/types.ts` with all
      shared interfaces: `ActionTypeDefinition`, `TrustLevel`,
      `TenantActionRegistry`, `AutomationPreference`, `Suggestion`,
      `ExecutionResult`, `AutomationEvent`, `AISidekickContextValue`
    - Create `apps/vite-template/src/components/ai-sidekick/` directory for UI
      components
    - _Requirements: 1.1, 1.4, 2.1, 4.2, 7.1_

  - [x] 1.2 Set up fast-check and test utilities
    - Install `fast-check` as a dev dependency (verify vitest is available or
      install)
    - Create
      `apps/vite-template/src/contexts/ai-sidekick/__tests__/arbitraries.ts`
      with shared generators: `arbitraryActionType()`, `arbitraryRegistry()`,
      `arbitrarySuggestion()`, `arbitraryPreferences()`, `arbitraryCashierId()`,
      `arbitraryTenantId()`
    - _Requirements: (testing infrastructure for all properties)_

- [x] 2. Implement TenantActionRegistry module
  - [x] 2.1 Create TenantActionRegistry with loading and fallback logic
    - Create
      `apps/vite-template/src/contexts/ai-sidekick/tenant-action-registry.ts`
    - Implement registry loader that accepts tenant config and returns
      `TenantActionRegistry`
    - Implement empty-registry fallback when tenant config is unavailable
    - Implement filtering of action types by trust level for grouping
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 10.3_

  - [ ]\* 2.2 Write property test: Registry schema invariant (Property 1)
    - **Property 1: Registry schema invariant**
    - **Validates: Requirements 1.1, 1.4**
    - Create
      `apps/vite-template/src/contexts/ai-sidekick/__tests__/registry.property.test.ts`

  - [ ]\* 2.3 Write property test: Tenant action types grouped by trust level
    (Property 12)
    - **Property 12: AI Capabilities Panel displays tenant action types grouped
      by trust level**
    - **Validates: Requirements 1.5, 5.2**

  - [ ]\* 2.4 Write property test: Tenant switch reloads registry and
    preferences (Property 16)
    - **Property 16: Tenant switch reloads registry and preferences**
    - **Validates: Requirements 1.2, 10.2**

- [x] 3. Implement AutomationPreferenceStore module
  - [x] 3.1 Create AutomationPreferenceStore with localStorage persistence
    - Create
      `apps/vite-template/src/contexts/ai-sidekick/automation-preference-store.ts`
    - Implement `load(cashierId, tenantId)` reading from localStorage key
      `ai-prefs:{tenantId}:{cashierId}`
    - Implement `save(cashierId, tenantId, pref)` with immediate persistence
    - Implement `disableAll(cashierId, tenantId)` bulk disable
    - Implement `isAutomated(actionTypeId)` check
    - Handle fallback to `defaultAutomation` values when localStorage is
      unavailable or corrupted
    - Filter out stale preferences for action types not in the current registry
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 10.1, 10.4_

  - [ ]\* 3.2 Write property test: Preference toggle persistence round-trip
    (Property 7)
    - **Property 7: Preference toggle persistence round-trip**
    - **Validates: Requirements 3.2, 5.4, 6.2, 6.3**
    - Create
      `apps/vite-template/src/contexts/ai-sidekick/__tests__/preference-store.property.test.ts`

  - [ ]\* 3.3 Write property test: Disable all sets every preference to disabled
    (Property 14)
    - **Property 14: Disable all sets every preference to disabled**
    - **Validates: Requirements 5.7**

  - [ ]\* 3.4 Write property test: Preference storage tenant isolation
    (Property 15)
    - **Property 15: Preference storage tenant isolation**
    - **Validates: Requirements 6.1, 6.5, 10.1**

  - [ ]\* 3.5 Write property test: Stale preferences are ignored (Property 17)
    - **Property 17: Stale preferences are ignored**
    - **Validates: Requirements 10.4**

- [x] 4. Checkpoint — Core data modules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement SuggestionEngine and SuggestionQueue
  - [x] 5.1 Create SuggestionEngine with queue and routing logic
    - Create `apps/vite-template/src/contexts/ai-sidekick/suggestion-engine.ts`
    - Implement `SuggestionQueue` with `enqueue`, `dequeue`, `clear`, and
      `current` tracking (one-at-a-time presentation)
    - Implement suggestion generation that produces valid `Suggestion` objects
      referencing registered action types
    - Implement routing logic: check `AutomationPreferenceStore.isAutomated()`
      to decide popup vs auto-execute path
    - _Requirements: 2.1, 2.2, 2.6, 4.1_

  - [ ]\* 5.2 Write property test: Suggestion schema invariant (Property 2)
    - **Property 2: Suggestion schema invariant**
    - **Validates: Requirements 2.1**
    - Create
      `apps/vite-template/src/contexts/ai-sidekick/__tests__/suggestion-engine.property.test.ts`

  - [ ]\* 5.3 Write property test: Suggestion routing by automation preference
    (Property 3)
    - **Property 3: Suggestion routing by automation preference**
    - **Validates: Requirements 2.2, 4.1**

  - [ ]\* 5.4 Write property test: Queue presents one suggestion at a time
    (Property 6)
    - **Property 6: Queue presents one suggestion at a time**
    - **Validates: Requirements 2.6**

- [x] 6. Implement AutomationExecutor
  - [x] 6.1 Create AutomationExecutor with execute and undo logic
    - Create
      `apps/vite-template/src/contexts/ai-sidekick/automation-executor.ts`
    - Implement `execute(suggestion)` returning `ExecutionResult` with optional
      `undoAction`
    - Implement `undo(suggestionId)` that invokes the stored undo action within
      the 5-second window
    - Implement failure fallback: on execution failure, re-route suggestion to
      queue for manual popup
    - _Requirements: 4.1, 4.4, 4.5_

  - [ ]\* 6.2 Write property test: Undo reverses auto-executed action
    (Property 11)
    - **Property 11: Undo reverses auto-executed action**
    - **Validates: Requirements 4.4**
    - Create
      `apps/vite-template/src/contexts/ai-sidekick/__tests__/automation-executor.property.test.ts`

  - [ ]\* 6.3 Write property test: Event log records all auto-executed actions
    (Property 18)
    - **Property 18: Event log records all auto-executed actions**
    - **Validates: Requirements 7.1**

- [x] 7. Implement AutomationEventLog
  - [x] 7.1 Create AutomationEventLog with session-scoped storage
    - Create
      `apps/vite-template/src/contexts/ai-sidekick/automation-event-log.ts`
    - Implement `add(event)`, `getRecent(count)` (returns last N entries, most
      recent first), and `clear()`
    - Entries are in-memory only, cleared on logout
    - _Requirements: 7.1, 7.2, 7.5_

  - [ ]\* 7.2 Write property test: Recent activity displays at most 20 entries
    (Property 19)
    - **Property 19: Recent activity displays at most 20 entries**
    - **Validates: Requirements 7.2**
    - Create
      `apps/vite-template/src/contexts/ai-sidekick/__tests__/event-log.property.test.ts`

  - [ ]\* 7.3 Write property test: Event log cleared on logout (Property 20)
    - **Property 20: Event log cleared on logout**
    - **Validates: Requirements 7.5**

- [x] 8. Checkpoint — All core logic modules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement AISidekickProvider and useAISidekick hook
  - [x] 9.1 Create AISidekickProvider context and hook
    - Create
      `apps/vite-template/src/contexts/ai-sidekick/ai-sidekick-provider.tsx`
    - Implement `AISidekickProvider` that composes `TenantActionRegistry`,
      `AutomationPreferenceStore`, `SuggestionEngine`, `AutomationExecutor`, and
      `AutomationEventLog`
    - Accept `TenantActionRegistry` as prop or load from tenant context
    - Expose `useAISidekick()` hook returning `AISidekickContextValue`
    - Throw descriptive error when `useAISidekick` is called outside provider
    - Wire preference changes to suggestion routing in real-time
    - Reload registry and preferences on tenant switch
    - Create `apps/vite-template/src/contexts/ai-sidekick/index.ts` barrel
      export
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.2_

  - [ ]\* 9.2 Write unit tests for AISidekickProvider integration
    - Create
      `apps/vite-template/src/contexts/ai-sidekick/__tests__/integration.test.tsx`
    - Test: `useAISidekick` throws outside provider
    - Test: provider nested inside `POSProvider` can access tenant info
    - Test: preference changes propagate to suggestion routing
    - Test: empty registry fallback when tenant config unavailable
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 1.3_

- [x] 10. Implement SuggestionPopup component
  - [x] 10.1 Create SuggestionPopup UI component
    - Create
      `apps/vite-template/src/components/ai-sidekick/suggestion-popup.tsx`
    - Render as floating dialog with `role="alertdialog"` and `aria-label`
      including action type display name
    - Display: suggestion description, action type display name, contextual
      reasoning, approve/dismiss buttons
    - Include opt-in toggle labeled "Allow AI Sidekick to handle
      {actionTypeName} automatically"
    - Auto-focus approve button on mount
    - Keyboard support: Tab cycles approve → dismiss → toggle, Enter/Space
      activates, Escape dismisses
    - Show high trust-level warning/confirmation when enabling toggle for
      high-risk action types
    - Opt-in toggle updates preference but does not execute/dismiss the current
      suggestion
    - _Requirements: 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.3, 8.4,
      8.5_

  - [ ]\* 10.2 Write property tests for SuggestionPopup
    - Create
      `apps/vite-template/src/components/ai-sidekick/__tests__/suggestion-popup.property.test.tsx`
    - **Property 4: Approve executes and removes suggestion** — Validates:
      Requirements 2.4
    - **Property 5: Dismiss discards without execution** — Validates:
      Requirements 2.5
    - **Property 9: Opt-in toggle independence from approve/dismiss** —
      Validates: Requirements 3.5
    - **Property 21: Suggestion popup focus management** — Validates:
      Requirements 8.1
    - **Property 22: Escape key dismisses suggestion without execution** —
      Validates: Requirements 8.3
    - **Property 23: Suggestion popup ARIA attributes** — Validates:
      Requirements 8.4, 8.5

  - [ ]\* 10.3 Write property test: High trust-level toggle requires
    confirmation (Property 8)
    - **Property 8: High trust-level toggle requires confirmation**
    - **Validates: Requirements 3.4**
    - Create
      `apps/vite-template/src/components/ai-sidekick/__tests__/capabilities-panel.property.test.tsx`

- [x] 11. Implement AutomationToast component
  - [x] 11.1 Create AutomationToast UI component
    - Create
      `apps/vite-template/src/components/ai-sidekick/automation-toast.tsx`
    - Non-blocking toast at bottom of screen
    - Display: action type display name, action summary, undo button
    - Auto-dismiss after 5 seconds
    - Undo button calls `undoAutomation` from context within the 5-second window
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]\* 11.2 Write property test: Auto-execution toast contains required
    information (Property 10)
    - **Property 10: Auto-execution toast contains required information**
    - **Validates: Requirements 4.2, 4.3**
    - Create
      `apps/vite-template/src/components/ai-sidekick/__tests__/automation-toast.property.test.tsx`

- [x] 12. Implement AICapabilitiesPanel component
  - [x] 12.1 Create AICapabilitiesPanel UI component
    - Create
      `apps/vite-template/src/components/ai-sidekick/ai-capabilities-panel.tsx`
    - Sub-view in profile drawer, accessed via "AI Capabilities" menu row with
      Sparkles icon
    - Group action types by trust level (Low → Medium → High)
    - Each row: icon, display name, description, trust level badge, toggle
      switch
    - Summary count: "X of Y automations active"
    - "Disable All Automations" button
    - "Recent Activity" section showing last 20 event log entries (most recent
      first)
    - Tapping an entry expands to show full details (payload summary, reasoning)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 7.2, 7.3, 7.4_

  - [ ]\* 12.2 Write property test: Automation summary count accuracy
    (Property 13)
    - **Property 13: Automation summary count accuracy**
    - **Validates: Requirements 5.5**

- [x] 13. Checkpoint — All UI components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Wire AISidekickProvider into POS layout and profile drawer
  - [x] 14.1 Nest AISidekickProvider inside POSProvider in App.tsx
    - Wrap POS routes in `App.tsx` with `AISidekickProvider` nested inside the
      existing `POSProvider`
    - Pass tenant action registry configuration (use sample/demo registry for
      initial wiring)
    - Create sample `TenantActionRegistry` data in
      `apps/vite-template/src/data/ai-action-types.json` with representative
      action types across all trust levels
    - _Requirements: 9.2, 9.5, 1.2_

  - [x] 14.2 Add SuggestionPopup and AutomationToast to POS layout
    - Render `SuggestionPopup` and `AutomationToast` within the POS layout so
      they are available on all POS pages
    - Connect to `useAISidekick` context for suggestion queue and event data
    - _Requirements: 2.2, 2.3, 4.2_

  - [x] 14.3 Add AI Capabilities menu row and panel to profile drawer
    - Add "AI Capabilities" row with Sparkles icon to the profile drawer menu
    - Wire the row to open `AICapabilitiesPanel` as a sub-view
    - _Requirements: 5.1_

- [x] 15. Final checkpoint — Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document (23 properties total)
- Unit tests validate specific examples, edge cases, and integration points
- All modules are built as pure logic first, then composed in the provider, then
  wired into the UI
