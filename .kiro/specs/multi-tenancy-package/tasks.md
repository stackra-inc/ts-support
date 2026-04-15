# Implementation Plan: Multi-Tenancy Package

## Overview

Implement `pixielity/laravel-tenancy`, a single-database multi-tenancy Laravel
13 package using `tenant_id` column scoping. The package follows the Pixielity
monorepo modular structure with interface-first design, Laravel 13
container/Eloquent attributes, attribute-based discovery, state machines, audit
logging, and the `pixielity/laravel-crud` Repository + Service pattern. All
tasks are ordered by dependency chain.

## Tasks

- [x] 1. Package scaffolding and configuration
  - [x] 1.1 Create `packages/tenancy/composer.json` with all dependencies
    - Follow `.docs/user/composer.json` pattern with `pixielity/laravel-tenancy`
      naming
    - Require: `pixielity/laravel-crud`, `pixielity/laravel-discovery`,
      `pixielity/laravel-feature-flags`, `pixielity/laravel-health`,
      `spatie/laravel-model-states`, `spatie/laravel-activitylog`,
      `laravel/pennant`, `php: ^8.2`, `illuminate/*: ^13.0`
    - PSR-4 autoload: `Pixielity\\Tenancy\\` → `src/`
    - _Requirements: 22.7, 36.8, 37.13, 46.6, 47.7, 47.8_

  - [x] 1.2 Create `packages/tenancy/module.json`
    - Follow `.docs/user/module.json` pattern with name `Tenancy`, alias
      `tenancy`, provider `Pixielity\Tenancy\Providers\TenancyServiceProvider`
    - _Requirements: 22.8_

  - [x] 1.3 Create `packages/tenancy/config/tenancy.php` configuration file
    - Include all config sections: models, identification (resolvers,
      central_domains), cache, queue, filesystem, config_override,
      rate_limiting, cache_warming, seeder, impersonation, database,
      status_guard
    - Match the configuration schema from the design document exactly
    - _Requirements: 22.4, 6.3, 6.4, 7.5, 8.3, 8.4, 18.1, 24.2, 39.3, 39.4,
      40.4, 43.3, 43.4, 44.2_

- [x] 2. Discovery attributes
  - [x] 2.1 Create `src/Attributes/AsBootstrapper.php` PHP attribute class
    - `#[Attribute(Attribute::TARGET_CLASS)]` for annotating bootstrapper
      classes
    - _Requirements: 33.1, 33.4_

  - [x] 2.2 Create `src/Attributes/AsFeature.php` PHP attribute class
    - `#[Attribute(Attribute::TARGET_CLASS)]` for annotating feature classes
    - _Requirements: 33.1, 33.5_

  - [x] 2.3 Create `src/Attributes/AsIdentification.php` PHP attribute class
    - `#[Attribute(Attribute::TARGET_CLASS)]` for annotating identification
      middleware classes
    - _Requirements: 33.1, 33.6_

