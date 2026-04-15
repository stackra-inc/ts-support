# Implementation Plan: Invitation System

## Overview

Build the `packages/invitation/` package (`Pixielity\Invitation`,
`pixielity/laravel-invitation`) — a standalone, reusable polymorphic invitation
lifecycle system. Implementation follows bottom-up order: scaffolding → data
layer → domain logic → HTTP layer → consumer migration. All code must have
comprehensive multiline docblocks, detailed comments, `declare(strict_types=1)`,
and follow all Pixielity steering conventions (attribute-driven config,
`Interface::ATTR_*` constants, repository pattern, `#[AsEvent]` events,
`#[Bind]`/`#[Scoped]`/`#[Singleton]` on interfaces).

## Tasks

- [x] 1. Package scaffolding and configuration
  - [x] 1.1 Create `packages/invitation/composer.json` with package name
        `pixielity/laravel-invitation`, namespace `Pixielity\\Invitation\\`,
        autoload PSR-4 mapping to `src/`, require `pixielity/laravel-crud`,
        `pixielity/laravel-database`, `pixielity/laravel-discovery`,
        `pixielity/laravel-enum`, `pixielity/laravel-event`, and `illuminate/*`
        deps. Include path repos for local dev, `@dev` constraints, and
        `allow-plugins` for attribute collector.
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Create `packages/invitation/module.json` with module name
        `Invitation`, alias `invitation`, version `1.0.0`, active flag true.
    - _Requirements: 1.2_

  - [x] 1.3 Create `packages/invitation/config/invitation.php` with all
        configurable values: `default_ttl` (7), `max_pending_per_context` (50),
        `rate_limit.max_per_window` (20), `rate_limit.window_minutes` (60),
        `notification_channels` (per event type), `reminder_schedule` ([3]),
        `domain_restrictions` (per invitable type with mode/domains), `contexts`
        (per-invitable-type overrides for TTL and max pending). Every key must
        have a multiline docblock comment block.
    - _Requirements: 10.1, 10.2, 10.3, 4.1, 4.2, 1.8_

  - [x] 1.4 Create the directory structure under `packages/invitation/src/`:
        `Attributes/`, `Concerns/`, `Contracts/`, `Contracts/Data/`,
        `Controllers/`, `Data/`, `Enums/`, `Events/`, `Exceptions/`,
        `Migrations/`, `Models/`, `Notifications/`, `Providers/`,
        `Repositories/`, `Resources/`, `Services/`, `Commands/`, `routes/`. Add
        `.gitkeep` files in empty directories.
    - _Requirements: 1.3_

- [x] 2. Enums
  - [x] 2.1 Create `packages/invitation/src/Enums/InvitationStatus.php` — backed
        string enum with cases: `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`,
        `REVOKED`. Each case must have `#[Label]` and `#[Description]`
        attributes, PHPDoc comment, and `use Enum` trait. Implement
        `isPending()`, `isTerminal()`, `isActionable()` helper methods using
        `match` expressions. Include `@method static` annotations in class
        docblock. Use section headers
        (`// =========================================================================`).
    - _Requirements: 2.6, 2.7_

  - [x] 2.2 Create `packages/invitation/src/Enums/InvitationChannel.php` —
        backed string enum with cases: `EMAIL`, `SMS`, `LINK`. Each case with
        `#[Label]`, `#[Description]`, PHPDoc, `use Enum` trait. Include helper
        methods `requiresNotification(): bool` (true for EMAIL/SMS, false for
        LINK).
    - _Requirements: 6.1_

- [x] 3. Data interface
  - [x] 3.1 Create
        `packages/invitation/src/Contracts/Data/InvitationInterface.php` with
        `#[Bind(Invitation::class)]`. Define `TABLE = 'invitations'`, all
        `ATTR_*` constants (`ATTR_ID`, `ATTR_TOKEN`, `ATTR_EMAIL`,
        `ATTR_INVITABLE_TYPE`, `ATTR_INVITABLE_ID`, `ATTR_ROLE`,
        `ATTR_INVITED_BY`, `ATTR_STATUS`, `ATTR_MESSAGE`, `ATTR_METADATA`,
        `ATTR_PERMISSIONS`, `ATTR_CHANNEL`, `ATTR_EXPIRES_AT`,
        `ATTR_ACCEPTED_AT`, `ATTR_DECLINED_AT`, `ATTR_REVOKED_AT`,
        `ATTR_REMINDED_AT`, `ATTR_CREATED_AT`, `ATTR_UPDATED_AT`), and `REL_*`
        constants (`REL_INVITABLE`, `REL_INVITER`). Each constant must have a
        PHPDoc comment.
    - _Requirements: 1.4, 2.1_

