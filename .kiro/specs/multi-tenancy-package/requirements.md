# Requirements Document

## Introduction

A highly structured, interface-driven, attribute-heavy multi-tenancy Laravel 13
package for a POS/venue management system. The package provides single-database
tenancy with `tenant_id` column scoping, designed for a headless API
architecture. It follows the Pixielity monorepo modular package structure and
leverages Laravel 13's newest features: PHP attributes for container binding
(`#[Bind]`, `#[Singleton]`, `#[Scoped]`), Eloquent model attributes (`#[Table]`,
`#[Guarded]`, `#[Fillable]`, `#[Hidden]`, `#[Connection]`), and attribute-based
discovery via `pixielity/laravel-discovery`.

Every binding goes through interfaces with `#[Bind]` attributes. Every model
uses the new Eloquent attributes. Discovery replaces config arrays. Laravel
Pennant replaces custom feature flags. Settings and metadata use dedicated
key-value tables instead of JSON columns. The architecture follows a strict
Repository + Service pattern with interface-first design.

## Glossary

- **TenancyManager**: Singleton service that holds the current tenant state,
  manages initialization/teardown lifecycle, and provides access to
  bootstrappers and resolvers. Bound via `#[Bind]` and `#[Singleton]` attributes
  on its interface.
- **TenancyManagerInterface**: Contract for TenancyManager, annotated with
  `#[Bind(TenancyManager::class)]` and `#[Singleton]` for automatic container
  registration.
- **Tenant**: An Eloquent model representing a tenant entity in the `tenants`
  table, using Laravel 13 model attributes (`#[Table]`, `#[Guarded]`, etc.) and
  organized with AccessorsTrait, RelationsTrait, and ScopesTrait.
- **TenantInterface**: Contract for the Tenant model, defining attribute name
  constants (`ATTR_ID`, `ATTR_NAME`, `ATTR_SLUG`, etc.) used throughout the
  codebase instead of hardcoded strings.
- **TenantDomain**: An Eloquent model representing a domain mapping in the
  `tenant_domains` table, including DNS record tracking columns.
- **TenantDomainInterface**: Contract for TenantDomain with attribute name
  constants.
- **TenantSetting**: An Eloquent model for the `tenant_settings` key-value table
  storing tenant configuration.
- **TenantMetadata**: An Eloquent model for the `tenant_metadata` key-value
  table storing tenant metadata.
- **TenantScope**: An Eloquent global scope that automatically filters queries
  by the current tenant's `tenant_id`.
- **BelongsToTenant**: A model trait that applies TenantScope and auto-fills
  `tenant_id` on creation.
- **TenancyBootstrapper**: A contract with `bootstrap(Tenant)` and `revert()`
  methods that configures a Laravel service for tenant isolation.
- **TenantResolver**: A contract that resolves a Tenant from incoming request
  data (header, subdomain, domain, auth token). Bound via `#[Bind]` attribute.
- **TenantResolverInterface**: Contract for TenantResolver, annotated with
  `#[Bind]` for container binding.
- **ResolverChain**: An ordered list of TenantResolver implementations evaluated
  in priority order until one succeeds.
- **Feature**: A contract with a `bootstrap()` method for optional, irreversible
  tenant-aware capabilities (Telescope tags, cross-domain redirects, user
  impersonation). Discovered via `#[AsFeature]` attribute.
- **TenantAware**: A unified trait/contract that provides tenant context
  awareness to jobs, commands, seeders, and event listeners.
- **IdentificationMiddleware**: HTTP middleware that uses a TenantResolver to
  identify and initialize the tenant context. Discovered via
  `#[AsIdentification]` attribute.
- **CentralContext**: The application state when no tenant is initialized.
- **TenantServiceInterface**: Contract for the TenantService, annotated with
  `#[Bind(TenantService::class)]` for container binding.
- **TenantRepositoryInterface**: Contract for the TenantRepository, annotated
  with `#[Bind(TenantRepository::class)]` for container binding.
- **TenantSettingRepositoryInterface**: Contract for TenantSettingRepository
  CRUD operations on the `tenant_settings` table.
- **TenantMetadataRepositoryInterface**: Contract for TenantMetadataRepository
  CRUD operations on the `tenant_metadata` table.
- **TenantBlueprint**: A schema macro that registers `->tenantable()` on
  Laravel's Blueprint, adding `tenant_id` foreign key with index and cascade
  delete.
- **HasDiscovery**: A trait used in the service provider that calls
  `pixielity/laravel-discovery` to auto-register classes annotated with
  `#[AsBootstrapper]`, `#[AsFeature]`, and `#[AsIdentification]`.
- **Laravel Pennant**: Laravel's official feature flag package
  (`laravel/pennant`), used via `pixielity/laravel-feature-flags` package to
  scope feature flags to the Tenant model.
- **TenantSubscription**: An Eloquent model representing a tenant's subscription
  in the `tenant_subscriptions` table, using `spatie/laravel-model-states` for
  status transitions.
- **TenantSubscriptionInterface**: Contract for TenantSubscription with
  attribute name constants and `#[Bind]` attribute.
- **TenantSubscriptionRepositoryInterface**: Contract for
  TenantSubscriptionRepository CRUD operations on the `tenant_subscriptions`
  table, annotated with `#[Bind]`.
- **TenantSubscriptionServiceInterface**: Contract for TenantSubscriptionService
  business logic, annotated with `#[Bind]`.
- **TenantState**: Abstract base state class for tenant status transitions using
  `spatie/laravel-model-states`, with concrete states: `ActiveState`,
  `SuspendedState`, `DeletedState`.
- **SubscriptionState**: Abstract base state class for subscription status
  transitions using `spatie/laravel-model-states`, with concrete states:
  `ActiveSubscriptionState`, `CancelledSubscriptionState`,
  `ExpiredSubscriptionState`, `TrialSubscriptionState`.
- **RateLimitBootstrapper**: A bootstrapper that registers tenant-specific rate
  limiters using Laravel's `RateLimiter::for()`, scoped by tenant ID and
  subscription plan.
- **EnsureTenantIsActive**: HTTP middleware that guards against requests to
  suspended or deleted tenants, returning appropriate HTTP error responses.
- **TenantDataExportServiceInterface**: Contract for exporting all tenant-scoped
  data, annotated with `#[Bind]`.
- **TenantDataImportServiceInterface**: Contract for importing tenant data from
  an export file, annotated with `#[Bind]`.
- **CacheWarmingBootstrapper**: A bootstrapper that preloads frequently-accessed
  tenant settings and metadata into cache on tenant initialization.
- **TenantAwareNotification**: A trait for Laravel notifications that stores and
  restores tenant context when notifications are queued and sent.
- **pixielity/laravel-feature-flags**: Pixielity's feature flag package built on
  Laravel Pennant, providing repository pattern, service layer, facades, helper
  functions, `#[Scoped]` attributes, and OpenAPI support.
- **pixielity/laravel-health**: Pixielity's health check package built on
  `spatie/laravel-health`, providing `#[AsHealthCheck]` attribute for
  auto-discovery of health check classes.
- **spatie/laravel-model-states**: Spatie package for defining state machines on
  Eloquent models using state classes and allowed transitions.
- **spatie/laravel-activitylog**: Spatie package for logging model activity
  (CRUD, state changes) with tagging support for filtering.
- **pixielity/laravel-crud**: Pixielity's CRUD package providing base Service
  and Repository classes with PHP attributes (`#[UseModel]`, `#[UseRepository]`,
  `#[UseService]`, `#[AsCriteria]`, `#[UseCriteria]`, `#[UseScope]`) for
  declarative configuration and auto-discovery.

