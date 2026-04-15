# Requirements Document

## Introduction

The Invitation package (`packages/invitation/`, namespace
`Pixielity\Invitation`, composer name `pixielity/laravel-invitation`) is a
standalone, reusable invitation system extracted from the family package. It
provides a complete polymorphic invitation lifecycle that any bounded context
can consume — family invites, admin invites, tenant invites, developer
collaborator invites, referral invites, and any future invitable context.

The current family package has a basic invitation implementation (create +
accept by token). This new package replaces it with a full-fledged system
covering the entire invitation lifecycle, validation guards, bulk operations,
notifications, audit trails, and admin overrides. The family package becomes a
consumer of this package.

## Glossary

- **Invitation_System**: The standalone `Pixielity\Invitation` package that
  manages the full invitation lifecycle.
- **Invitation**: A polymorphic record representing an invite from an inviter to
  an invitee email, associated with an invitable context.
- **Invitable_Context**: Any entity that can be the target of an invitation
  (FamilyAccount, Tenant, Team, etc.), identified by `invitable_type` +
  `invitable_id`.
- **Inviter**: The authenticated user who creates and sends an invitation.
- **Invitee**: The person (identified by email) who receives an invitation.
- **Invitation_Token**: A unique, cryptographically random string used to
  identify and act on an invitation via URL.
- **Invitation_Status**: The lifecycle state of an invitation: PENDING,
  ACCEPTED, DECLINED, EXPIRED, or REVOKED.
- **Invitation_Repository**: The repository responsible for all invitation query
  logic.
- **Invitation_Service**: The service responsible for invitation business logic,
  orchestration, and domain event dispatching.
- **Invitable_Interface**: A PHP interface that any model must implement to
  register as an invitable context.
- **TTL**: Time-to-live — the duration an invitation remains valid before
  automatic expiration.
- **Rate_Limiter**: A guard that restricts the number of invitations an inviter
  can send within a configurable time window.
- **Domain_Restriction**: An allowlist or blocklist of email domains that
  controls which email addresses can receive invitations for a given invitable
  context.
- **Bulk_Invitation**: The ability to create and send invitations to multiple
  email addresses in a single operation.
- **Invitation_Channel**: The delivery mechanism for an invitation notification
  (email, SMS, or shareable link).

## Requirements

### Requirement 1: Package Structure and Standards Compliance

**User Story:** As a developer, I want the invitation package to follow all
Pixielity steering conventions, so that it integrates seamlessly with the
existing modular monolith architecture.

#### Acceptance Criteria

1. THE Invitation_System SHALL reside at `packages/invitation/` with namespace
   `Pixielity\Invitation` and composer name `pixielity/laravel-invitation`.
2. THE Invitation_System SHALL include all required package files:
   `composer.json`, `module.json`, `phpunit.xml`, `rector.php`, `.gitignore`,
   `CHANGELOG.md`, `LICENSE`, `README.md`.
3. THE Invitation_System SHALL follow the standard source layout: `Attributes/`,
   `Concerns/`, `Contracts/Data/`, `Controllers/`, `Enums/`, `Events/`,
   `Migrations/`, `Models/`, `Providers/`, `Repositories/`, `Resources/`,
   `Services/`, `routes/`.
4. THE Invitation*System SHALL provide an `InvitationInterface` in
   `Contracts/Data/` with
   `ATTR*\_`constants for all columns,`REL\_\_`constants for relationships, and a`TABLE`
   constant.
5. THE Invitation_System SHALL provide an `InvitationRepositoryInterface` in
   `Contracts/` with `#[Bind]` and `#[Singleton]` attributes.
6. THE Invitation_System SHALL provide an `InvitationServiceInterface` in
   `Contracts/` with `#[Bind]` and `#[Scoped]` attributes.
7. THE Invitation_System SHALL provide an `InvitationServiceProvider` with
   `#[Module(name: 'Invitation')]` and
   `#[LoadsResources(migrations: true, routes: true, config: true, commands: true)]`.
8. THE Invitation_System SHALL publish a config file (`config/invitation.php`)
   for all configurable values (TTL, rate limits, max pending, notification
   channels, domain restrictions).

### Requirement 2: Invitation Data Model

**User Story:** As a developer, I want a polymorphic invitation model with rich
metadata, so that any entity across the platform can use invitations with
context-specific data.

#### Acceptance Criteria