- [x] 3. Contracts and interfaces
  - [x] 3.1 Create `src/Models/Tenant/Contracts/TenantInterface.php`
    - Define `ATTR_ID`, `ATTR_NAME`, `ATTR_SLUG`, `ATTR_STATUS`,
      `ATTR_DELETED_AT`, `ATTR_CREATED_AT`, `ATTR_UPDATED_AT` constants
    - Define `getTenantKeyName(): string` and `getTenantKey(): int|string`
      methods
    - _Requirements: 1.4, 25.1, 25.7_

  - [x] 3.2 Create `src/Models/TenantDomain/Contracts/TenantDomainInterface.php`
    - Define `ATTR_ID`, `ATTR_TENANT_ID`, `ATTR_DOMAIN`, `ATTR_TYPE`,
      `ATTR_IS_PRIMARY`, `ATTR_IS_VERIFIED`, `ATTR_DNS_RECORD_TYPE`,
      `ATTR_DNS_TARGET`, `ATTR_SSL_STATUS`, `ATTR_CREATED_AT`, `ATTR_UPDATED_AT`
      constants
    - _Requirements: 25.2, 25.7, 35.5_

  - [x] 3.3 Create
        `src/Models/TenantSetting/Contracts/TenantSettingInterface.php`
    - Define `ATTR_ID`, `ATTR_TENANT_ID`, `ATTR_KEY`, `ATTR_VALUE` constants
    - _Requirements: 25.3, 25.7_

  - [x] 3.4 Create
        `src/Models/TenantMetadata/Contracts/TenantMetadataInterface.php`
    - Define `ATTR_ID`, `ATTR_TENANT_ID`, `ATTR_KEY`, `ATTR_VALUE` constants
    - _Requirements: 25.4, 25.7_

  - [x] 3.5 Create
        `src/Models/TenantSubscription/Contracts/TenantSubscriptionInterface.php`
    - Define `ATTR_ID`, `ATTR_TENANT_ID`, `ATTR_PLAN`, `ATTR_STATUS`,
      `ATTR_TRIAL_ENDS_AT`, `ATTR_STARTS_AT`, `ATTR_ENDS_AT`, `ATTR_CREATED_AT`,
      `ATTR_UPDATED_AT` constants
    - _Requirements: 38.3, 25.7_

  - [x] 3.6 Create `src/Contracts/TenancyManagerInterface.php`
    - Annotate with `#[Bind(TenancyManager::class)]` and `#[Singleton]`
    - Define `initialize()`, `end()`, `run()`, `central()`, `runForMultiple()`,
      `find()` methods
    - _Requirements: 3.1, 26.4_

  - [x] 3.7 Create `src/Contracts/TenancyBootstrapperInterface.php`
    - Define `bootstrap(TenantInterface $tenant): void` and `revert(): void`
      methods
    - _Requirements: 5.1_

  - [x] 3.8 Create `src/Contracts/FeatureInterface.php`
    - Define `bootstrap(): void` method
    - _Requirements: design feature contract_

  - [x] 3.9 Create `src/Contracts/TenantResolverInterface.php`
    - Annotate with `#[Bind(ResolverChain::class)]`
    - Define `resolve(mixed ...$args): TenantInterface` method
    - _Requirements: 9.1, 26.1_

  - [x] 3.10 Create `src/Contracts/TenantServiceInterface.php`
    - Extend `Pixielity\Crud\Contracts\ServiceInterface`
    - Annotate with `#[Bind(TenantService::class)]`
    - Add custom methods: `addDomain()`, `removeDomain()`, `updateStatus()`
    - _Requirements: 26.5, 28.7_

  - [x] 3.11 Create `src/Contracts/TenantRepositoryInterface.php`
    - Extend `Pixielity\Crud\Contracts\RepositoryInterface`
    - Annotate with `#[Bind(TenantRepository::class)]`
    - _Requirements: 26.6, 28.9_

  - [x] 3.12 Create `src/Contracts/TenantSettingRepositoryInterface.php`
    - Extend `Pixielity\Crud\Contracts\RepositoryInterface`
    - Annotate with `#[Bind(TenantSettingRepository::class)]`
    - Add custom methods: `get()`, `set()`, `delete()`, `all()` by tenant
    - _Requirements: 26.7, 28.11, 30.4_

  - [x] 3.13 Create `src/Contracts/TenantMetadataRepositoryInterface.php`
    - Extend `Pixielity\Crud\Contracts\RepositoryInterface`
    - Annotate with `#[Bind(TenantMetadataRepository::class)]`
    - Add custom methods: `get()`, `set()`, `delete()`, `all()` by tenant
    - _Requirements: 26.8, 28.12, 31.4_

  - [x] 3.14 Create `src/Contracts/TenantSubscriptionRepositoryInterface.php`
    - Extend `Pixielity\Crud\Contracts\RepositoryInterface`
    - Annotate with `#[Bind(TenantSubscriptionRepository::class)]`
    - Add custom method: `findByTenant()`
    - _Requirements: 38.4, 28.14_

  - [x] 3.15 Create `src/Contracts/TenantSubscriptionServiceInterface.php`
    - Extend `Pixielity\Crud\Contracts\ServiceInterface`
    - Annotate with `#[Bind(TenantSubscriptionService::class)]`
    - Add custom methods: `hasActiveSubscription()`, `isOnTrial()`, `isOnPlan()`
    - _Requirements: 38.5, 38.7, 28.13_

  - [x] 3.16 Create `src/Contracts/TenantDataExportServiceInterface.php`
    - Annotate with `#[Bind(TenantDataExportService::class)]`
    - Define `export()` and `getExportableModels()` methods
    - _Requirements: 42.1, 42.2, 42.3_

  - [x] 3.17 Create `src/Contracts/TenantDataImportServiceInterface.php`
    - Annotate with `#[Bind(TenantDataImportService::class)]`
    - Define `import()` method
    - _Requirements: 42.5, 42.6_

- [x] 4. Exceptions
  - [x] 4.1 Create all exception classes in `src/Exceptions/`
    - `TenantCouldNotBeIdentifiedException` (abstract, extends Exception)
    - `TenantCouldNotBeIdentifiedOnDomainException` (includes domain string in
      message)
    - `TenantCouldNotBeIdentifiedByHeaderException` (includes header value in
      message)
    - `TenantCouldNotBeIdentifiedByIdException` (includes tenant ID in message)
    - `TenancyNotInitializedException`
    - `DomainOccupiedByOtherTenantException` (includes domain and occupying
      tenant ID)
    - `UnsupportedDatabaseOperationException`
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 24.1_