## Requirements

### Requirement 1: Tenant Data Model

**User Story:** As a developer, I want a well-defined tenant data model with
core fields and separate key-value stores for settings and metadata, so that I
can store tenant information without frequent schema migrations.

#### Acceptance Criteria

1. THE Tenant model SHALL store `id`, `name`, `slug`, `status`, and timestamp
   columns in the `tenants` table (no `settings` or `metadata` JSON columns).
2. THE Tenant model SHALL use Laravel 13 Eloquent model attributes:
   `#[Table('tenants')]` and `#[Unguarded]` instead of property-based
   configuration.
3. THE Tenant model SHALL support `active`, `suspended`, and `deleted` status
   values via a string column.
4. THE Tenant model SHALL implement TenantInterface and provide
   `getTenantKeyName()` and `getTenantKey()` accessor methods.
5. WHEN a Tenant is created, THE Tenant model SHALL dispatch `TenantCreated`
   event.
6. WHEN a Tenant is updated, THE Tenant model SHALL dispatch `TenantUpdated`
   event.
7. WHEN a Tenant is deleted, THE Tenant model SHALL dispatch `TenantDeleted`
   event.
8. THE `tenants` migration SHALL create the `tenants` table with the columns
   defined in criterion 1, using TenantInterface attribute constants for column
   names.
9. THE Tenant model SHALL use the `HasFeatures` trait from Laravel Pennant
   instead of custom feature flag methods.

### Requirement 2: Tenant Domain Mapping

**User Story:** As a developer, I want to associate one or more domains with a
tenant including DNS record tracking, so that incoming requests can be mapped to
the correct tenant and domain verification status is tracked.

#### Acceptance Criteria

1. THE TenantDomain model SHALL store `id`, `tenant_id` (foreign key), `domain`
   (unique string), `type` (enum: `subdomain`, `custom_domain`), `is_primary`
   (boolean), `is_verified` (boolean), `dns_record_type` (nullable: `A`,
   `CNAME`), `dns_target` (nullable string), `ssl_status` (enum: `pending`,
   `active`, `failed`), and timestamp columns in the `tenant_domains` table.
2. THE TenantDomain model SHALL implement TenantDomainInterface and define a
   `belongsTo` relationship to the Tenant model.
3. THE Tenant model SHALL define a `hasMany` relationship to the TenantDomain
   model.
4. THE `tenant_domains` migration SHALL create the `tenant_domains` table with a
   unique index on the `domain` column, a foreign key constraint on `tenant_id`,
   and all DNS-related columns, using TenantDomainInterface attribute constants
   for column names.
5. IF a domain string is already assigned to another tenant, THEN THE
   TenantDomain model SHALL prevent creation and raise a
   `DomainOccupiedByOtherTenantException`.
6. THE TenantDomain model SHALL use Laravel 13 Eloquent model attributes:
   `#[Table('tenant_domains')]` and `#[Unguarded]` instead of property-based
   configuration.

### Requirement 3: TenancyManager Singleton

**User Story:** As a developer, I want a central TenancyManager service bound
via interface with `#[Bind]` and `#[Singleton]` attributes, so that all parts of
the application can access the current tenant context through dependency
injection.

#### Acceptance Criteria

1. THE TenancyManagerInterface SHALL be annotated with
   `#[Bind(TenancyManager::class)]` and `#[Singleton]` attributes for automatic
   container registration.
2. THE TenancyManager SHALL expose a `tenant` property that holds the current
   Tenant instance or null.
3. THE TenancyManager SHALL expose an `initialized` boolean property indicating
   whether tenancy is active.
4. WHEN `initialize(Tenant)` is called, THE TenancyManager SHALL set the tenant,
   mark tenancy as initialized, and dispatch `TenancyInitialized` event.
5. WHEN `end()` is called, THE TenancyManager SHALL dispatch `TenancyEnded`
   event, set tenant to null, and mark tenancy as not initialized.
6. WHEN `initialize()` is called while tenancy is already initialized for a
   different tenant, THE TenancyManager SHALL call `end()` before initializing
   the new tenant.
7. WHEN `initialize()` is called with the same tenant that is already
   initialized, THE TenancyManager SHALL skip re-initialization.
8. THE TenancyManager SHALL provide a `run(Tenant, Closure)` method that
   atomically initializes tenancy, executes the closure, and reverts to the
   previous context.
9. THE TenancyManager SHALL provide a `central(Closure)` method that atomically
   ends tenancy, executes the closure, and restores the previous tenant context.
10. THE TenancyManager SHALL provide a `runForMultiple(tenants, Closure)` method
    that iterates over tenants and runs the closure in each tenant's context.
11. THE TenancyManager SHALL provide a `find(id)` static method that retrieves a
    Tenant by its key.

### Requirement 4: TenantScope and BelongsToTenant Trait

**User Story:** As a developer, I want Eloquent models to be automatically
scoped to the current tenant, so that queries only return data belonging to the
active tenant without manual filtering.

#### Acceptance Criteria

1. THE TenantScope SHALL implement Laravel's `Scope` interface and add a
   `WHERE tenant_id = ?` clause using the current tenant's key.
2. WHILE tenancy is not initialized, THE TenantScope SHALL skip applying the
   scope clause.
3. THE TenantScope SHALL register a `withoutTenancy` macro on the Eloquent
   Builder to allow bypassing the scope.
4. THE BelongsToTenant trait SHALL apply TenantScope as a global scope on the
   model.
5. WHEN a model using BelongsToTenant is being created and tenancy is
   initialized, THE BelongsToTenant trait SHALL auto-fill the `tenant_id`
   attribute with the current tenant's key.
6. WHEN a model using BelongsToTenant is being created and tenancy is not
   initialized, THE BelongsToTenant trait SHALL leave the `tenant_id` attribute
   unchanged.
7. THE BelongsToTenant trait SHALL define a `tenant()` BelongsTo relationship to
   the configured Tenant model.

### Requirement 5: TenancyBootstrapper System

**User Story:** As a developer, I want a bootstrapper system that configures
Laravel services for tenant isolation, with bootstrappers auto-discovered via
`#[AsBootstrapper]` attribute instead of config arrays.

#### Acceptance Criteria

1. THE TenancyBootstrapperInterface SHALL define `bootstrap(Tenant): void` and
   `revert(): void` methods, annotated with `#[Bind]` attribute for container
   binding.
2. WHEN `TenancyInitialized` event is dispatched, THE BootstrapTenancy listener
   SHALL iterate over discovered bootstrappers and call `bootstrap()` on each.
3. WHEN `TenancyEnded` event is dispatched, THE RevertToCentralContext listener
   SHALL iterate over initialized bootstrappers in reverse order and call
   `revert()` on each.
4. THE TenancyManager SHALL track which bootstrappers have been initialized so
   that only initialized bootstrappers are reverted.
5. THE TenancyManager SHALL allow overriding the bootstrapper list via a
   `getBootstrappersUsing` callback.
6. THE service provider SHALL use the `HasDiscovery` trait to call
   `collectBootstrappers()` from `pixielity/laravel-discovery`, auto-registering
   any class annotated with `#[AsBootstrapper]`.

### Requirement 6: Cache Isolation Bootstrapper

**User Story:** As a developer, I want cache keys to be automatically prefixed
per tenant, so that tenants cannot read or overwrite each other's cached data.

#### Acceptance Criteria

1. WHEN tenancy is initialized, THE CacheBootstrapper SHALL prefix all
   configured cache store keys with a tenant-specific prefix containing the
   tenant key.
