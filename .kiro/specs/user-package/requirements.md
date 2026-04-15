# User Package Requirements

## Overview

The User package manages user entities, actor types, profiles, and domain events
within the Identity bounded context. Inspired by MedusaJS's Auth Module concept
of AuthIdentity and Actor Types, adapted for Laravel's Eloquent + Sanctum
ecosystem.

## Functional Requirements

### FR-1: Actor Enum

- Built-in system actor types: `human`, `agent`, `api_key`, `system`
- Each actor type has authentication behavior (requiresAuth, isTokenBased)
- Each actor type has a default RBAC role mapping
- Actor enum uses `#[Label]` and `#[Description]` on every case

### FR-2: Actor Types (DB)

- Custom business types stored in `actor_types` table (tenant-specific)
- Examples: contractor, vendor, partner
- Each type has: slug, label, description, tenant_id, is_active, metadata
- Unique constraint on (slug, tenant_id)
- tenant_id is cross-context FK (unsignedBigInteger, no constraint)

### FR-3: User Model

- No password column — passwords stored on auth_identities table
- `actor` column cast to Actor enum
- `status` column cast to UserStatus enum
- `custom_actor_id` FK to actor_types table
- `tenant_id` cross-context FK (unsignedBigInteger)
- `family_account_id` cross-context FK (unsignedBigInteger)
- `metadata` JSON column for type-specific data
- `last_login_at`, `last_login_ip` tracking
- Soft deletes
- Relationships: profile (HasOne), customActorType (BelongsTo)

### FR-4: User Status

- Enum: active, suspended, deactivated
- `canAuthenticate()` helper — only active users can authenticate

### FR-5: Profile Model

- One profile per user (human users)
- Fields: first_name, last_name, phone, date_of_birth, gender, bio, address
  (JSON), social_links (JSON), preferences (JSON)
- Within Identity context — FK to users with constraint + cascade

### FR-6: Domain Events

- UserCreated: userId, actor, tenantId
- UserUpdated: userId, changedAttributes
- UserSuspended: userId, reason
- UserDeleted: userId
- Events carry IDs only (not model instances) — serializable to queue

### FR-7: UserRepository

- findByEmail(), findByActor(), findByTenant()
- Filterable by name, email, status, actor, tenant_id
- Sortable by name, email, created_at

### FR-8: UserService

- Dispatches domain events on create/update/delete
- suspend() method with reason

### FR-9: RequireActor Attribute + ActorInterceptor

- AOP attribute for method/class-level actor type enforcement
- Priority 25 (after auth + roles, before subscription)
- Uses ReadsInterceptorParameters trait

### FR-10: ActorMiddleware

- Route middleware `actor:human,agent` pattern
- Checks authenticated user's actor attribute
- Handles both enum and string actor values
- Returns 403 on mismatch

## Non-Functional Requirements

### NFR-1: Octane-Safe

- No static mutable state
- Scoped registries where needed

### NFR-2: Zero Runtime Reflection

- All attribute reading via Discovery facade
- Build-time compilation for AOP

### NFR-3: Bounded Context Compliance

- Within Identity context (user, auth, rbac): full FK constraints
- Cross-context (tenant_id, family_account_id): unsignedBigInteger + index only