- [x] 5. Core models with Laravel 13 attributes
  - [x] 5.1 Create Tenant model at `src/Models/Tenant/Tenant.php`
    - Use `#[Table('tenants')]`, `#[Unguarded]` attributes
    - Use traits: `HasStates`, `LogsActivity`, `HasFeatures`, `SoftDeletes`,
      `AccessorsTrait`, `RelationsTrait`, `ScopesTrait`
    - Implement `TenantInterface`, define `$dispatchesEvents` for
      created/updated/deleted
    - Cast `status` to `TenantState::class`, `deleted_at` to `datetime`
    - Implement `getActivitylogOptions()`, `getTenantKeyName()`,
      `getTenantKey()`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.9, 23.3, 27.1, 27.2,
      29.4, 36.1, 37.1_

  - [x] 5.2 Create Tenant model traits
    - `src/Models/Tenant/Traits/Tenant/AccessorsTrait.php` — accessor/mutator
      methods
    - `src/Models/Tenant/Traits/Tenant/RelationsTrait.php` — `domains()`,
      `settings()`, `metadata()`, `subscriptions()` relationships
    - `src/Models/Tenant/Traits/Tenant/ScopesTrait.php` — query scope methods
    - _Requirements: 2.3, 29.2, 30.5, 31.5, 38.6_

  - [x] 5.3 Create TenantDomain model at
        `src/Models/TenantDomain/TenantDomain.php`
    - Use `#[Table('tenant_domains')]`, `#[Unguarded]` attributes
    - Implement `TenantDomainInterface`, cast booleans
    - Add `booted()` method with domain uniqueness check throwing
      `DomainOccupiedByOtherTenantException`
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 27.1, 27.2_

  - [x] 5.4 Create TenantDomain model traits
    - `src/Models/TenantDomain/Traits/TenantDomain/AccessorsTrait.php`
    - `src/Models/TenantDomain/Traits/TenantDomain/RelationsTrait.php` —
      `tenant()` belongsTo
    - `src/Models/TenantDomain/Traits/TenantDomain/ScopesTrait.php`
    - _Requirements: 2.2, 29.3_

  - [x] 5.5 Create TenantSetting model at
        `src/Models/TenantSetting/TenantSetting.php`
    - Use `#[Table('tenant_settings')]`, `#[Unguarded]` attributes
    - Implement `TenantSettingInterface`
    - _Requirements: 30.3, 27.1, 27.2_

  - [x] 5.6 Create TenantSetting model traits
    - `src/Models/TenantSetting/Traits/TenantSetting/AccessorsTrait.php`
    - `src/Models/TenantSetting/Traits/TenantSetting/RelationsTrait.php` —
      `tenant()` belongsTo
    - _Requirements: 29.1_

  - [x] 5.7 Create TenantMetadata model at
        `src/Models/TenantMetadata/TenantMetadata.php`
    - Use `#[Table('tenant_metadata')]`, `#[Unguarded]` attributes
    - Implement `TenantMetadataInterface`
    - _Requirements: 31.3, 27.1, 27.2_

  - [x] 5.8 Create TenantMetadata model traits
    - `src/Models/TenantMetadata/Traits/TenantMetadata/AccessorsTrait.php`
    - `src/Models/TenantMetadata/Traits/TenantMetadata/RelationsTrait.php` —
      `tenant()` belongsTo
    - _Requirements: 29.1_

  - [x] 5.9 Create TenantSubscription model at
        `src/Models/TenantSubscription/TenantSubscription.php`
    - Use `#[Table('tenant_subscriptions')]`, `#[Unguarded]` attributes
    - Implement `TenantSubscriptionInterface`, use `HasStates` trait
    - Cast `status` to `SubscriptionState::class`, datetime columns
    - _Requirements: 38.2, 38.8, 27.1, 27.2_

  - [x] 5.10 Create TenantSubscription model traits
    - `src/Models/TenantSubscription/Traits/TenantSubscription/AccessorsTrait.php`
    - `src/Models/TenantSubscription/Traits/TenantSubscription/RelationsTrait.php`
      — `tenant()` belongsTo
    - `src/Models/TenantSubscription/Traits/TenantSubscription/ScopesTrait.php`
    - _Requirements: 38.10, 29.1_

  - [x] 5.11 Create ImpersonationToken model at
        `src/Models/ImpersonationToken.php`
    - Use `#[Table('impersonation_tokens')]`, `#[Unguarded]` attributes
    - Define `tenant()` belongsTo relationship, `token` as primary key
    - _Requirements: 15.1_

- [x] 6. Checkpoint - Verify models and contracts compile
  - Ensure all model files, interfaces, and exception classes are syntactically
    correct. Ask the user if questions arise.

- [x] 7. Migrations
  - [x] 7.1 Create `src/Migrations/2024_01_01_000001_create_tenants_table.php`
    - Use `TenantInterface::ATTR_*` constants for all column names
    - Columns: id, name, slug (unique), status (default 'active'), deleted_at
      (nullable), timestamps
    - _Requirements: 1.1, 1.8, 25.5, 41.2_

  - [x] 7.2 Create
        `src/Migrations/2024_01_01_000002_create_tenant_domains_table.php`
    - Use `TenantDomainInterface::ATTR_*` constants for all column names
    - Columns: id, tenant_id (FK cascade), domain (unique), type, is_primary,
      is_verified, dns_record_type (nullable), dns_target (nullable), ssl_status
      (default 'pending'), timestamps
    - _Requirements: 2.1, 2.4, 25.5, 35.1, 35.2, 35.3, 35.4_

  - [x] 7.3 Create
        `src/Migrations/2024_01_01_000003_create_tenant_settings_table.php`
    - Use `TenantSettingInterface::ATTR_*` constants for all column names
    - Columns: id, tenant_id (FK cascade), key, value (nullable text)
    - Unique composite index on (tenant_id, key)
    - _Requirements: 30.1, 30.2, 25.5_

  - [x] 7.4 Create
        `src/Migrations/2024_01_01_000004_create_tenant_metadata_table.php`
    - Use `TenantMetadataInterface::ATTR_*` constants for all column names
    - Columns: id, tenant_id (FK cascade), key, value (nullable text)
    - Unique composite index on (tenant_id, key)
    - _Requirements: 31.1, 31.2, 25.5_

  - [x] 7.5 Create
        `src/Migrations/2024_01_01_000005_create_tenant_subscriptions_table.php`
    - Use `TenantSubscriptionInterface::ATTR_*` constants for all column names
    - Columns: id, tenant_id (FK cascade), plan, status, trial_ends_at
      (nullable), starts_at, ends_at (nullable), timestamps
    - _Requirements: 38.1, 25.5_

  - [x] 7.6 Create
        `src/Migrations/2024_01_01_000006_create_impersonation_tokens_table.php`
    - Columns: token (string(64) PK), tenant_id (FK cascade), user_id,
      redirect_url, auth_guard (nullable), remember (boolean default false),
      created_at
    - _Requirements: 15.1_