2. WHEN tenancy is ended, THE CacheBootstrapper SHALL restore the original cache
   prefixes.
3. THE CacheBootstrapper SHALL support a configurable list of cache store names
   to scope.
4. THE CacheBootstrapper SHALL support a custom prefix generator callback.
5. IF a cache store does not support the `setPrefix` method, THEN THE
   CacheBootstrapper SHALL throw an exception with a descriptive message.
6. THE CacheBootstrapper SHALL be annotated with `#[AsBootstrapper]` for
   automatic discovery.

### Requirement 7: Queue Isolation Bootstrapper

**User Story:** As a developer, I want queued jobs to execute within the correct
tenant context, so that jobs dispatched by a tenant process data in that
tenant's scope.

#### Acceptance Criteria

1. WHEN a job is dispatched while tenancy is initialized, THE QueueBootstrapper
   SHALL inject `tenant_id` into the job payload.
2. WHEN a queued job is being processed, THE QueueBootstrapper SHALL initialize
   tenancy using the `tenant_id` from the job payload before the job executes.
3. WHEN a queued job finishes processing, THE QueueBootstrapper SHALL revert to
   the previous tenant context or central context.
4. WHILE tenancy is not initialized, THE QueueBootstrapper SHALL dispatch jobs
   without a `tenant_id` in the payload.
5. IF a queue connection is marked as `central` in configuration, THEN THE
   QueueBootstrapper SHALL skip injecting `tenant_id` for jobs on that
   connection.
6. THE QueueBootstrapper SHALL be annotated with `#[AsBootstrapper]` for
   automatic discovery.

### Requirement 8: Filesystem Isolation Bootstrapper

**User Story:** As a developer, I want file storage to be scoped per tenant, so
that each tenant's files are stored in isolated directories or paths.

#### Acceptance Criteria

1. WHEN tenancy is initialized, THE FilesystemBootstrapper SHALL modify the root
   path of configured disk drivers to include a tenant-specific suffix.
2. WHEN tenancy is ended, THE FilesystemBootstrapper SHALL restore the original
   disk root paths.
3. THE FilesystemBootstrapper SHALL support a configurable list of disk names to
   scope.
4. THE FilesystemBootstrapper SHALL support root path override templates with
   `%tenant%` placeholder.
5. THE FilesystemBootstrapper SHALL purge resolved disk instances so that new
   instances pick up the modified configuration.
6. THE FilesystemBootstrapper SHALL be annotated with `#[AsBootstrapper]` for
   automatic discovery.

### Requirement 9: Tenant Resolver System

**User Story:** As a developer, I want a flexible resolver system that
identifies tenants from incoming requests using multiple strategies, with each
resolver bound via interface and `#[Bind]` attribute.

#### Acceptance Criteria

1. THE TenantResolverInterface SHALL define a
   `resolve(mixed ...args): TenantInterface` method that throws
   `TenantCouldNotBeIdentifiedException` on failure, annotated with `#[Bind]`
   attribute.
2. THE HeaderResolver SHALL resolve a tenant by reading a configurable HTTP
   header name and looking up the tenant by key.
3. THE SubdomainResolver SHALL resolve a tenant by extracting the subdomain
   fragment from the request hostname and looking up the tenant by slug.
4. THE DomainResolver SHALL resolve a tenant by matching the full request
   hostname against the `tenant_domains` table.
5. THE AuthResolver SHALL resolve a tenant from the authenticated user's
   `tenant_id` attribute.
6. THE ResolverChain SHALL evaluate resolvers in configured priority order and
   return the first successful resolution.
7. IF no resolver in the chain can identify a tenant, THEN THE ResolverChain
   SHALL throw a `TenantCouldNotBeIdentifiedException`.

### Requirement 10: Resolver Caching Layer

**User Story:** As a developer, I want resolved tenants to be cached, so that
repeated lookups for the same identifier do not hit the database on every
request.

#### Acceptance Criteria

1. WHERE resolver caching is enabled, THE CachedTenantResolver SHALL store
   resolved tenants in a configurable cache store with a configurable TTL.
2. WHERE resolver caching is enabled, THE CachedTenantResolver SHALL return
   cached tenants for subsequent lookups with the same identifier.
3. THE CachedTenantResolver SHALL provide an `invalidateCache(Tenant)` method
   that removes all cached entries for a given tenant.
4. WHERE resolver caching is disabled, THE CachedTenantResolver SHALL resolve
   tenants directly without cache interaction.

### Requirement 11: Identification Middleware

**User Story:** As a developer, I want HTTP middleware that automatically
identifies and initializes the tenant context, with middleware classes
discovered via `#[AsIdentification]` attribute instead of config arrays.

#### Acceptance Criteria

1. THE InitializeTenancyByHeader middleware SHALL extract the tenant identifier
   from a configurable HTTP header and initialize tenancy using the
   HeaderResolver.
2. THE InitializeTenancyBySubdomain middleware SHALL extract the subdomain from
   the request hostname and initialize tenancy using the SubdomainResolver.
3. THE InitializeTenancyByDomain middleware SHALL use the full request hostname
   and initialize tenancy using the DomainResolver.
4. IF tenant identification fails and a custom `onFail` callback is set, THEN
   THE IdentificationMiddleware SHALL invoke the callback instead of throwing an
   exception.
5. IF tenant identification fails and no `onFail` callback is set, THEN THE
   IdentificationMiddleware SHALL re-throw the
   `TenantCouldNotBeIdentifiedException`.
6. THE IdentificationMiddleware SHALL skip tenant identification for routes
   explicitly marked as central.
7. THE service provider SHALL use the `HasDiscovery` trait to call
   `collectIdentifications()` from `pixielity/laravel-discovery`,
   auto-registering any middleware class annotated with `#[AsIdentification]`.

### Requirement 12: Tenancy Facade

**User Story:** As a developer, I want a dedicated Tenancy facade, so that I can
access the TenancyManager singleton conveniently using `Tenancy::` static syntax
and a `tenancy()` helper function.

#### Acceptance Criteria

1. THE Tenancy facade SHALL proxy static calls to the TenancyManagerInterface
   binding.
2. THE `tenancy()` helper function SHALL return the TenancyManagerInterface
   instance from the container.
3. THE `tenant()` helper function SHALL return the current TenantInterface
   instance or null when called without arguments.
4. WHEN `tenant(key)` is called with a string argument, THE helper function
   SHALL return the value of that attribute from the current tenant.

### Requirement 13: TenantAware Unified Trait

**User Story:** As a developer, I want a unified TenantAware trait that provides
tenant context awareness to jobs, commands, seeders, and event listeners, so
that these components automatically execute within the correct tenant scope.

#### Acceptance Criteria

1. THE TenantAware trait SHALL store the `tenant_id` when the component is
   instantiated within an active tenant context.
2. WHEN a TenantAware job is serialized, THE trait SHALL include the `tenant_id`
   in the serialized payload.
3. WHEN a TenantAware job is unserialized, THE trait SHALL initialize tenancy
   for the stored `tenant_id` before execution.
4. THE TenantAwareCommand trait SHALL provide `--tenants` option to specify
   which tenants to run the command for.
5. THE TenantAwareCommand trait SHALL execute the command's `handle()` method
   within each specified tenant's context.
6. WHILE no `--tenants` option is provided, THE TenantAwareCommand trait SHALL
   run the command for all active tenants.

### Requirement 14: Tenant-Specific Seeders

**User Story:** As a developer, I want to run seeders scoped to a specific
tenant, so that default data is created within the correct tenant context on
tenant creation.

#### Acceptance Criteria

