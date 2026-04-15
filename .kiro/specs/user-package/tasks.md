# User Package Tasks

## Completed

- [x] Task 1: Create Actor enum (human, agent, api_key, system) with
      Label/Description
- [x] Task 2: Create UserStatus enum (active, suspended, deactivated)
- [x] Task 3: Create UserInterface with all ATTR\_\* constants
- [x] Task 4: Create ActorTypeInterface with ATTR\_\* constants
- [x] Task 5: Create ProfileInterface with ATTR\_\* constants
- [x] Task 6: Create User model with Actor/UserStatus casts, relationships
- [x] Task 7: Create ActorType model (tenant-specific business types)
- [x] Task 8: Create Profile model with user relationship
- [x] Task 9: Create users migration (with cross-context FKs as
      unsignedBigInteger)
- [x] Task 10: Create actor_types migration
- [x] Task 11: Create profiles migration (within-context FK with constraint)
- [x] Task 12: Create domain events (UserCreated, UserUpdated, UserSuspended,
      UserDeleted)
- [x] Task 13: Update UserRepository with findByActor(), findByTenant()
- [x] Task 14: Update UserService with domain event dispatching and suspend()
- [x] Task 15: Create RequireActor attribute with #[InterceptedBy]
- [x] Task 16: Create ActorInterceptor with ReadsInterceptorParameters trait
- [x] Task 17: Create ActorMiddleware (route-level actor:human,agent)
- [x] Task 18: Create AuthIdentityInterface with ATTR\_\* constants (auth
      package)
- [x] Task 19: Create AuthIdentity model (auth package)
- [x] Task 20: Create auth_identities migration (auth package)
- [x] Task 21: Update ARCHITECTURE.md to reflect Actor naming (was UserType)
- [x] Task 22: Add AuthIdentityRepository + interface (auth package)
- [x] Task 23: Update AuthService to use AuthIdentity for login/register
- [x] Task 24: Update AuthController to remove ATTR_PASSWORD references

## Remaining

- [x] Task 25: Family package (separate spec needed)
- [x] Task 26: Tests for User package