- [x] 4. Model
  - [x] 4.1 Create `packages/invitation/src/Models/Invitation.php` with
        `#[Table(InvitationInterface::TABLE)]` and `#[Unguarded]` attributes,
        implementing `InvitationInterface`. Define `casts()` method casting
        `status` to `InvitationStatus`,
        `expires_at`/`accepted_at`/`declined_at`/`revoked_at`/`reminded_at` to
        `datetime`, `metadata`/`permissions` to `array`, `channel` to
        `InvitationChannel`. Define `invitable(): MorphTo` and
        `inviter(): BelongsTo` (cross-context FK to User model, no constrained).
        Full docblocks on every method and relationship.
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 5. Migration
  - [x] 5.1 Create
        `packages/invitation/src/Migrations/0001_01_01_000001_create_invitations_table.php`.
        Use `InvitationInterface::TABLE` for table name and
        `InvitationInterface::ATTR_*` constants for ALL column names. Create all
        columns per the design schema. `invited_by` as `unsignedBigInteger`
        (cross-context FK, no `constrained()`). Create indexes on `email`,
        `status`, `invited_by`, `expires_at`, and composite index on
        `(invitable_type, invitable_id, email, status)` named
        `invitations_duplicate_detection_index`. Use
        `$table->morphs(InvitationInterface::REL_INVITABLE)` for polymorphic
        columns.
    - _Requirements: 2.1, 2.8, 2.9_

- [x] 6. Exceptions
  - [x] 6.1 Create the base
        `packages/invitation/src/Exceptions/InvitationException.php` — abstract
        class extending `\RuntimeException`. Then create all 8 concrete
        exception classes in the same directory: `DuplicateInvitationException`,
        `SelfInviteException`, `MaxPendingInvitationsException`,
        `RateLimitExceededException`, `DomainRestrictedException`,
        `AlreadyMemberException`, `InvalidTokenException`,
        `ExpiredInvitationException`, `InvalidTransitionException`. Each must
        have a descriptive static factory method (e.g.,
        `forEmail(string $email): static`) and comprehensive docblocks. Each
        file must have `declare(strict_types=1)` and file-level docblock.
    - _Requirements: 3.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.7, 9.3_

- [x] 7. Domain events
  - [x] 7.1 Create all 6 domain event classes in
        `packages/invitation/src/Events/`: `InvitationCreated`,
        `InvitationAccepted`, `InvitationDeclined`, `InvitationExpired`,
        `InvitationRevoked`, `InvitationResent`. Each must be `final readonly`
        with `#[AsEvent]` attribute, carrying only IDs as constructor-promoted
        properties per the design event catalog. Each file must have
        `declare(strict_types=1)`, file-level docblock, and class-level
        docblock.
    - _Requirements: 3.7, 3.8, 11.4_

- [x] 8. BulkInvitationResult DTO
  - [x] 8.1 Create `packages/invitation/src/Data/BulkInvitationResult.php` —
        `final readonly` class with `Collection $successful` and
        `Collection $failed` constructor-promoted properties. Implement
        `isFullySuccessful(): bool` and `hasFailures(): bool` methods. Full
        docblocks.
    - _Requirements: 6.5_

- [x] 9. InvitableInterface contract
  - [x] 9.1 Create `packages/invitation/src/Contracts/InvitableInterface.php`
        declaring `isAlreadyMember(string $email): bool` and
        `getInvitationTtl(): ?int`. Full docblocks explaining the contract and
        how consumer models implement it.
    - _Requirements: 5.6, 11.1, 11.2_