1. THE TenantSeeder base class SHALL accept a TenantInterface instance and run
   the seeder within that tenant's context using `TenancyManager::run()`.
2. WHEN a new Tenant is created and tenant seeders are configured, THE system
   SHALL execute the configured seeders within the new tenant's context.
3. THE `tenancy:seed` Artisan command SHALL accept a `--tenants` option to run
   seeders for specific tenants.
4. THE `tenancy:seed` Artisan command SHALL accept a `--class` option to specify
   which seeder class to run.

### Requirement 15: User Impersonation

**User Story:** As an admin, I want to securely impersonate a user within a
specific tenant, so that I can debug issues and view the system from a tenant
user's perspective.

#### Acceptance Criteria

1. THE UserImpersonation feature SHALL generate a time-limited impersonation
   token containing `tenant_id`, `user_id`, `redirect_url`, and `auth_guard`.
2. WHEN an impersonation token is redeemed, THE UserImpersonation feature SHALL
   verify the token has not expired using a configurable TTL.
3. WHEN an impersonation token is redeemed, THE UserImpersonation feature SHALL
   verify the token's `tenant_id` matches the current tenant context.
4. IF the impersonation token is expired or the tenant does not match, THEN THE
   UserImpersonation feature SHALL delete the token and return a 403 response.
5. WHEN impersonation is active, THE UserImpersonation feature SHALL store an
   `impersonating` flag in the session.
6. THE UserImpersonation feature SHALL provide a `stopImpersonating()` method
   that logs out the impersonated user and clears the session flag.

### Requirement 16: Cross-Domain Redirects

**User Story:** As a developer, I want redirect responses to support
cross-domain tenant URLs, so that redirects between tenant domains work
correctly.

#### Acceptance Criteria

1. THE CrossDomainRedirect feature SHALL register a `domain(string)` macro on
   Laravel's `RedirectResponse`.
2. WHEN the `domain()` macro is called, THE CrossDomainRedirect feature SHALL
   replace the hostname in the redirect target URL with the specified domain.

### Requirement 17: Telescope Tagging

**User Story:** As a developer, I want Telescope entries to be tagged with the
current tenant identifier, so that I can filter and debug logs per tenant.

#### Acceptance Criteria

1. WHILE tenancy is initialized and Laravel Telescope is installed, THE
   TelescopeTags feature SHALL tag all Telescope entries with
   `tenant:{tenant_key}`.
2. WHILE Telescope is not installed, THE TelescopeTags feature SHALL skip
   registration without errors.

### Requirement 18: Tenant Configuration Overrides

**User Story:** As a developer, I want tenants to override specific Laravel
configuration values, so that each tenant can have custom mail settings, API
keys, or service configurations.

#### Acceptance Criteria

1. THE TenantConfigBootstrapper SHALL accept a configurable map of tenant
   attribute keys to Laravel config keys.
2. WHEN tenancy is initialized, THE TenantConfigBootstrapper SHALL override the
   mapped Laravel config values with the tenant's attribute values.
3. WHEN tenancy is ended, THE TenantConfigBootstrapper SHALL restore the
   original Laravel config values.
4. WHILE a tenant attribute mapped to a config key is null, THE
   TenantConfigBootstrapper SHALL leave the original config value unchanged.
5. THE TenantConfigBootstrapper SHALL be annotated with `#[AsBootstrapper]` for
   automatic discovery.

### Requirement 19: Custom Exception Handling

**User Story:** As a developer, I want descriptive custom exceptions for tenant
resolution failures, so that I can handle errors gracefully and provide
meaningful feedback.

#### Acceptance Criteria

1. THE `TenantCouldNotBeIdentifiedException` abstract class SHALL extend PHP's
   `Exception` class and provide a base for all identification failures.
2. THE `TenantCouldNotBeIdentifiedOnDomainException` SHALL include the domain
   string that failed resolution in its message.
3. THE `TenantCouldNotBeIdentifiedByHeaderException` SHALL include the header
   value that failed resolution in its message.
4. THE `TenantCouldNotBeIdentifiedByIdException` SHALL include the tenant ID
   that failed lookup in its message.
5. THE `TenancyNotInitializedException` SHALL indicate that a tenant-scoped
   operation was attempted without an active tenant context.
6. THE `DomainOccupiedByOtherTenantException` SHALL include the domain string
   and the occupying tenant's identifier in its message.

### Requirement 20: Event System

**User Story:** As a developer, I want tenancy lifecycle events, so that I can
hook into tenant initialization, teardown, and CRUD operations for custom logic.

#### Acceptance Criteria

1. THE package SHALL dispatch `TenancyInitialized` event when tenancy is
   initialized, containing the TenancyManager instance.
2. THE package SHALL dispatch `TenancyEnded` event when tenancy is ended,
   containing the TenancyManager instance.
3. THE package SHALL dispatch `TenantCreated`, `TenantUpdated`, and
   `TenantDeleted` Eloquent model events on the Tenant model.
4. THE package SHALL dispatch `BootstrappingTenancy` event before bootstrappers
   run and `TenancyBootstrapped` event after all bootstrappers complete.

### Requirement 21: Artisan CLI Commands

**User Story:** As a developer, I want Artisan commands to manage tenants and
run operations in tenant context, so that I can administer tenants from the
command line.

#### Acceptance Criteria

1. THE `tenancy:create` command SHALL accept `name` and optional `slug`,
   `domain` arguments and create a new Tenant record via TenantServiceInterface.
2. THE `tenancy:list` command SHALL display a table of all tenants with their
   ID, name, slug, status, and domain count via TenantServiceInterface.
3. THE `tenancy:delete` command SHALL accept a tenant identifier and delete the
   tenant and associated domains via TenantServiceInterface.
4. THE `tenancy:domain:add` command SHALL accept a tenant identifier and domain
   string and create a TenantDomain record via TenantServiceInterface.
5. THE `tenancy:domain:remove` command SHALL accept a tenant identifier and
   domain string and delete the TenantDomain record via TenantServiceInterface.
6. THE `tenancy:seed` command SHALL run configured seeders within the specified
   tenant's context.
7. THE `tenancy:run` command SHALL accept an arbitrary Artisan command name and
   execute it within the specified tenant's context.
8. THE `tenancy:migrate` command SHALL run migrations within the specified
   tenant's context (applying tenant-scoped migration paths).
9. THE `tenancy:status` command SHALL accept a tenant identifier and `status`
   argument (`active`, `suspended`) and update the tenant's status via
   TenantServiceInterface.

### Requirement 22: Service Provider and Package Configuration

**User Story:** As a developer, I want the package to follow the Pixielity
modular package structure with a service provider using `HasDiscovery` trait for
auto-registration, so that it integrates seamlessly into the monorepo.

#### Acceptance Criteria

1. THE TenancyServiceProvider SHALL use the `HasDiscovery` trait from
   `pixielity/laravel-discovery` for automatic class registration.
2. THE TenancyServiceProvider SHALL register all Artisan commands.
3. THE TenancyServiceProvider SHALL load migrations from the package's
   Migrations directory.
4. THE TenancyServiceProvider SHALL publish a `tenancy.php` configuration file.
5. THE TenancyServiceProvider SHALL register event listeners for
   `TenancyInitialized` and `TenancyEnded` events.
6. THE TenancyServiceProvider SHALL call `collectBootstrappers()`,
   `collectFeatures()`, and `collectIdentifications()` via the `HasDiscovery`
   trait to auto-register annotated classes.