1. THE Invitation_System SHALL store invitations in a table with columns: `id`,
   `token` (unique), `email`, `invitable_type`, `invitable_id`, `role`,
   `invited_by`, `status`, `message` (nullable text for personal message),
   `metadata` (nullable JSON), `permissions` (nullable JSON), `channel` (string,
   default 'email'), `expires_at`, `accepted_at` (nullable), `declined_at`
   (nullable), `revoked_at` (nullable), `reminded_at` (nullable), `created_at`,
   `updated_at`.
2. THE Invitation model SHALL use `#[Table]` and `#[Unguarded]` attributes and
   implement `InvitationInterface`.
3. THE Invitation model SHALL cast `status` to the `InvitationStatus` enum, and
   cast `expires_at`, `accepted_at`, `declined_at`, `revoked_at`, `reminded_at`
   to `datetime`.
4. THE Invitation model SHALL cast `metadata` and `permissions` to `array`.
5. THE Invitation model SHALL define a `invitable()` morphTo relationship and an
   `inviter()` belongsTo relationship referencing the User model (cross-context,
   no FK constraint).
6. THE Invitation_System SHALL provide an `InvitationStatus` enum with cases:
   `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`, `REVOKED`, each with `#[Label]`
   and `#[Description]` attributes and the `use Enum` trait.
7. THE InvitationStatus enum SHALL provide `isPending()`, `isTerminal()`, and
   `isActionable()` helper methods using `match` expressions.
8. THE migration SHALL use `InvitationInterface::ATTR_*` constants for all
   column names and `InvitationInterface::TABLE` for the table name.
9. THE migration SHALL create indexes on `email`, `status`, `invited_by`,
   `expires_at`, and a composite index on `invitable_type` + `invitable_id` +
   `email` + `status` for duplicate detection.

### Requirement 3: Core Invitation Lifecycle

**User Story:** As a developer, I want a complete invitation lifecycle (create,
accept, decline, revoke, resend, expire), so that all invitation state
transitions are handled consistently.

#### Acceptance Criteria

1. WHEN a valid invitation request is received, THE Invitation_Service SHALL
   create an invitation with a cryptographically random token, set status to
   PENDING, and set `expires_at` based on the configured TTL for the invitable
   context.
2. WHEN an invitee provides a valid, non-expired, PENDING invitation token, THE
   Invitation_Service SHALL transition the invitation status to ACCEPTED, set
   `accepted_at` to the current timestamp, and return the accepted invitation.
3. WHEN an invitee provides a valid, non-expired, PENDING invitation token for
   decline, THE Invitation_Service SHALL transition the invitation status to
   DECLINED and set `declined_at` to the current timestamp.
4. WHEN an inviter requests revocation of a PENDING invitation, THE
   Invitation_Service SHALL transition the invitation status to REVOKED and set
   `revoked_at` to the current timestamp.
5. WHEN an inviter requests resend of a PENDING invitation, THE
   Invitation_Service SHALL regenerate the token, reset `expires_at` based on
   the configured TTL, and dispatch a new notification.
6. IF an invitation token is invalid, expired, or in a terminal state (ACCEPTED,
   DECLINED, EXPIRED, REVOKED), THEN THE Invitation_Service SHALL throw a
   domain-specific exception with a descriptive error message.
7. THE Invitation_Service SHALL dispatch domain events for all state
   transitions: `InvitationCreated`, `InvitationAccepted`, `InvitationDeclined`,
   `InvitationExpired`, `InvitationRevoked`, `InvitationResent`.
8. THE domain events SHALL be readonly DTOs carrying only IDs (`invitationId`,
   `email`, `invitedBy`, `invitableType`, `invitableId`) and use the
   `#[AsEvent]` attribute.

### Requirement 4: Automatic Expiration

**User Story:** As a platform operator, I want invitations to expire
automatically after a configurable TTL, so that stale invitations do not remain
actionable indefinitely.

#### Acceptance Criteria

1. THE Invitation_System SHALL provide a configurable default TTL (default: 7
   days) in `config/invitation.php`.
2. THE Invitation_System SHALL allow per-invitable-context TTL overrides via the
   configuration file.
3. THE Invitation_Service SHALL set `expires_at` on creation using the resolved
   TTL for the given invitable context.
4. WHEN an action is attempted on an invitation whose `expires_at` is in the
   past and status is PENDING, THE Invitation_Service SHALL transition the
   status to EXPIRED before rejecting the action.
5. THE Invitation_System SHALL provide an Artisan command (`invitation:expire`)
   that queries all PENDING invitations with `expires_at` in the past,
   transitions each to EXPIRED, and dispatches `InvitationExpired` events.