- [x] 8. State machine classes
  - [x] 8.1 Create `src/Models/States/Tenant/TenantState.php` abstract base
    - Extend `Spatie\ModelStates\State`, configure transitions:
      Active→Suspended, Active→Deleted, Suspended→Active, Suspended→Deleted, no
      outgoing from Deleted
    - _Requirements: 36.2, 36.3, 36.4, 36.5, 36.6, 36.7_

  - [x] 8.2 Create concrete tenant state classes
    - `src/Models/States/Tenant/ActiveState.php`
    - `src/Models/States/Tenant/SuspendedState.php`
    - `src/Models/States/Tenant/DeletedState.php`
    - _Requirements: 36.2_

  - [x] 8.3 Create `src/Models/States/Subscription/SubscriptionState.php`
        abstract base
    - Extend `Spatie\ModelStates\State`, configure transitions: Trial→Active,
      Trial→Cancelled, Trial→Expired, Active→Cancelled, Active→Expired,
      Cancelled→Active, Expired→Active
    - _Requirements: 38.9_

  - [x] 8.4 Create concrete subscription state classes
    - `src/Models/States/Subscription/ActiveSubscriptionState.php`
    - `src/Models/States/Subscription/CancelledSubscriptionState.php`
    - `src/Models/States/Subscription/ExpiredSubscriptionState.php`
    - `src/Models/States/Subscription/TrialSubscriptionState.php`
    - _Requirements: 38.9_

- [x] 9. TenancyManager singleton
  - [x] 9.1 Create `src/TenancyManager.php`
    - Implement `TenancyManagerInterface` with `Macroable` trait
    - Properties: `$tenant`, `$initialized`, `$getBootstrappersUsing`,
      `$initializedBootstrappers`, `$bootstrappedFeatures`
    - `initialize()`: resolve tenant if int/string, skip if same tenant, call
      `end()` if different tenant, set tenant, dispatch `TenancyInitialized`
    - `end()`: dispatch `TenancyEnded`, set tenant to null, mark not initialized
    - `run()`: save previous context, initialize, execute closure, restore
      previous context
    - `central()`: save current tenant, end tenancy, execute closure, restore
      previous tenant
    - `runForMultiple()`: iterate tenants, call `run()` for each
    - `find()`: static method to retrieve tenant by key
    - `getBootstrappers()`: return bootstrappers from callback or discovery
    - `bootstrapFeatures()`: iterate discovered features and call `bootstrap()`
    - Track initialized bootstrappers for reverse-order revert
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 5.4,
      5.5_

- [x] 10. TenantScope and BelongsToTenant
  - [x] 10.1 Create `src/Scopes/TenantScope.php`
    - Implement `Illuminate\Database\Eloquent\Scope`
    - Add `WHERE tenant_id = ?` clause using current tenant key
    - Skip when tenancy not initialized
    - Register `withoutTenancy` macro on Eloquent Builder
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 10.2 Create `src/Concerns/BelongsToTenant.php` trait
    - Apply `TenantScope` as global scope in `booted()` method
    - Auto-fill `tenant_id` on `creating` event when tenancy is initialized
    - Leave `tenant_id` unchanged when tenancy is not initialized
    - Define `tenant()` BelongsTo relationship
    - _Requirements: 4.4, 4.5, 4.6, 4.7_

- [x] 11. TenantBlueprint schema macro
  - [x] 11.1 Create `src/Schema/TenantBlueprint.php`
    - Register `tenantable()` macro on `Illuminate\Database\Schema\Blueprint`
    - Macro adds `tenant_id` unsigned big integer, foreign key referencing
      `tenants.id` (cascade delete), and index
    - Use `TenantInterface::ATTR_ID` for referenced column name
    - _Requirements: 32.1, 32.2, 32.3_