7. THE package SHALL include a `composer.json` following the Pixielity naming
   convention (`pixielity/laravel-tenancy`) and requiring
   `pixielity/laravel-crud`, `pixielity/laravel-discovery`,
   `pixielity/laravel-feature-flags`, `pixielity/laravel-health`,
   `spatie/laravel-model-states`, `spatie/laravel-activitylog`, and
   `laravel/pennant`.
8. THE package SHALL include a `module.json` file with the module name, alias,
   and provider class.

### Requirement 23: Feature Flags via Laravel Pennant (Separate Package)

**User Story:** As a developer, I want feature flags scoped to tenants using
Laravel Pennant via a separate `pixielity/laravel-feature-flag` package, so that
different tenants can have different capabilities based on their plan or
configuration.

#### Acceptance Criteria

1. THE `pixielity/laravel-feature-flag` package SHALL use Laravel Pennant
   (`laravel/pennant`) as the underlying feature flag engine.
2. THE feature-flag package SHALL scope Pennant features to the Tenant model
   using `Feature::for($tenant)->active('feature-name')`.
3. THE Tenant model SHALL use Pennant's `HasFeatures` trait for feature flag
   integration.
4. THE tenancy package SHALL require `pixielity/laravel-feature-flag` in its
   `composer.json`.
5. THE Tenant model SHALL NOT have custom `hasFeature()`, `enableFeature()`, or
   `disableFeature()` methods; Pennant's API SHALL be used instead.

### Requirement 24: Prevent Unsupported Database Operations

**User Story:** As a developer, I want the system to prevent database operations
that are incompatible with single-database multi-tenancy, so that developers do
not accidentally use unsupported features.

#### Acceptance Criteria

1. WHEN a SQLite `ATTACH` statement is detected in a multi-tenant context, THE
   package SHALL throw a `UnsupportedDatabaseOperationException`.
2. THE package SHALL provide a configurable list of disallowed database
   operations.

### Requirement 25: Interface-First Architecture with Attribute Constants

**User Story:** As a developer, I want every service, repository, and model to
have an interface with attribute name constants, so that column/attribute names
are never hardcoded as strings and all bindings go through interfaces with
`#[Bind]` attributes.

#### Acceptance Criteria

1. THE TenantInterface SHALL define attribute name constants (`ATTR_ID`,
   `ATTR_NAME`, `ATTR_SLUG`, `ATTR_STATUS`) for all model columns.
2. THE TenantDomainInterface SHALL define attribute name constants (`ATTR_ID`,
   `ATTR_TENANT_ID`, `ATTR_DOMAIN`, `ATTR_TYPE`, `ATTR_IS_PRIMARY`,
   `ATTR_IS_VERIFIED`, `ATTR_DNS_RECORD_TYPE`, `ATTR_DNS_TARGET`,
   `ATTR_SSL_STATUS`) for all model columns.
3. THE TenantSettingInterface SHALL define attribute name constants (`ATTR_ID`,
   `ATTR_TENANT_ID`, `ATTR_KEY`, `ATTR_VALUE`) for all model columns.
4. THE TenantMetadataInterface SHALL define attribute name constants (`ATTR_ID`,
   `ATTR_TENANT_ID`, `ATTR_KEY`, `ATTR_VALUE`) for all model columns.
5. ALL migrations, commands, services, seeders, and repositories SHALL use
   interface attribute constants instead of hardcoded column name strings.
6. ALL service interfaces SHALL be annotated with
   `#[Bind(ConcreteClass::class)]` for automatic container binding.
7. ALL model interfaces SHALL be placed in a `Contracts/` directory within their
   respective model domain directory.
8. ALL interfaces for services and repositories SHALL be placed in a
   `Contracts/` directory within their respective domain.

### Requirement 26: Laravel 13 Container Attributes

**User Story:** As a developer, I want all interfaces to use PHP attributes for
container binding instead of manual service provider registration, so that
bindings are declarative and co-located with the interface definition.

#### Acceptance Criteria

1. ALL service interfaces SHALL use `#[Bind(ConcreteClass::class)]` attribute to
   declare their implementation binding.
2. ALL singleton interfaces SHALL use `#[Singleton]` attribute to declare
   singleton lifecycle.
3. ALL request-scoped interfaces SHALL use `#[Scoped]` attribute to declare
   request-scoped lifecycle.
4. THE TenancyManagerInterface SHALL be annotated with both
   `#[Bind(TenancyManager::class)]` and `#[Singleton]`.
5. THE TenantServiceInterface SHALL be annotated with
   `#[Bind(TenantService::class)]`.
6. THE TenantRepositoryInterface SHALL be annotated with
   `#[Bind(TenantRepository::class)]`.
7. THE TenantSettingRepositoryInterface SHALL be annotated with
   `#[Bind(TenantSettingRepository::class)]`.
8. THE TenantMetadataRepositoryInterface SHALL be annotated with
   `#[Bind(TenantMetadataRepository::class)]`.

### Requirement 27: Laravel 13 Eloquent Model Attributes

**User Story:** As a developer, I want all models to use the new PHP attribute
syntax for Eloquent configuration, so that model metadata is declarative and
consistent with Laravel 13 conventions.

#### Acceptance Criteria

1. ALL Eloquent models SHALL use `#[Table('table_name')]` instead of
   `protected $table` property.
2. ALL Eloquent models SHALL use `#[Unguarded]` or `#[Guarded([])]` instead of
   `protected $guarded` property.
3. WHERE a model has hidden attributes, THE model SHALL use `#[Hidden([...])]`
   instead of `protected $hidden` property.
4. WHERE a model has fillable attributes, THE model SHALL use
   `#[Fillable([...])]` instead of `protected $fillable` property.
5. WHERE a model overrides the database connection, THE model SHALL use
   `#[Connection('connection_name')]` instead of `protected $connection`
   property.

### Requirement 28: Repository + Service Pattern (via pixielity/laravel-crud)

**User Story:** As a developer, I want a strict Repository + Service layered
architecture built on `pixielity/laravel-crud` base classes and PHP attributes,
so that controllers inject services, services inject repositories, and
repositories inject models, with each layer extending the CRUD package's base
classes and using declarative attribute configuration.

#### Acceptance Criteria

1. ALL service interfaces SHALL extend
   `Pixielity\Crud\Contracts\ServiceInterface` which provides base CRUD
   operations (`all`, `find`, `findOrFail`, `findBy`, `findWhere`, `create`,
   `update`, `delete`, `paginate`, `count`, `exists`).
2. ALL service implementations SHALL extend `Pixielity\Crud\Services\Service`
   which implements the base CRUD operations.
3. ALL repository interfaces SHALL extend
   `Pixielity\Crud\Contracts\RepositoryInterface` which provides base data
   access operations.
4. ALL repository implementations SHALL extend
   `Pixielity\Crud\Repositories\Repository` which implements the base data
   access operations.
5. ALL repositories SHALL use the `#[UseModel(ModelInterface::class)]` attribute
   to declare their associated model.
6. ALL services SHALL use the `#[UseRepository(RepositoryInterface::class)]`
   attribute to declare their associated repository.
7. THE TenantServiceInterface SHALL extend
   `Pixielity\Crud\Contracts\ServiceInterface` and add custom methods
   (`addDomain`, `removeDomain`, `updateStatus`).
8. THE TenantService SHALL extend `Pixielity\Crud\Services\Service` and inject
   TenantRepositoryInterface via constructor and
   `#[UseRepository(TenantRepositoryInterface::class)]` attribute.
9. THE TenantRepositoryInterface SHALL extend
   `Pixielity\Crud\Contracts\RepositoryInterface`.
10. THE TenantRepository SHALL extend `Pixielity\Crud\Repositories\Repository`
    and use `#[UseModel(TenantInterface::class)]` attribute.