6. THE `invitation:expire` command SHALL accept an optional `--chunk` argument
   (default: 500) to process invitations in batches for memory efficiency.

### Requirement 5: Validation Guards

**User Story:** As a developer, I want built-in validation guards that prevent
duplicate, self, and invalid invitations, so that the invitation system enforces
data integrity without requiring consumer packages to implement these checks.

#### Acceptance Criteria

1. WHEN an invitation is created for an email that already has a PENDING
   invitation in the same invitable context, THE Invitation_Service SHALL reject
   the request with a `DuplicateInvitationException`.
2. WHEN an inviter attempts to invite their own email address, THE
   Invitation_Service SHALL reject the request with a `SelfInviteException`.
3. WHEN the number of PENDING invitations for an invitable context reaches the
   configured maximum, THE Invitation_Service SHALL reject the request with a
   `MaxPendingInvitationsException`.
4. WHEN an inviter exceeds the configured rate limit (max invitations per time
   window), THE Invitation_Service SHALL reject the request with a
   `RateLimitExceededException`.
5. WHERE email domain restrictions are configured for an invitable context, THE
   Invitation_Service SHALL validate the invitee email domain against the
   allowlist or blocklist and reject non-compliant emails with a
   `DomainRestrictedException`.
6. THE Invitation_System SHALL provide an `InvitableInterface` with a method
   `isAlreadyMember(string $email): bool` that invitable context models
   implement, enabling the Invitation_Service to check membership before
   creating an invitation.
7. WHEN the invitable context reports that the email is already a member, THE
   Invitation_Service SHALL reject the request with an `AlreadyMemberException`.

### Requirement 6: Invitation Channels and Bulk Operations

**User Story:** As a developer, I want to send invitations via multiple channels
and invite multiple people at once, so that the invitation system supports
diverse delivery needs efficiently.

#### Acceptance Criteria

1. THE Invitation_System SHALL support three invitation channels: `email`
   (primary), `sms`, and `link`.
2. WHEN the channel is `email`, THE Invitation_Service SHALL dispatch a Laravel
   notification to the invitee email address containing the invitation token
   URL.
3. WHEN the channel is `sms`, THE Invitation_Service SHALL dispatch a Laravel
   notification via the SMS channel containing the invitation token URL.
4. WHEN the channel is `link`, THE Invitation_Service SHALL create the
   invitation record and return the token URL without dispatching a
   notification, enabling the inviter to share the link manually.
5. WHEN a bulk invitation request is received with multiple email addresses, THE
   Invitation_Service SHALL validate each email individually, create invitations
   for all valid emails, collect validation failures, and return a result object
   containing both successful invitations and per-email errors.
6. THE bulk invitation operation SHALL apply all validation guards (duplicate,
   self-invite, rate limit, domain restriction, max pending) to each email
   individually.

### Requirement 7: Notifications

**User Story:** As a platform operator, I want configurable notifications for
invitation lifecycle events, so that inviters and invitees are kept informed of
invitation status changes.

#### Acceptance Criteria

1. WHEN an invitation is created with channel `email` or `sms`, THE
   Invitation_System SHALL send a notification to the invitee containing the
   invitation token URL and optional personal message.
2. WHEN an invitation is accepted, THE Invitation_System SHALL send a
   notification to the inviter informing them of the acceptance.
3. WHEN an invitation is declined, THE Invitation_System SHALL send a
   notification to the inviter informing them of the decline.
4. THE Invitation_System SHALL provide configurable reminder notifications for
   PENDING invitations, with a configurable schedule (default: one reminder
   after 3 days).
5. THE Invitation_System SHALL allow notification channels to be configured per
   event type in `config/invitation.php`.
6. THE notifications SHALL be implemented as Laravel Notification classes,
   enabling consumer packages to override or extend them.

### Requirement 8: Query and Audit Capabilities

**User Story:** As a developer, I want rich query methods and audit trails for
invitations, so that I can build admin interfaces and track invitation activity.

#### Acceptance Criteria

1. THE Invitation_Repository SHALL provide `findByToken(string $token)` to
   retrieve an invitation by its unique token.
2. THE Invitation_Repository SHALL provide
   `findByInvitable(string $invitableType, int|string $invitableId)` to retrieve
   all invitations for a given invitable context.
3. THE Invitation_Repository SHALL provide
   `findPendingByInvitable(string $invitableType, int|string $invitableId)` to
   retrieve all PENDING invitations for a given invitable context.
4. THE Invitation_Repository SHALL provide `findByEmail(string $email)` to
   retrieve all invitations sent to a specific email address.