- [x] 12. Events and listeners
  - [x] 12.1 Create event classes in `src/Events/`
    - `TenancyInitialized.php` — contains TenancyManager instance
    - `TenancyEnded.php` — contains TenancyManager instance
    - `BootstrappingTenancy.php` — dispatched before bootstrappers run
    - `TenancyBootstrapped.php` — dispatched after all bootstrappers complete
    - `TenantCreated.php` — Eloquent model event
    - `TenantUpdated.php` — Eloquent model event
    - `TenantDeleted.php` — Eloquent model event
    - _Requirements: 20.1, 20.2, 20.3, 20.4_

  - [x] 12.2 Create `src/Listeners/BootstrapTenancy.php`
    - Listen for `TenancyInitialized`, dispatch `BootstrappingTenancy`, iterate
      bootstrappers calling `bootstrap()`, dispatch `TenancyBootstrapped`
    - Track initialized bootstrappers on TenancyManager
    - _Requirements: 5.2, 20.4_

  - [x] 12.3 Create `src/Listeners/RevertToCentralContext.php`
    - Listen for `TenancyEnded`, iterate initialized bootstrappers in reverse
      order calling `revert()`
    - _Requirements: 5.3, 5.4_

- [x] 13. Checkpoint - Verify core architecture compiles
  - Ensure TenancyManager, TenantScope, BelongsToTenant, events, listeners,
    state machines, and migrations are syntactically correct. Ask the user if
    questions arise.

- [x] 14. Repositories
  - [x] 14.1 Create `src/Repositories/TenantRepository.php`
    - Extend `Pixielity\Crud\Repositories\Repository`
    - Use `#[UseModel(TenantInterface::class)]` attribute
    - _Requirements: 28.10_

  - [x] 14.2 Create `src/Repositories/TenantSettingRepository.php`
    - Extend `Pixielity\Crud\Repositories\Repository`
    - Use `#[UseModel(TenantSettingInterface::class)]` attribute
    - Implement custom `get()`, `set()`, `delete()`, `all()` methods using
      ATTR\_\* constants
    - _Requirements: 28.11, 30.4_

  - [x] 14.3 Create `src/Repositories/TenantMetadataRepository.php`
    - Extend `Pixielity\Crud\Repositories\Repository`
    - Use `#[UseModel(TenantMetadataInterface::class)]` attribute
    - Implement custom `get()`, `set()`, `delete()`, `all()` methods using
      ATTR\_\* constants
    - _Requirements: 28.12, 31.4_

  - [x] 14.4 Create `src/Repositories/TenantSubscriptionRepository.php`
    - Extend `Pixielity\Crud\Repositories\Repository`
    - Use `#[UseModel(TenantSubscriptionInterface::class)]` attribute
    - Implement custom `findByTenant()` method
    - _Requirements: 28.14_

- [x] 15. Services
  - [x] 15.1 Create `src/Services/TenantService.php`
    - Extend `Pixielity\Crud\Services\Service`
    - Use `#[UseRepository(TenantRepositoryInterface::class)]` attribute
    - Inject `TenantSettingRepositoryInterface`,
      `TenantMetadataRepositoryInterface` via constructor
    - Implement custom methods: `addDomain()`, `removeDomain()`,
      `updateStatus()`
    - Log domain add/remove and status change via `activity()` helper
    - _Requirements: 28.8, 37.5, 37.6, 37.7_

  - [x] 15.2 Create `src/Services/TenantSubscriptionService.php`
    - Extend `Pixielity\Crud\Services\Service`
    - Use `#[UseRepository(TenantSubscriptionRepositoryInterface::class)]`
      attribute
    - Implement `hasActiveSubscription()`, `isOnTrial()`, `isOnPlan()` methods
    - _Requirements: 28.13, 38.7_

- [x] 16. Resolvers and caching layer
  - [x] 16.1 Create `src/Resolvers/CachedTenantResolver.php` abstract base
    - Implement optional cache-through resolution with configurable store and
      TTL
    - Provide `invalidateCache()` method
    - Bypass cache when caching is disabled
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 16.2 Create `src/Resolvers/HeaderResolver.php`
    - Extend `CachedTenantResolver`, resolve tenant by configurable HTTP header
      value
    - Throw `TenantCouldNotBeIdentifiedByHeaderException` on failure
    - Exclude soft-deleted tenants from resolution
    - _Requirements: 9.2, 41.3_

  - [x] 16.3 Create `src/Resolvers/SubdomainResolver.php`
    - Extend `CachedTenantResolver`, extract subdomain from hostname, lookup by
      slug
    - Throw `TenantCouldNotBeIdentifiedOnDomainException` on failure
    - Exclude soft-deleted tenants from resolution
    - _Requirements: 9.3, 41.3_

  - [x] 16.4 Create `src/Resolvers/DomainResolver.php`
    - Extend `CachedTenantResolver`, match full hostname against
      `tenant_domains` table
    - Throw `TenantCouldNotBeIdentifiedOnDomainException` on failure
    - Exclude soft-deleted tenants from resolution
    - _Requirements: 9.4, 41.3_

  - [x] 16.5 Create `src/Resolvers/AuthResolver.php`
    - Extend `CachedTenantResolver`, resolve tenant from authenticated user's
      `tenant_id`
    - Throw `TenantCouldNotBeIdentifiedByIdException` on failure
    - _Requirements: 9.5_

  - [x] 16.6 Create `src/Resolvers/ResolverChain.php`
    - Evaluate resolvers in configured priority order
    - Return first successful resolution
    - Throw `TenantCouldNotBeIdentifiedException` if all resolvers fail
    - _Requirements: 9.6, 9.7_