11. THE TenantSettingRepositoryInterface SHALL extend
    `Pixielity\Crud\Contracts\RepositoryInterface` and add custom methods
    (`get`, `set`, `delete`, `all` by tenant).
12. THE TenantMetadataRepositoryInterface SHALL extend
    `Pixielity\Crud\Contracts\RepositoryInterface` and add custom methods
    (`get`, `set`, `delete`, `all` by tenant).
13. THE TenantSubscriptionServiceInterface SHALL extend
    `Pixielity\Crud\Contracts\ServiceInterface` and add custom methods
    (`hasActiveSubscription`, `isOnTrial`, `isOnPlan`).
14. THE TenantSubscriptionRepositoryInterface SHALL extend
    `Pixielity\Crud\Contracts\RepositoryInterface` and add custom method
    (`findByTenant`).
15. EACH layer (controller → service → repository → model) SHALL communicate
    through interfaces, not concrete classes.
16. Custom criteria classes (e.g., `ActiveTenantCriteria`) SHALL use the
    `#[AsCriteria]` attribute from `pixielity/laravel-crud` for auto-discovery.

### Requirement 29: Model Organization Pattern

**User Story:** As a developer, I want each model to follow a structured
directory pattern with traits for accessors, relations, and scopes, so that
model files remain clean and organized.

#### Acceptance Criteria

1. EACH model directory SHALL contain the main model file, a `Contracts/`
   subdirectory for the model interface, and a `Traits/` subdirectory organized
   by model name.
2. THE Tenant model SHALL use `AccessorsTrait` for all accessors and mutators,
   `RelationsTrait` for all relationship methods, and `ScopesTrait` for all
   query scopes.
3. THE TenantDomain model SHALL use `AccessorsTrait`, `RelationsTrait`, and
   `ScopesTrait` following the same pattern.
4. THE main model file SHALL use all its associated traits and contain minimal
   logic beyond trait usage and attribute declarations.

### Requirement 30: Tenant Settings Key-Value Store

**User Story:** As a developer, I want tenant settings stored in a separate
`tenant_settings` key-value table instead of a JSON column, so that settings are
queryable, indexable, and do not require schema migrations for new keys.

#### Acceptance Criteria

1. THE `tenant_settings` migration SHALL create a table with `id`, `tenant_id`
   (foreign key with cascade delete), `key` (string), and `value` (text,
   nullable) columns, using TenantSettingInterface attribute constants for
   column names.
2. THE `tenant_settings` table SHALL have a unique composite index on
   `tenant_id` and `key`.
3. THE TenantSetting model SHALL implement TenantSettingInterface and use
   Laravel 13 Eloquent model attributes (`#[Table('tenant_settings')]`,
   `#[Unguarded]`).
4. THE TenantSettingRepository SHALL provide
   `get(TenantInterface $tenant, string $key): ?string`,
   `set(TenantInterface $tenant, string $key, ?string $value): void`,
   `delete(TenantInterface $tenant, string $key): void`, and
   `all(TenantInterface $tenant): Collection` methods.
5. THE Tenant model SHALL define a `hasMany` relationship to the TenantSetting
   model.

### Requirement 31: Tenant Metadata Key-Value Store

**User Story:** As a developer, I want tenant metadata stored in a separate
`tenant_metadata` key-value table instead of a JSON column, so that metadata is
queryable and structured.

#### Acceptance Criteria

1. THE `tenant_metadata` migration SHALL create a table with `id`, `tenant_id`
   (foreign key with cascade delete), `key` (string), and `value` (text,
   nullable) columns, using TenantMetadataInterface attribute constants for
   column names.
2. THE `tenant_metadata` table SHALL have a unique composite index on
   `tenant_id` and `key`.
3. THE TenantMetadata model SHALL implement TenantMetadataInterface and use
   Laravel 13 Eloquent model attributes (`#[Table('tenant_metadata')]`,
   `#[Unguarded]`).
4. THE TenantMetadataRepository SHALL provide
   `get(TenantInterface $tenant, string $key): ?string`,
   `set(TenantInterface $tenant, string $key, ?string $value): void`,
   `delete(TenantInterface $tenant, string $key): void`, and
   `all(TenantInterface $tenant): Collection` methods.
5. THE Tenant model SHALL define a `hasMany` relationship to the TenantMetadata
   model.

### Requirement 32: TenantBlueprint Schema Macro

**User Story:** As a developer, I want a `->tenantable()` macro on Laravel's
Blueprint, so that any migration can easily add a `tenant_id` foreign key column
with index and cascade delete in a single call.

#### Acceptance Criteria

1. THE TenantBlueprint class SHALL register a `tenantable()` macro on Laravel's
   `Illuminate\Database\Schema\Blueprint`.
2. WHEN `$table->tenantable()` is called in a migration, THE macro SHALL add a
   `tenant_id` unsigned big integer column, a foreign key constraint referencing
   `tenants.id` with cascade on delete, and an index on `tenant_id`.
3. THE macro SHALL use TenantInterface::ATTR_ID for the referenced column name
   to avoid hardcoded strings.
4. THE TenancyServiceProvider SHALL register the TenantBlueprint macro during
   boot.

### Requirement 33: Attribute-Based Discovery

**User Story:** As a developer, I want bootstrappers, features, and
identification middleware to be auto-discovered via PHP attributes instead of
config arrays, so that registration is declarative and decoupled from
configuration files.

#### Acceptance Criteria

1. THE package SHALL provide `#[AsBootstrapper]`, `#[AsFeature]`, and
   `#[AsIdentification]` PHP attributes for class annotation.
2. THE TenancyServiceProvider SHALL use a `HasDiscovery` trait that calls
   `pixielity/laravel-discovery` for auto-registration.
3. THE `HasDiscovery` trait SHALL provide `collectBootstrappers()`,
   `collectFeatures()`, and `collectIdentifications()` methods that discover
   annotated classes.
4. ALL bootstrapper classes SHALL be annotated with `#[AsBootstrapper]` for
   automatic discovery.
5. ALL feature classes SHALL be annotated with `#[AsFeature]` for automatic
   discovery.
6. ALL identification middleware classes SHALL be annotated with
   `#[AsIdentification]` for automatic discovery.
7. THE discovery mechanism SHALL replace config-array-based registration for
   bootstrappers, features, and identification middleware.

### Requirement 34: Comprehensive DocBlocks and Comments

**User Story:** As a developer, I want all files, classes, methods, and
properties to have detailed PHPDoc blocks and code comments, so that the
codebase is self-documenting and easy to understand.

#### Acceptance Criteria

1. ALL PHP files SHALL include a file-level docblock describing the file's
   purpose.
2. ALL classes SHALL include a class-level docblock explaining the class's
   purpose and responsibility.
3. ALL public methods SHALL include `@param`, `@return`, and `@throws` PHPDoc
   tags.
4. ALL private and protected methods SHALL include `@param`, `@return`, and
   `@throws` PHPDoc tags.
5. ALL class properties SHALL include a PHPDoc `@var` tag describing the
   property's type and purpose.
6. CODE comments SHALL explain what the code is doing and why, not just restate
   the code.

### Requirement 35: Domain DNS Record Tracking

**User Story:** As a developer, I want the tenant domains table to track DNS
record information, so that the system can guide tenants on required DNS
configuration and track SSL certificate status.

#### Acceptance Criteria

1. THE `tenant_domains` table SHALL include a `type` column with enum values
   `subdomain` and `custom_domain`.
2. THE `tenant_domains` table SHALL include a `dns_record_type` column with
   nullable values `A` and `CNAME`.