- [x] 10. Repository interface and implementation
  - [x] 10.1 Create
        `packages/invitation/src/Contracts/InvitationRepositoryInterface.php`
        with `#[Bind(InvitationRepository::class)]` and `#[Singleton]`
        attributes, extending `RepositoryInterface`. Declare all query methods:
        `findByToken`, `findByInvitable`, `findPendingByInvitable`,
        `findByEmail`, `findByInviter`, `countPendingByInvitable`,
        `countRecentByInviter`. Full docblocks with `@param` and `@return` tags
        on every method.
    - _Requirements: 1.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 10.2 Create
        `packages/invitation/src/Repositories/InvitationRepository.php` with
        `#[AsRepository]`, `#[UseModel(InvitationInterface::class)]`,
        `#[Filterable]`, `#[Sortable]` attributes. Extend base `Repository`,
        implement `InvitationRepositoryInterface`. All query methods must use
        `$this->query()` and `InvitationInterface::ATTR_*` constants.
        `countRecentByInviter` must use
        `where(ATTR_CREATED_AT, '>=', now()->subMinutes($minutes))`. Full
        docblocks on every method.
    - _Requirements: 1.5, 8.1–8.8_

  - [ ]\* 10.3 Write property tests for repository query methods
    - **Property 15: Repository findByToken round-trip**
    - **Property 16: Repository filter queries return correct subsets**
    - **Property 17: Repository count queries return correct counts**
    - **Validates: Requirements 8.1–8.7**

- [x] 11. Checkpoint — Verify data layer
  - Ensure all tests pass, ask the user if questions arise. Verify enums, model,
    migration, exceptions, events, repository all compile and are consistent.

- [x] 12. Service interface and implementation
  - [x] 12.1 Create
        `packages/invitation/src/Contracts/InvitationServiceInterface.php` with
        `#[Bind(InvitationService::class)]` and `#[Scoped]` attributes,
        extending `ServiceInterface`. Declare all methods: `createInvitation`,
        `acceptInvitation`, `declineInvitation`, `revokeInvitation`,
        `resendInvitation`, `bulkInvite`, `forceAccept`, `forceExpire`. Full
        docblocks with `@param`, `@return`, and `@throws` tags for every
        exception each method can throw.
    - _Requirements: 1.6, 3.1–3.7, 5.1–5.7, 6.2–6.5, 9.1–9.3_

  - [x] 12.2 Create `packages/invitation/src/Services/InvitationService.php`
        with `#[UseRepository(InvitationRepositoryInterface::class)]` attribute,
        extending base `Service`, implementing `InvitationServiceInterface`.
        Inject `InvitationRepositoryInterface` via constructor. Implement all
        public methods and private helpers:
    - `createInvitation(...)` — run validation guards in order (self-invite →
      already-member → duplicate → domain restriction → rate limit → max
      pending), generate cryptographic token via `Str::random(64)`, resolve TTL,
      create record, dispatch `InvitationCreated` event, dispatch notification
      (unless channel is `link`).
    - `acceptInvitation(token, userId)` — find by token (throw
      `InvalidTokenException`), lazy-expire check (throw
      `ExpiredInvitationException`), status check (throw
      `InvalidTransitionException`), update status to ACCEPTED + set
      `accepted_at`, dispatch `InvitationAccepted`.
    - `declineInvitation(token)` — same token/expiry/status checks, update to
      DECLINED + set `declined_at`, dispatch `InvitationDeclined`.
    - `revokeInvitation(invitationId, revokedBy)` — find by ID, status check,
      update to REVOKED + set `revoked_at`, dispatch `InvitationRevoked`.
    - `resendInvitation(invitationId)` — find by ID, status check, regenerate
      token, reset `expires_at`, dispatch `InvitationResent`, re-send
      notification.
    - `bulkInvite(...)` — iterate emails, wrap each `createInvitation` in
      try/catch for `InvitationException`, collect successes and failures,
      return `BulkInvitationResult`.
    - `forceAccept(invitationId)` — status check, update to ACCEPTED + set
      `accepted_at`, dispatch `InvitationAccepted`.
    - `forceExpire(invitationId)` — status check, update to EXPIRED, dispatch
      `InvitationExpired`.
    - Private helpers: `resolveInvitable(type, id)`,
      `resolveTtl(invitableType, ?invitable)`, `generateToken()`,
      `validateInvitation(email, invitableType, invitableId, invitedBy)`,
      `validateDomainRestriction(email, invitableType)`.
    - All methods must use `InvitationInterface::ATTR_*` constants, never
      hardcoded strings.
    - Full multiline docblocks on every method (public and private).
    - _Requirements: 3.1–3.7, 4.3, 4.4, 5.1–5.7, 6.2–6.5, 9.1–9.3, 10.2_

  - [ ]\* 12.3 Write property test for invitation creation invariants
    - **Property 3: Invitation creation invariants**
    - **Validates: Requirements 3.1, 4.2, 4.3**

  - [ ]\* 12.4 Write property tests for state transitions
    - **Property 4: State transitions produce correct status and timestamps**
    - **Property 5: Resend regenerates token and resets TTL**
    - **Property 6: Non-actionable invitations reject operations**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.4, 9.1, 9.2,
      9.3**

  - [ ]\* 12.5 Write property tests for validation guards
    - **Property 7: Duplicate invitation guard**
    - **Property 8: Self-invite guard**
    - **Property 9: Max pending guard**
    - **Property 10: Rate limit guard**
    - **Property 11: Domain restriction guard**
    - **Property 12: Already-member guard**
    - **Validates: Requirements 5.1–5.5, 5.7**

  - [ ]\* 12.6 Write property tests for channel and bulk operations
    - **Property 13: Link channel skips notification**
    - **Property 14: Bulk invite partitions successes and failures**
    - **Validates: Requirements 6.4, 6.5, 6.6**