- [x] 17. Middleware
  - [x] 17.1 Create `src/Middleware/IdentificationMiddleware.php` abstract base
    - Provide `initializeTenancy()` method with `onFail` callback support
    - Skip identification for routes marked as central
    - _Requirements: 11.4, 11.5, 11.6_

  - [x] 17.2 Create `src/Middleware/InitializeTenancyByHeader.php`
    - Extend `IdentificationMiddleware`, annotate with `#[AsIdentification]`
    - Extract tenant identifier from configurable HTTP header, use
      `HeaderResolver`
    - _Requirements: 11.1_

  - [x] 17.3 Create `src/Middleware/InitializeTenancyBySubdomain.php`
    - Extend `IdentificationMiddleware`, annotate with `#[AsIdentification]`
    - Extract subdomain from hostname, use `SubdomainResolver`
    - _Requirements: 11.2_

  - [x] 17.4 Create `src/Middleware/InitializeTenancyByDomain.php`
    - Extend `IdentificationMiddleware`, annotate with `#[AsIdentification]`
    - Use full hostname, use `DomainResolver`
    - _Requirements: 11.3_

  - [x] 17.5 Create `src/Middleware/EnsureTenantIsActive.php`
    - Check tenant status after identification
    - Return 503 JSON for suspended tenants, 403 JSON for soft-deleted tenants
    - Configurable allowed statuses
    - _Requirements: 40.1, 40.2, 40.3, 40.4, 40.5_

- [x] 18. Checkpoint - Verify repositories, services, resolvers, and middleware
      compile
  - Ensure all repository, service, resolver, and middleware classes are
    syntactically correct. Ask the user if questions arise.

- [x] 19. Bootstrappers
  - [x] 19.1 Create `src/Bootstrappers/CacheBootstrapper.php`
    - Annotate with `#[AsBootstrapper]`, implement
      `TenancyBootstrapperInterface`
    - Prefix cache store keys with tenant-specific prefix on `bootstrap()`
    - Restore original prefixes on `revert()`
    - Support configurable store list and custom prefix generator
    - Throw exception if store doesn't support `setPrefix`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 19.2 Create `src/Bootstrappers/QueueBootstrapper.php`
    - Annotate with `#[AsBootstrapper]`, implement
      `TenancyBootstrapperInterface`
    - Inject `tenant_id` into job payloads on `bootstrap()`
    - Initialize tenancy from `tenant_id` in payload before job execution
    - Revert context after job completes
    - Skip injection for central connections
    - Support tenant-specific queue names (prefix configured queues with tenant
      ID)
    - Support queue name generator callback
    - Restore original queue names on `revert()`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 43.1, 43.2, 43.3, 43.4, 43.5_

  - [x] 19.3 Create `src/Bootstrappers/FilesystemBootstrapper.php`
    - Annotate with `#[AsBootstrapper]`, implement
      `TenancyBootstrapperInterface`
    - Modify disk root paths with tenant-specific suffix on `bootstrap()`
    - Restore original paths on `revert()`
    - Support configurable disk list and root path override templates with
      `%tenant%` placeholder
    - Purge resolved disk instances
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 19.4 Create `src/Bootstrappers/TenantConfigBootstrapper.php`
    - Annotate with `#[AsBootstrapper]`, implement
      `TenancyBootstrapperInterface`
    - Override mapped Laravel config values with tenant attribute values on
      `bootstrap()`
    - Restore original config values on `revert()`
    - Skip override when tenant attribute is null
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

  - [x] 19.5 Create `src/Bootstrappers/RateLimitBootstrapper.php`
    - Annotate with `#[AsBootstrapper]`, implement
      `TenancyBootstrapperInterface`
    - Register tenant-specific rate limiters using `RateLimiter::for()` with
      tenant ID in key
    - Support plan-based rate limits from config
    - Restore default rate limiters on `revert()`
    - _Requirements: 39.1, 39.2, 39.3, 39.4, 39.5, 39.6_

  - [x] 19.6 Create `src/Bootstrappers/CacheWarmingBootstrapper.php`
    - Annotate with `#[AsBootstrapper]`, implement
      `TenancyBootstrapperInterface`
    - Preload configured settings/metadata keys into cache on `bootstrap()`
    - Support custom warming callback via static `$warmUsing` property
    - No action on `revert()` (cache entries expire naturally)
    - _Requirements: 44.1, 44.2, 44.3, 44.4_

- [x] 20. Features
  - [x] 20.1 Create `src/Features/TelescopeTags.php`
    - Annotate with `#[AsFeature]`, implement `FeatureInterface`
    - Tag Telescope entries with `tenant:{tenant_key}` when tenancy is
      initialized and Telescope is installed
    - Skip registration without errors when Telescope is not installed
    - _Requirements: 17.1, 17.2_

  - [x] 20.2 Create `src/Features/CrossDomainRedirect.php`
    - Annotate with `#[AsFeature]`, implement `FeatureInterface`
    - Register `domain(string)` macro on `RedirectResponse`
    - Replace hostname in redirect URL with specified domain
    - _Requirements: 16.1, 16.2_

  - [x] 20.3 Create `src/Features/UserImpersonation.php`
    - Annotate with `#[AsFeature]`, implement `FeatureInterface`
    - Generate time-limited impersonation tokens with tenant_id, user_id,
      redirect_url, auth_guard
    - Verify token expiry using configurable TTL
    - Verify token tenant_id matches current tenant context
    - Delete token and return 403 on expired/mismatched tokens
    - Store `impersonating` flag in session
    - Provide `stopImpersonating()` method
    - Log impersonation start/stop via activity logger
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 37.8, 37.9_

  - [x] 20.4 Create `src/Features/DisallowSqliteAttach.php`
    - Annotate with `#[AsFeature]`, implement `FeatureInterface`
    - Detect SQLite ATTACH statements in tenant context
    - Throw `UnsupportedDatabaseOperationException`
    - Support configurable list of disallowed operations
    - _Requirements: 24.1, 24.2_