3. THE `tenant_domains` table SHALL include a `dns_target` column (nullable
   string) storing the target value for the DNS record.
4. THE `tenant_domains` table SHALL include an `ssl_status` column with enum
   values `pending`, `active`, and `failed`.
5. THE TenantDomainInterface SHALL define attribute constants for all
   DNS-related columns (`ATTR_TYPE`, `ATTR_DNS_RECORD_TYPE`, `ATTR_DNS_TARGET`,
   `ATTR_SSL_STATUS`).

### Requirement 36: Tenant Status State Machine

**User Story:** As a developer, I want tenant status transitions managed by a
formal state machine using `spatie/laravel-model-states`, so that invalid status
changes are prevented at the model level and transitions are explicit and
auditable.

#### Acceptance Criteria

1. THE Tenant model SHALL use the `HasStates` trait from
   `spatie/laravel-model-states` for the `status` column.
2. THE package SHALL define `ActiveState`, `SuspendedState`, and `DeletedState`
   classes in `src/Models/States/Tenant/`, each extending the abstract
   `TenantState` base class.
3. THE state machine SHALL allow transitions from `ActiveState` to
   `SuspendedState`.
4. THE state machine SHALL allow transitions from `SuspendedState` to
   `ActiveState`.
5. THE state machine SHALL allow transitions from `ActiveState` to
   `DeletedState`.
6. THE state machine SHALL allow transitions from `SuspendedState` to
   `DeletedState`.
7. IF a transition from `DeletedState` to any other state is attempted, THEN THE
   state machine SHALL throw a `CouldNotPerformTransition` exception.
8. THE package SHALL add `spatie/laravel-model-states` to the `require` section
   of `composer.json`.

### Requirement 37: Audit Logging

**User Story:** As a developer, I want all tenant-related operations
automatically logged using `spatie/laravel-activitylog`, so that administrators
can audit tenant lifecycle events and troubleshoot issues.

#### Acceptance Criteria

1. THE Tenant model SHALL use the `LogsActivity` trait from
   `spatie/laravel-activitylog`.
2. WHEN a Tenant is created, THE activity logger SHALL record a `created`
   activity entry.
3. WHEN a Tenant is updated, THE activity logger SHALL record an `updated`
   activity entry.
4. WHEN a Tenant is deleted, THE activity logger SHALL record a `deleted`
   activity entry.
5. WHEN a tenant status transition occurs, THE activity logger SHALL record a
   `status_changed` activity entry containing the old and new status values.
6. WHEN a domain is added to a tenant, THE activity logger SHALL record a
   `domain_added` activity entry.
7. WHEN a domain is removed from a tenant, THE activity logger SHALL record a
   `domain_removed` activity entry.
8. WHEN impersonation starts, THE activity logger SHALL record an
   `impersonation_started` activity entry.
9. WHEN impersonation stops, THE activity logger SHALL record an
   `impersonation_stopped` activity entry.
10. WHEN a tenant setting is changed, THE activity logger SHALL record a
    `setting_changed` activity entry.
11. WHEN tenant metadata is changed, THE activity logger SHALL record a
    `metadata_changed` activity entry.
12. ALL activity log entries SHALL be tagged with `tenant:{tenant_id}` for
    filtering.
13. THE package SHALL add `spatie/laravel-activitylog` to the `require` section
    of `composer.json`.

### Requirement 38: Basic Subscription Module

**User Story:** As a developer, I want a basic subscription module for tenants
with plan tracking and status management, so that the system can enforce
plan-based access control and feature gating.

#### Acceptance Criteria

1. THE `tenant_subscriptions` migration SHALL create a table with `id`,
   `tenant_id` (foreign key with cascade delete), `plan` (string), `status`
   (string), `trial_ends_at` (nullable timestamp), `starts_at` (timestamp),
   `ends_at` (nullable timestamp), and timestamp columns, using
   TenantSubscriptionInterface attribute constants for column names.
2. THE TenantSubscription model SHALL implement TenantSubscriptionInterface and
   use Laravel 13 Eloquent model attributes (`#[Table('tenant_subscriptions')]`,
   `#[Unguarded]`).
3. THE TenantSubscriptionInterface SHALL define attribute name constants
   (`ATTR_ID`, `ATTR_TENANT_ID`, `ATTR_PLAN`, `ATTR_STATUS`,
   `ATTR_TRIAL_ENDS_AT`, `ATTR_STARTS_AT`, `ATTR_ENDS_AT`).
4. THE TenantSubscriptionRepositoryInterface SHALL be annotated with
   `#[Bind(TenantSubscriptionRepository::class)]` for automatic container
   binding.
5. THE TenantSubscriptionServiceInterface SHALL be annotated with
   `#[Bind(TenantSubscriptionService::class)]` for automatic container binding.
6. THE Tenant model SHALL define a `hasOne` or `hasMany` relationship to the
   TenantSubscription model.
7. THE TenantSubscriptionServiceInterface SHALL define
   `hasActiveSubscription(TenantInterface $tenant): bool`,
   `isOnTrial(TenantInterface $tenant): bool`, and
   `isOnPlan(TenantInterface $tenant, string $plan): bool` methods.
8. THE TenantSubscription model SHALL use the `HasStates` trait from
   `spatie/laravel-model-states` for the `status` column.
9. THE package SHALL define `ActiveSubscriptionState`,
   `CancelledSubscriptionState`, `ExpiredSubscriptionState`, and
   `TrialSubscriptionState` classes extending an abstract `SubscriptionState`
   base class.
10. THE subscription model organization SHALL follow the same pattern as other
    models: `Contracts/`, `Traits/TenantSubscription/` directories.

### Requirement 39: Rate Limiting Per Tenant

**User Story:** As a developer, I want tenant-specific rate limiting that
respects subscription plans, so that API usage is controlled per tenant and
higher-tier plans receive higher rate limits.

#### Acceptance Criteria

1. THE RateLimitBootstrapper SHALL implement TenancyBootstrapperInterface and be
   annotated with `#[AsBootstrapper]` for auto-discovery.
2. WHEN tenancy is initialized, THE RateLimitBootstrapper SHALL register
   tenant-specific rate limiters using `RateLimiter::for()` with keys that
   include the tenant ID.
3. THE RateLimitBootstrapper SHALL support configurable rate limits per tenant,
   retrievable from tenant settings.
4. THE RateLimitBootstrapper SHALL support different rate limits based on the
   tenant's subscription plan.
5. WHEN tenancy is ended, THE RateLimitBootstrapper SHALL restore default rate
   limiters.
6. THE rate limiter key SHALL include the tenant ID to prevent cross-tenant
   quota sharing.

### Requirement 40: Tenant Status Guard Middleware

**User Story:** As a developer, I want middleware that blocks requests to
suspended or deleted tenants with appropriate HTTP responses, so that inactive
tenants cannot access the API.

#### Acceptance Criteria

1. THE EnsureTenantIsActive middleware SHALL check the current tenant's status
   after tenant identification.
2. IF the tenant status is `suspended`, THEN THE EnsureTenantIsActive middleware
   SHALL return a 503 Service Unavailable response with a JSON error message.
3. IF the tenant is soft-deleted, THEN THE EnsureTenantIsActive middleware SHALL
   return a 403 Forbidden response with a JSON error message.
4. THE EnsureTenantIsActive middleware SHALL be configurable to specify which
   statuses are allowed (default: only `active`).
5. THE EnsureTenantIsActive middleware SHALL run after the identification
   middleware in the middleware stack.

### Requirement 41: Soft Deletes on Tenant