- [x] 13. Checkpoint — Verify service layer
  - Ensure all tests pass, ask the user if questions arise. Verify service
    correctly orchestrates repository, events, notifications, and validation
    guards.

- [x] 14. Notifications
  - [x] 14.1 Create
        `packages/invitation/src/Notifications/InvitationSentNotification.php` —
        Laravel Notification class. Accepts invitation model data in
        constructor. Implements `via()` reading channels from config
        `notification_channels.invitation_sent`. Implements `toMail()` with
        token URL, inviter name, invitable context, personal message. Implements
        `toVonage()` for SMS channel. Full docblocks.
    - _Requirements: 7.1, 7.5, 7.6_

  - [x] 14.2 Create
        `packages/invitation/src/Notifications/InvitationAcceptedNotification.php`
        — notifies inviter. Implements `via()` from config
        `notification_channels.invitation_accepted`. Implements `toMail()` and
        `toDatabase()` with invitee email and invitable context. Full docblocks.
    - _Requirements: 7.2, 7.5, 7.6_

  - [x] 14.3 Create
        `packages/invitation/src/Notifications/InvitationDeclinedNotification.php`
        — notifies inviter. Same pattern as accepted notification but for
        decline. Full docblocks.
    - _Requirements: 7.3, 7.5, 7.6_

  - [x] 14.4 Create
        `packages/invitation/src/Notifications/InvitationReminderNotification.php`
        — notifies invitee via email. Includes token URL and days remaining.
        Configurable schedule from `reminder_schedule`. Full docblocks.
    - _Requirements: 7.4, 7.5, 7.6_

- [x] 15. Artisan command
  - [x] 15.1 Create
        `packages/invitation/src/Commands/ExpireInvitationsCommand.php` with
        signature `invitation:expire` and optional `--chunk` argument (default:
        500). Query all PENDING invitations with `expires_at` in the past using
        chunked processing. Transition each to EXPIRED status and dispatch
        `InvitationExpired` event. Use Laravel Prompts functions for output (not
        `$this->info()`). Use `InvitationInterface::ATTR_*` constants for all
        queries. Full docblocks.
    - _Requirements: 4.5, 4.6_

  - [ ]\* 15.2 Write property test for batch expiration command
    - **Property 18: Batch expiration command expires all overdue invitations**
    - **Validates: Requirements 4.5, 4.6**

- [x] 16. Controller and API resources
  - [x] 16.1 Create `packages/invitation/src/Resources/InvitationResource.php` —
        Laravel JsonResource for invitation API responses. Map all relevant
        fields using `InvitationInterface::ATTR_*` constants. Full docblocks.
    - _Requirements: 1.3_

  - [x] 16.2 Create
        `packages/invitation/src/Controllers/InvitationController.php` — HTTP
        controller delegating to `InvitationServiceInterface`. Implement
        endpoints: `index` (list invitations for invitable context with
        filtering/sorting), `store` (create invitation), `show` (get by token),
        `accept` (accept by token), `decline` (decline by token), `revoke`
        (revoke by ID), `resend` (resend by ID), `bulkInvite` (bulk create),
        `forceAccept` (admin), `forceExpire` (admin). Each method catches domain
        exceptions and returns appropriate HTTP status codes per the exception
        catalog. Use form request validation or inline validation. Full
        docblocks on every method.
    - _Requirements: 3.1–3.7, 5.1–5.7, 6.2–6.5, 9.1–9.3_