- [x] 21. TenantAware traits
  - [x] 21.1 Create `src/Concerns/TenantAware.php` trait (for jobs)
    - Store `tenant_id` on instantiation within active tenant context
    - Include `tenant_id` in serialized payload
    - Initialize tenancy for stored `tenant_id` on unserialization before
      execution
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 21.2 Create `src/Concerns/TenantAwareCommand.php` trait (for commands)
    - Provide `--tenants` option to specify which tenants to run for
    - Execute command's `handle()` within each specified tenant's context
    - Run for all active tenants when no `--tenants` option provided
    - _Requirements: 13.4, 13.5, 13.6_

  - [x] 21.3 Create `src/Concerns/TenantAwareNotification.php` trait (for
        notifications)
    - Store `tenant_id` on instantiation within active tenant context
    - Initialize tenancy for stored `tenant_id` before notification is processed
      via queue
    - Revert to previous tenant context after processing
    - Separate from TenantAware and TenantAwareCommand traits
    - _Requirements: 45.1, 45.2, 45.3, 45.4, 45.5_

- [x] 22. Artisan commands
  - [x] 22.1 Create `src/Commands/CreateTenantCommand.php`
    - Signature: `tenancy:create {name} {--slug=} {--domain=}`
    - Create tenant via `TenantServiceInterface`, optionally add domain
    - _Requirements: 21.1_

  - [x] 22.2 Create `src/Commands/ListTenantsCommand.php`
    - Signature: `tenancy:list`
    - Display table of tenants with ID, name, slug, status, domain count via
      `TenantServiceInterface`
    - _Requirements: 21.2_

  - [x] 22.3 Create `src/Commands/DeleteTenantCommand.php`
    - Signature: `tenancy:delete {tenant}`
    - Soft-delete tenant and associated domains via `TenantServiceInterface`
    - _Requirements: 21.3_

  - [x] 22.4 Create `src/Commands/AddDomainCommand.php`
    - Signature: `tenancy:domain:add {tenant} {domain}`
    - Create TenantDomain record via `TenantServiceInterface`
    - _Requirements: 21.4_

  - [x] 22.5 Create `src/Commands/RemoveDomainCommand.php`
    - Signature: `tenancy:domain:remove {tenant} {domain}`
    - Delete TenantDomain record via `TenantServiceInterface`
    - _Requirements: 21.5_

  - [x] 22.6 Create `src/Commands/SeedCommand.php`
    - Signature: `tenancy:seed {--tenants=*} {--class=}`
    - Run configured seeders within specified tenant's context
    - _Requirements: 14.3, 14.4, 21.6_

  - [x] 22.7 Create `src/Commands/RunCommand.php`
    - Signature: `tenancy:run {command} {--tenants=*}`
    - Execute arbitrary Artisan command within specified tenant's context
    - _Requirements: 21.7_

  - [x] 22.8 Create `src/Commands/MigrateCommand.php`
    - Signature: `tenancy:migrate {--tenants=*}`
    - Run migrations within specified tenant's context
    - _Requirements: 21.8_

  - [x] 22.9 Create `src/Commands/StatusCommand.php`
    - Signature: `tenancy:status {tenant} {status}`
    - Update tenant status via `TenantServiceInterface`
    - _Requirements: 21.9_

  - [x] 22.10 Create `src/Commands/RestoreTenantCommand.php`
    - Signature: `tenancy:restore {tenant}`
    - Restore a soft-deleted tenant
    - _Requirements: 41.5_

  - [x] 22.11 Create `src/Commands/ForceDeleteTenantCommand.php`
    - Signature: `tenancy:force-delete {tenant}`
    - Permanently delete tenant and all associated data
    - _Requirements: 41.6_

  - [x] 22.12 Create `src/Commands/ExportTenantCommand.php`
    - Signature: `tenancy:export {tenant}`
    - Export all tenant data via `TenantDataExportServiceInterface`
    - _Requirements: 42.8_

  - [x] 22.13 Create `src/Commands/ImportTenantCommand.php`
    - Signature: `tenancy:import {tenant} {file}`
    - Import tenant data from file via `TenantDataImportServiceInterface`
    - _Requirements: 42.9_

- [x] 23. Checkpoint - Verify bootstrappers, features, traits, and commands
      compile
  - Ensure all bootstrapper, feature, trait, and command classes are
    syntactically correct. Ask the user if questions arise.

