# User Package Design

## Architecture

See `packages/user/ARCHITECTURE.md` for the full design document including data
model, auth flows, package split, and type-specific metadata patterns.

## Package Structure

```
packages/user/src/
├── Attributes/
│   └── RequireActor.php          — AOP attribute for actor type enforcement
├── Contracts/
│   ├── Data/
│   │   ├── UserInterface.php     — ATTR_* constants for users table
│   │   ├── ActorTypeInterface.php — ATTR_* constants for actor_types table
│   │   └── ProfileInterface.php  — ATTR_* constants for profiles table
│   ├── UserRepositoryInterface.php
│   └── UserServiceInterface.php
├── Enums/
│   ├── Actor.php                 — human, agent, api_key, system
│   └── UserStatus.php            — active, suspended, deactivated
├── Events/
│   ├── UserCreated.php
│   ├── UserUpdated.php
│   ├── UserSuspended.php
│   └── UserDeleted.php
├── Interceptors/
│   └── ActorInterceptor.php      — Enforces actor type via AOP
├── Migrations/
│   ├── 0001_01_01_000000_create_users_table.php
│   ├── 0001_01_01_000001_create_actor_types_table.php
│   └── 0001_01_01_000002_create_profiles_table.php
├── Models/
│   ├── User.php
│   ├── ActorType.php
│   └── Profile.php
├── Providers/
│   └── UserServiceProvider.php
├── Repositories/
│   └── UserRepository.php
└── Services/
    └── UserService.php
```

## Bounded Context: Identity

The User package is part of the Identity bounded context along with Auth and
RBAC.

Within-context relationships (FK constraints OK):

- Profile → User (foreignId + constrained + cascadeOnDelete)
- AuthIdentity → User (foreignId + constrained + cascadeOnDelete)

Cross-context FKs (unsignedBigInteger + index only):

- User.tenant_id → Tenancy context
- User.family_account_id → Family context
- ActorType.tenant_id → Tenancy context

## Key Design Decisions

1. No password on User model — auth_identities table owns credentials
2. Actor enum for system behavior, ActorType model for business categorization
3. Domain events carry IDs only — serializable to queue for cross-context
   listeners
4. Profile is a separate table (not JSON on users) for query performance
5. ActorMiddleware for route-level protection, RequireActor for method-level AOP