5. THE Invitation_Repository SHALL provide
   `findByInviter(int|string $inviterId)` to retrieve all invitations sent by a
   specific user.
6. THE Invitation_Repository SHALL provide
   `countPendingByInvitable(string $invitableType, int|string $invitableId)` to
   count PENDING invitations for max-pending validation.
7. THE Invitation_Repository SHALL provide
   `countRecentByInviter(int|string $inviterId, int $minutes)` to count recent
   invitations by an inviter for rate limiting.
8. THE Invitation_Repository SHALL use `#[Filterable]` and `#[Sortable]`
   attributes to support request-based filtering on `email`, `status`,
   `invitable_id`, `invited_by`, `created_at`, `expires_at` and sorting on
   `email`, `status`, `created_at`, `expires_at`.

### Requirement 9: Admin Override Operations

**User Story:** As an admin, I want to force-accept or force-expire invitations,
so that I can manage invitations that require manual intervention.

#### Acceptance Criteria

1. WHEN an admin requests force-accept on a PENDING invitation, THE
   Invitation_Service SHALL transition the status to ACCEPTED, set
   `accepted_at`, and dispatch `InvitationAccepted` without requiring a token or
   user ID.
2. WHEN an admin requests force-expire on a PENDING invitation, THE
   Invitation_Service SHALL transition the status to EXPIRED and dispatch
   `InvitationExpired`.
3. IF a force operation is attempted on an invitation that is not in PENDING
   status, THEN THE Invitation_Service SHALL throw an
   `InvalidTransitionException`.

### Requirement 10: Configuration

**User Story:** As a developer, I want all invitation behavior to be
configurable via a config file, so that I can tune the system per deployment
without code changes.

#### Acceptance Criteria

1. THE Invitation_System SHALL publish a `config/invitation.php` file with the
   following configurable values: `default_ttl` (integer, days, default: 7),
   `max_pending_per_context` (integer, default: 50), `rate_limit.max_per_window`
   (integer, default: 20), `rate_limit.window_minutes` (integer, default: 60),
   `notification_channels` (array, per event type), `reminder_schedule` (array
   of day offsets, default: [3]), `domain_restrictions` (array, per invitable
   type with `mode` allowlist/blocklist and `domains` list).
2. THE Invitation_Service SHALL read configuration values from the published
   config file at runtime.
3. THE configuration SHALL allow per-invitable-type overrides for `default_ttl`
   and `max_pending_per_context` via a `contexts` key in the config.

### Requirement 11: Integration with Invitable Contexts

**User Story:** As a developer of a consumer package (e.g., family, tenancy), I
want a clear interface to register my model as an invitable context, so that the
invitation system works with my domain without tight coupling.

#### Acceptance Criteria

1. THE Invitation_System SHALL provide an `InvitableInterface` in `Contracts/`
   that invitable context models implement.
2. THE InvitableInterface SHALL declare methods:
   `isAlreadyMember(string $email): bool` and `getInvitationTtl(): ?int`
   (returns context-specific TTL in days, or null for default).
3. THE Invitation_Service SHALL resolve the invitable model via the polymorphic
   `invitable_type` and call `InvitableInterface` methods during validation.
4. THE Invitation_System SHALL dispatch domain events with `invitableType` and
   `invitableId` so that consumer packages can listen and perform
   context-specific side effects (e.g., adding a family member on acceptance).

### Requirement 12: Family Package Migration

**User Story:** As a developer, I want the family package to consume the
invitation package instead of maintaining its own invitation implementation, so
that invitation logic is centralized and reusable.

#### Acceptance Criteria

1. WHEN the invitation package is integrated, THE family package SHALL remove
   its own `Invitation` model, `InvitationInterface`, `InvitationStatus` enum,
   `InvitationRepository`, `InvitationRepositoryInterface`, `InvitationSent`
   event, `InvitationAccepted` event, and invitation migration.
2. THE family package SHALL add `pixielity/laravel-invitation` as a composer
   dependency.
3. THE `FamilyAccount` model SHALL implement
   `Pixielity\Invitation\Contracts\InvitableInterface`.
4. THE `FamilyAccountService` SHALL replace its `InvitationRepositoryInterface`
   dependency with `Pixielity\Invitation\Contracts\InvitationServiceInterface`
   and delegate invitation operations to the invitation package.
5. THE `FamilyAccountServiceInterface` SHALL retain its `invite()` and
   `acceptInvitation()` method signatures as a facade over the invitation
   package, maintaining backward compatibility for consumers.