- [x] 24. Facade, helpers, and HasDiscovery trait
  - [x] 24.1 Create `src/Facades/Tenancy.php`
    - Extend `Illuminate\Support\Facades\Facade`
    - Proxy static calls to `TenancyManagerInterface` binding
    - _Requirements: 12.1_

  - [x] 24.2 Create `src/helpers.php`
    - `tenancy()` — return `TenancyManagerInterface` instance from container
    - `tenant(?string $key = null)` — return current `TenantInterface` or
      attribute value
    - _Requirements: 12.2, 12.3, 12.4_

  - [x] 24.3 Create `src/Concerns/HasDiscovery.php` trait
    - Provide `collectBootstrappers()`, `collectFeatures()`,
      `collectIdentifications()` methods
    - Call `pixielity/laravel-discovery` for auto-registration of annotated
      classes
    - _Requirements: 33.2, 33.3, 33.7, 22.6_

- [x] 25. Health checks
  - [x] 25.1 Create `src/HealthChecks/TenantDatabaseCheck.php`
    - Annotate with `#[AsHealthCheck]`
    - Verify tenant-scoped queries execute correctly
    - Return warning when no tenant context
    - _Requirements: 46.2, 46.5_

  - [x] 25.2 Create `src/HealthChecks/TenantCacheCheck.php`
    - Annotate with `#[AsHealthCheck]`
    - Verify tenant cache prefix is working
    - _Requirements: 46.3_

  - [x] 25.3 Create `src/HealthChecks/TenantFilesystemCheck.php`
    - Annotate with `#[AsHealthCheck]`
    - Verify tenant storage path is accessible
    - _Requirements: 46.4_

- [x] 26. Data export/import services
  - [x] 26.1 Create `src/Services/TenantDataExportService.php`
    - Implement `TenantDataExportServiceInterface`
    - `export()`: collect data from all models using `BelongsToTenant` trait
      with `// TODO: Implement full export logic` placeholder
    - `getExportableModels()`: return array of models using `BelongsToTenant`
    - _Requirements: 42.2, 42.3, 42.4_

  - [x] 26.2 Create `src/Services/TenantDataImportService.php`
    - Implement `TenantDataImportServiceInterface`
    - `import()`: include `// TODO: Implement full import logic` placeholder
    - _Requirements: 42.6, 42.7_

- [x] 27. Seeders
  - [x] 27.1 Create `src/Seeders/TenantSeeder.php`
    - Accept `TenantInterface` instance, run seeder within tenant context using
      `TenancyManager::run()`
    - _Requirements: 14.1, 14.2_

- [x] 28. Service provider
  - [x] 28.1 Create `src/Providers/TenancyServiceProvider.php`
    - Use `HasDiscovery` trait
    - `register()`: merge config, call `collectBootstrappers()`,
      `collectFeatures()`, `collectIdentifications()`
    - `boot()`: load migrations, publish config, register event listeners
      (`TenancyInitialized` → `BootstrapTenancy`, `TenancyEnded` →
      `RevertToCentralContext`), register all 13 Artisan commands, register
      `TenantBlueprint` macro, set Pennant default scope to current tenant via
      `Feature::resolveScopeUsing(fn () => tenant())`, call
      `bootstrapFeatures()`
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 32.4, 47.6_

- [x] 29. Criteria classes
  - [x] 29.1 Create `src/Criteria/ActiveTenantCriteria.php`
    - Annotate with `#[AsCriteria]` from `pixielity/laravel-crud`
    - Filter tenants by active status using `TenantInterface::ATTR_STATUS`
    - _Requirements: 28.16_

- [x] 30. Checkpoint - Verify full package compiles
  - Ensure all files across the entire package are syntactically correct and
    properly wired together. Verify service provider registers all components.
    Ask the user if questions arise.

- [x] 31. Comprehensive DocBlocks pass
  - [x] 31.1 Add comprehensive PHPDoc to all files
    - File-level docblocks on every PHP file
    - Class-level docblocks explaining purpose and responsibility
    - `@param`, `@return`, `@throws` on all public, protected, and private
      methods
    - `@var` tags on all class properties
    - Meaningful code comments explaining what and why
    - _Requirements: 34.1, 34.2, 34.3, 34.4, 34.5, 34.6_

- [x] 32. Final checkpoint - Ensure all files pass validation
  - Ensure all tests pass, all files have comprehensive DocBlocks, and the
    package structure matches the design document. Ask the user if questions
    arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- All models use Laravel 13 Eloquent attributes (`#[Table]`, `#[Unguarded]`)
  instead of properties
- All interfaces use Laravel 13 container attributes (`#[Bind]`, `#[Singleton]`,
  `#[Scoped]`)
- All repositories extend `Pixielity\Crud\Repositories\Repository` with
  `#[UseModel]` attribute
- All services extend `Pixielity\Crud\Services\Service` with `#[UseRepository]`
  attribute
- Discovery attributes (`#[AsBootstrapper]`, `#[AsFeature]`,
  `#[AsIdentification]`, `#[AsHealthCheck]`, `#[AsCriteria]`) replace config
  arrays
- State machines use `spatie/laravel-model-states` for tenant status and
  subscription status
- Audit logging uses `spatie/laravel-activitylog` with `LogsActivity` trait
- Feature flags use `pixielity/laravel-feature-flags` built on Laravel Pennant
- Health checks use `pixielity/laravel-health` with `#[AsHealthCheck]` attribute
- The package lives at `packages/tenancy/` in the monorepo