**User Story:** As a developer, I want tenants to support soft deletion, so that
deleted tenants can be restored and their data is preserved until permanent
deletion is explicitly requested.

#### Acceptance Criteria

1. THE Tenant model SHALL use Laravel's `SoftDeletes` trait.
2. THE `tenants` migration SHALL include a `deleted_at` nullable timestamp
   column.
3. WHILE a tenant is soft-deleted, THE tenant resolvers SHALL exclude the tenant
   from resolution results.
4. WHEN the `DeletedState` is transitioned to, THE Tenant model SHALL trigger a
   soft delete.
5. THE package SHALL provide a `tenancy:restore` Artisan command that accepts a
   tenant identifier and restores a soft-deleted tenant.
6. THE package SHALL provide a `tenancy:force-delete` Artisan command that
   accepts a tenant identifier and permanently deletes the tenant and all
   associated data.

### Requirement 42: Tenant Data Export/Import Service

**User Story:** As a developer, I want to export and import tenant data, so that
tenants can be migrated, backed up, or transferred between environments.

#### Acceptance Criteria

1. THE TenantDataExportServiceInterface SHALL be annotated with
   `#[Bind(TenantDataExportService::class)]` for automatic container binding.
2. THE TenantDataExportServiceInterface SHALL define an
   `export(TenantInterface $tenant): string` method that returns the file path
   of the exported data.
3. THE TenantDataExportServiceInterface SHALL define a
   `getExportableModels(): array` method that returns all models using the
   `BelongsToTenant` trait.
4. THE TenantDataExportService implementation SHALL collect data from all models
   using `BelongsToTenant` trait and include a
   `// TODO: Implement full export logic` placeholder.
5. THE TenantDataImportServiceInterface SHALL be annotated with
   `#[Bind(TenantDataImportService::class)]` for automatic container binding.
6. THE TenantDataImportServiceInterface SHALL define an
   `import(TenantInterface $tenant, string $filePath): void` method.
7. THE TenantDataImportService implementation SHALL include a
   `// TODO: Implement full import logic` placeholder.
8. THE package SHALL provide a `tenancy:export {tenant}` Artisan command that
   exports all data for the specified tenant.
9. THE package SHALL provide a `tenancy:import {tenant} {file}` Artisan command
   that imports data from the specified file into the tenant's context.

### Requirement 43: Tenant-Specific Queue Naming

**User Story:** As a developer, I want queue names to be scoped per tenant, so
that tenant workloads can be isolated and prioritized at the queue
infrastructure level.

#### Acceptance Criteria

1. THE QueueBootstrapper SHALL support tenant-specific queue names in addition
   to the existing `tenant_id` payload injection.
2. WHEN tenancy is initialized, THE QueueBootstrapper SHALL prefix configured
   queue names with the tenant identifier (e.g., `tenant-{id}-default`,
   `tenant-{id}-high`).
3. THE QueueBootstrapper SHALL support a configurable list of queue names to
   scope.
4. THE QueueBootstrapper SHALL support a queue name generator callback for
   custom naming patterns.
5. WHEN tenancy is ended, THE QueueBootstrapper SHALL restore original queue
   names.

### Requirement 44: Cache Warming on Tenant Initialization

**User Story:** As a developer, I want frequently-accessed tenant data preloaded
into cache when tenancy is initialized, so that database hits are reduced during
the request lifecycle.

#### Acceptance Criteria

1. THE CacheWarmingBootstrapper SHALL implement TenancyBootstrapperInterface and
   be annotated with `#[AsBootstrapper]` for auto-discovery.
2. WHEN tenancy is initialized, THE CacheWarmingBootstrapper SHALL preload
   tenant settings and metadata specified in a configurable list of keys into
   cache.
3. THE CacheWarmingBootstrapper SHALL support a custom warming callback for
   application-specific cache warming logic.
4. WHEN tenancy is ended, THE CacheWarmingBootstrapper SHALL take no action
   (cache entries expire naturally).

### Requirement 45: Tenant-Aware Notifications

**User Story:** As a developer, I want queued notifications to execute within
the correct tenant context, so that notification content and delivery are scoped
to the originating tenant.

#### Acceptance Criteria

1. THE TenantAwareNotification trait SHALL store the `tenant_id` when the
   notification is instantiated within an active tenant context.
2. WHEN a TenantAwareNotification notification is sent via queue, THE trait
   SHALL initialize tenancy for the stored `tenant_id` before the notification
   is processed.
3. WHEN a TenantAwareNotification notification finishes processing, THE trait
   SHALL revert to the previous tenant context.
4. THE TenantAwareNotification trait SHALL be separate from the `TenantAware`
   trait (for jobs) and the `TenantAwareCommand` trait (for commands) because
   notifications use `ShouldQueue` and the notification channel system, which
   has a different lifecycle than job serialization and command execution.
5. THE final set of tenant-aware traits SHALL be: `TenantAware` (jobs),
   `TenantAwareCommand` (commands), `TenantAwareNotification` (notifications).

### Requirement 46: Health Check Integration

**User Story:** As a developer, I want automated health checks for tenant-scoped
services, so that infrastructure issues affecting specific tenants can be
detected and reported.

#### Acceptance Criteria

1. THE package SHALL use `pixielity/laravel-health` (built on
   `spatie/laravel-health`) for tenant health checks.
2. THE package SHALL provide a `TenantDatabaseCheck` health check class
   annotated with `#[AsHealthCheck]` that verifies tenant-scoped queries execute
   correctly.
3. THE package SHALL provide a `TenantCacheCheck` health check class annotated
   with `#[AsHealthCheck]` that verifies the tenant cache prefix is working.
4. THE package SHALL provide a `TenantFilesystemCheck` health check class
   annotated with `#[AsHealthCheck]` that verifies the tenant storage path is
   accessible.
5. WHILE tenancy is initialized, THE health checks SHALL run within the current
   tenant context.
6. THE package SHALL add `pixielity/laravel-health` to the `require` section of
   `composer.json`.

### Requirement 47: Feature Flags via pixielity/laravel-feature-flags

**User Story:** As a developer, I want feature flags scoped to tenants using
`pixielity/laravel-feature-flags` (built on Laravel Pennant), so that different
tenants can have different capabilities with full repository pattern, service
layer, and helper function support.

#### Acceptance Criteria

1. THE package SHALL use `pixielity/laravel-feature-flags` (NOT
   `pixielity/laravel-feature-flag`) as the feature flag integration package.
2. THE `pixielity/laravel-feature-flags` package SHALL provide repository
   pattern, service layer, facades, helper functions, `#[Scoped]` attributes,
   and OpenAPI support built on Laravel Pennant.
3. THE Tenant model SHALL work with Pennant's scope system using
   `Feature::for($tenant)->active('feature-name')`.
4. THE package SHALL use `FeatureFlagServiceInterface` from
   `pixielity/laravel-feature-flags` for dependency injection.
5. THE package SHALL support `feature()`, `featureFor()`, `activateFeature()`,
   and `deactivateFeature()` helper functions from
   `pixielity/laravel-feature-flags`.
6. THE TenancyServiceProvider SHALL set Pennant's default scope to the current
   tenant using `Feature::resolveScopeUsing(fn () => tenant())`.
7. THE package SHALL add `pixielity/laravel-feature-flags` to the `require`
   section of `composer.json` (replacing `pixielity/laravel-feature-flag`).
8. THE package `composer.json` SHALL require: `pixielity/laravel-discovery`,
   `pixielity/laravel-feature-flags`, `pixielity/laravel-health`,
   `spatie/laravel-model-states`, `spatie/laravel-activitylog`, and
   `laravel/pennant`.