- [x] 17. Routes
  - [x] 17.1 Create `packages/invitation/src/routes/api.php` with route
        definitions for all controller endpoints. Use route groups with
        appropriate middleware. Define RESTful routes for CRUD operations and
        custom routes for accept, decline, revoke, resend, bulk-invite,
        force-accept, force-expire.
    - _Requirements: 1.3_

- [x] 18. Service provider
  - [x] 18.1 Create
        `packages/invitation/src/Providers/InvitationServiceProvider.php` with
        `#[Module(name: 'Invitation')]` and
        `#[LoadsResources(migrations: true, routes: true, config: true, commands: true)]`
        attributes. Extend base `ServiceProvider`. The class body should be
        empty — all bindings are handled by `#[Bind]`, `#[Scoped]`,
        `#[Singleton]` attributes on interfaces. Full file-level and class-level
        docblocks explaining the attribute-driven binding approach.
    - _Requirements: 1.7, 1.8_

- [x] 19. Checkpoint — Verify invitation package
  - Ensure all tests pass, ask the user if questions arise. Verify the complete
    invitation package compiles, routes register, service provider boots, and
    all components are wired together.

- [x] 20. Family package migration
  - [x] 20.1 Add `"pixielity/laravel-invitation": "@dev"` to
        `packages/family/composer.json` require section. Add path repo entry for
        `"../invitation"`.
    - _Requirements: 12.2_

  - [x] 20.2 Remove old invitation files from the family package:
        `src/Models/Invitation.php`,
        `src/Contracts/Data/InvitationInterface.php`,
        `src/Contracts/InvitationRepositoryInterface.php`,
        `src/Repositories/InvitationRepository.php`,
        `src/Enums/InvitationStatus.php`, `src/Events/InvitationSent.php`,
        `src/Events/InvitationAccepted.php`,
        `src/Migrations/0001_01_01_000002_create_invitations_table.php`.
    - _Requirements: 12.1_

  - [x] 20.3 Update `packages/family/src/Models/FamilyAccount.php` to implement
        `Pixielity\Invitation\Contracts\InvitableInterface`. Add
        `isAlreadyMember(string $email): bool` method (resolve user by email via
        `UserServiceInterface`, check membership via `members()` relationship).
        Add `getInvitationTtl(): ?int` returning null (use default). Update
        `invitations()` relationship to use
        `\Pixielity\Invitation\Models\Invitation::class` and
        `\Pixielity\Invitation\Contracts\Data\InvitationInterface::REL_INVITABLE`.
        Full docblocks.
    - _Requirements: 12.3, 11.1, 11.2_

  - [x] 20.4 Refactor `packages/family/src/Services/FamilyAccountService.php` —
        replace `InvitationRepositoryInterface` dependency with
        `Pixielity\Invitation\Contracts\InvitationServiceInterface`. Update
        constructor. Rewrite `invite()` to delegate to
        `$this->invitationService->createInvitation(...)`. Rewrite
        `acceptInvitation()` to call
        `$this->invitationService->acceptInvitation(token, userId)` then perform
        context-specific side effect (add family member). Remove old imports for
        family invitation classes. Full docblocks.
    - _Requirements: 12.4, 12.5_

  - [x] 20.5 Update
        `packages/family/src/Contracts/FamilyAccountServiceInterface.php` —
        retain `invite()` and `acceptInvitation()` method signatures unchanged.
        Update import statements only (remove old family invitation imports if
        any). Ensure backward compatibility for consumers.
    - _Requirements: 12.5_

- [x] 21. Final checkpoint — Full integration verification
  - Ensure all tests pass, ask the user if questions arise. Verify the family
    package correctly delegates to the invitation package, all old invitation
    files are removed, and the `FamilyAccountService` facade methods work as
    before.

  - [ ]\* 21.1 Write property tests for enum correctness and JSON round-trip
    - **Property 1: InvitationStatus enum correctness**
    - **Property 2: JSON field round-trip**
    - **Validates: Requirements 2.3, 2.4, 2.7**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document
- All code must follow Pixielity steering conventions:
  `declare(strict_types=1)`, file-level docblocks, multiline method docblocks,
  `Interface::ATTR_*` constants, no hardcoded strings, attribute-driven bindings
- Service provider body must be empty — all bindings via `#[Bind]`, `#[Scoped]`,
  `#[Singleton]` on interfaces
- Cross-context FKs (`invited_by`) use `unsignedBigInteger` + index, no
  `constrained()`
- Domain events are `final readonly` DTOs with `#[AsEvent]`, carrying only IDs
