# Requirements Document

## Introduction

Redesign the Pixielity service provider package (`packages/service-provider/`)
to replace property/flag-based configuration with PHP 8.5 attributes. The
current package at `.docs/ServiceProvider/` uses ~20 concern traits with boolean
flags (`$loadMigrations`, `$loadTranslations`, etc.) and runtime reflection for
attribute reading. The redesigned package uses `composer-attribute-collector`
(`Attributes::forClass()`) for cached attribute reading with zero runtime
reflection in hot paths, `pixielity/laravel-discovery` for auto-discovery, and
is fully Octane-safe. The `ProvidesServices` trait is retained for composition
flexibility, and all concern traits are consolidated into fewer, cohesive
traits.

## Glossary

- **Service_Provider**: The base abstract class or trait composition that
  extends Laravel's `Illuminate\Support\ServiceProvider` and provides automatic
  resource loading, discovery, and lifecycle management for Pixielity packages.
- **ProvidesServices_Trait**: The composition trait that bundles all concern
  traits, allowing classes that extend a different base to gain full service
  provider functionality.
- **Module_Attribute**: A PHP 8.5 attribute (`#[Module]`) placed on a service
  provider class to declare the module name, namespace, and optional metadata,
  replacing `$moduleName` and `$moduleNamespace` string properties.
- **LoadsResources_Attribute**: A PHP 8.5 attribute (`#[LoadsResources]`) placed
  on a service provider class to declaratively configure which resources
  (migrations, routes, views, translations, config, commands, seeders,
  middleware, observers, policies, health checks, macros, scheduled tasks) the
  provider loads.
- **Attribute_Collector**: The `koriym/attributes` /
  `composer-attribute-collector` library accessed via `Attributes::forClass()`
  that provides build-time cached attribute reading with zero runtime
  reflection.
- **Discovery_Package**: The `pixielity/laravel-discovery` package that provides
  attribute-based auto-discovery of classes (commands, controllers, middleware,
  listeners, seeders) using cached composer data.
- **Octane_Safe**: A design constraint requiring no static mutable state across
  requests; all request-scoped registries use Laravel's `#[Scoped]` container
  binding.
- **Concern_Trait**: A PHP trait that encapsulates a single area of service
  provider functionality (e.g., resource loading, route registration, lifecycle
  events).
- **Lifecycle_Event_Enum**: A backed string enum (`ModuleLifecycleEvent`)
  defining lifecycle events (registering, registered, booting, booted) fired
  during provider execution.
- **Hook_Interface**: A PHP interface (e.g., `HasBindings`, `HasMiddleware`,
  `HasRoutes`) that a service provider implements to opt-in to specific hook
  methods called during boot or register phases.

## Requirements

### Requirement 1: Module Attribute Declaration

**User Story:** As a package developer, I want to declare my module's identity
via a `#[Module]` attribute on the service provider class, so that I no longer
need `$moduleName` and `$moduleNamespace` string properties.

#### Acceptance Criteria

1. WHEN a service provider class is decorated with
   `#[Module(name: 'Tenancy', namespace: 'Pixielity\\Tenancy')]`, THE
   Attribute_Collector SHALL read the Module_Attribute via
   `Attributes::forClass()` and make the module name and namespace available to
   all concern traits.
2. WHEN a `#[Module]` attribute specifies optional parameters (priority,
   assetVersion, dependencies), THE Service_Provider SHALL use those values
   instead of defaults.
3. WHEN a `#[Module]` attribute omits optional parameters, THE Service_Provider
   SHALL use default values: priority=100, assetVersion='1.0.0',
   dependencies=[].
4. WHEN a service provider class lacks a `#[Module]` attribute, THE
   Service_Provider SHALL throw a `\RuntimeException` with a message identifying
   the class and the missing attribute.
5. THE Service_Provider SHALL read the Module_Attribute exclusively via
   `Attributes::forClass()` with zero runtime reflection calls.
6. WHEN the module path is not explicitly provided in the `#[Module]` attribute,
   THE Service_Provider SHALL auto-detect the module path from the provider
   class file location using the same directory traversal logic as the current
   `detectModulePath()` method.

### Requirement 2: Attribute-Based Resource Configuration

**User Story:** As a package developer, I want to use the `#[LoadsResources]`
attribute to declaratively configure which resources my service provider loads,
so that I avoid scattered boolean flags and `should*()` methods.

#### Acceptance Criteria

1. THE Service_Provider SHALL read the LoadsResources_Attribute via
   `Attributes::forClass()` with zero runtime reflection.
2. WHEN a service provider class is decorated with
   `#[LoadsResources(migrations: true, routes: true, views: false)]`, THE
   Service_Provider SHALL load only the resources set to `true`.
3. WHEN a service provider class is decorated with `#[LoadsResources]` with no
   arguments, THE Service_Provider SHALL load all resources (all default to
   `true`).
4. WHEN a service provider class lacks a `#[LoadsResources]` attribute, THE
   Service_Provider SHALL load all resources for backward compatibility.
5. THE LoadsResources_Attribute SHALL support the following resource flags:
   migrations, routes, views, translations, config, commands, seeders,
   publishables, middleware, observers, policies, healthChecks, listeners,
   macros, scheduledTasks.
6. THE Service_Provider SHALL eliminate all `should*()` methods and replace
   conditional checks with direct reads from the cached LoadsResources_Attribute
   instance.

### Requirement 3: Zero Runtime Reflection in Hot Paths

**User Story:** As a platform engineer, I want the service provider to use
`composer-attribute-collector` for all attribute reading, so that there is zero
runtime reflection overhead during request handling.

#### Acceptance Criteria

1. THE Service_Provider SHALL use `Attributes::forClass()` from
   `composer-attribute-collector` for reading all class-level attributes
   (Module_Attribute, LoadsResources_Attribute).
2. THE Service_Provider SHALL contain zero calls to
   `ReflectionClass::getAttributes()`, `Reflection::getAttributes()`, or any PHP
   reflection API for attribute reading in the register or boot phases.
3. WHEN the Attribute_Collector cache is stale or missing, THE Service_Provider
   SHALL fall back to reading attributes via reflection and log a warning.
4. THE Service_Provider SHALL not use
   `Pixielity\Support\Reflection::getAttributes()` for reading service provider
   configuration attributes.

### Requirement 4: Discovery-Based Auto-Registration

**User Story:** As a package developer, I want all discoverable resources
(commands, controllers, middleware, listeners, seeders) to be found via
`pixielity/laravel-discovery`, so that I get consistent, cached discovery
without manual registration.

#### Acceptance Criteria

1. WHEN a service provider boots, THE Discovery_Package SHALL discover commands
   by scanning for classes with the `#[AsCommand]` attribute in the module's
   `Console/Commands/` directory.
2. WHEN a service provider boots, THE Discovery_Package SHALL discover
   controllers by scanning for classes with the `#[AsController]` attribute.
3. WHEN a service provider boots, THE Discovery_Package SHALL discover
   middleware by scanning for classes with the `#[AsMiddleware]` attribute.
4. WHEN a service provider boots, THE Discovery_Package SHALL discover listeners
   by scanning the module's `Listeners/` directory.
5. WHEN a service provider boots, THE Discovery_Package SHALL discover seeders
   by convention (`{ModuleNamespace}\Seeders\{ModuleName}DatabaseSeeder`).
6. THE Service_Provider SHALL cache all discovery results using the
   Discovery_Package's built-in caching mechanism.
7. THE Service_Provider SHALL not use `RecursiveDirectoryIterator`, `glob()`, or
   manual filesystem scanning for resource discovery.

### Requirement 5: Octane-Safe Design

**User Story:** As a platform engineer running Laravel Octane, I want the
service provider to be free of static mutable state, so that request-scoped data
does not leak between requests.

#### Acceptance Criteria

1. THE Service_Provider SHALL contain zero static mutable properties across all
   traits and classes.
2. WHEN the Service_Provider caches attribute instances (Module_Attribute,
   LoadsResources_Attribute), THE Service_Provider SHALL store them as instance
   properties on the provider, not as static properties.
3. WHEN a service provider registers request-scoped services, THE
   Service_Provider SHALL use Laravel's `scoped()` container binding method.
4. THE Service_Provider SHALL not store request-specific data in class-level
   properties that persist across Octane worker requests.

### Requirement 6: Consolidated Concern Traits

**User Story:** As a package maintainer, I want the ~20 concern traits
consolidated into fewer, cohesive traits, so that the package is easier to
understand and maintain.

#### Acceptance Criteria

1. THE Service_Provider package SHALL consolidate resource loading concerns
   (migrations, views, translations, config) into a single `LoadsResources`
   trait.
2. THE Service_Provider package SHALL consolidate discovery concerns (commands,
   controllers, listeners, seeders) into a single `DiscoversResources` trait.
3. THE Service_Provider package SHALL consolidate publishing concerns (assets,
   config, views, translations) into a single `PublishesResources` trait.
4. THE Service_Provider package SHALL retain separate traits for cross-cutting
   concerns: `ManagesLifecycle` (lifecycle events and termination),
   `RegistersHooks` (interface-based hook dispatch for bindings, middleware,
   routes, observers, policies, health checks, macros, scheduled tasks).
5. THE Service_Provider package SHALL retain the `ProvidesServices_Trait` as the
   single composition trait that bundles all consolidated concern traits.
6. THE ProvidesServices_Trait SHALL compose no more than 7 traits total.

### Requirement 7: Hook Interface Dispatch

**User Story:** As a package developer, I want to implement specific interfaces
(HasBindings, HasMiddleware, HasRoutes, etc.) to opt-in to hook methods, so that
the service provider calls my methods at the correct lifecycle phase.

#### Acceptance Criteria

1. WHEN a service provider implements the `HasBindings` interface, THE
   Service_Provider SHALL call the `bindings()` method during the register
   phase.
2. WHEN a service provider implements the `HasMiddleware` interface, THE
   Service_Provider SHALL call the `middleware(Router $router)` method during
   the boot phase.
3. WHEN a service provider implements the `HasRoutes` interface, THE
   Service_Provider SHALL call the `routes(Router $router)` method during the
   boot phase.
4. WHEN a service provider implements the `HasObservers` interface, THE
   Service_Provider SHALL call the `observers()` method during the boot phase.
5. WHEN a service provider implements the `HasPolicies` interface, THE
   Service_Provider SHALL call the `policies()` method during the boot phase.
6. WHEN a service provider implements the `HasHealthChecks` interface, THE
   Service_Provider SHALL call the `healthChecks()` method during the boot phase
   and register returned checks with Spatie Health.
7. WHEN a service provider implements the `HasMacros` interface, THE
   Service_Provider SHALL call the `macros()` method during the boot phase.
8. WHEN a service provider implements the `HasScheduledTasks` interface, THE
   Service_Provider SHALL call the `scheduledTasks(Schedule $schedule)` method
   during the boot phase only when running in console.
9. WHEN a service provider implements the `Terminatable` interface, THE
   Service_Provider SHALL register a terminating callback that calls the
   `terminating()` method.
10. WHEN a service provider does not implement a hook interface, THE
    Service_Provider SHALL skip the corresponding hook method without error.
11. THE Service_Provider SHALL check interface implementation using `instanceof`
    checks, not runtime reflection.

### Requirement 8: Lifecycle Event Management

**User Story:** As a package developer, I want lifecycle events (registering,
registered, booting, booted) fired as Laravel events during provider execution,
so that other parts of the application can react to module lifecycle changes.

#### Acceptance Criteria

1. THE Service_Provider SHALL fire a `module.registering` event at the start of
   the register phase with module context data (name, namespace, path).
2. THE Service_Provider SHALL fire a `module.registered` event at the end of the
   register phase with module context data.
3. THE Service_Provider SHALL fire a `module.booting` event at the start of the
   boot phase with module context data.
4. THE Service_Provider SHALL fire a `module.booted` event at the end of the
   boot phase with module context data.
5. THE Lifecycle_Event_Enum SHALL be a backed string enum with cases:
   REGISTERING='module.registering', REGISTERED='module.registered',
   BOOTING='module.booting', BOOTED='module.booted'.
6. THE Lifecycle_Event_Enum SHALL use the `Pixielity\Enum\Enum` trait for enum
   utility methods.

### Requirement 9: Resource Loading from Module Path

**User Story:** As a package developer, I want the service provider to
automatically load migrations, views, translations, config, and routes from
conventional directory paths relative to the module root, so that I follow a
consistent package structure.

#### Acceptance Criteria

1. WHEN migrations loading is enabled, THE Service_Provider SHALL load
   migrations from `{moduleSourcePath}/Migrations`.
2. WHEN views loading is enabled, THE Service_Provider SHALL load views from
   `{moduleSourcePath}/views` namespaced as the lowercase module name.
3. WHEN translations loading is enabled, THE Service_Provider SHALL load
   translations from `{moduleSourcePath}/i18n` namespaced as the lowercase
   module name.
4. WHEN config loading is enabled, THE Service_Provider SHALL merge config from
   `{modulePath}/config/config.php` namespaced as
   `{lowercase_module_name}.config`.
5. WHEN routes loading is enabled, THE Service_Provider SHALL load
   `{moduleSourcePath}/routes/api.php` with the `api` middleware group and
   `{moduleSourcePath}/routes/web.php` as web routes.
6. THE Service_Provider SHALL detect the module source path as
   `{modulePath}/src` if that directory exists, otherwise `{modulePath}`.
7. WHEN a resource directory does not exist, THE Service_Provider SHALL skip
   loading that resource without error.

### Requirement 10: Resource Publishing

**User Story:** As a package developer, I want the service provider to register
publishable assets, config, views, and translations with Laravel's publish
system, so that users can customize module resources.

#### Acceptance Criteria

1. WHEN publishables loading is enabled, THE Service_Provider SHALL register the
   module's `resources/` directory as publishable to
   `public/pixielity/{module_slug}/{asset_version}/` tagged as
   `{module_slug}-assets`.
2. WHEN publishables loading is enabled, THE Service_Provider SHALL register the
   module's `config/*.php` files as publishable tagged as
   `{module_slug}-config`.
3. WHEN publishables loading is enabled, THE Service_Provider SHALL register the
   module's `{sourceDir}/views/` directory as publishable to
   `resources/views/vendor/{module_slug}/` tagged as `{module_slug}-views`.
4. WHEN publishables loading is enabled, THE Service_Provider SHALL register the
   module's `{sourceDir}/i18n/` directory as publishable to
   `lang/vendor/{module_slug}/` tagged as `{module_slug}-lang`.
5. WHEN a publishable resource directory does not exist, THE Service_Provider
   SHALL skip registering that publishable without error.

### Requirement 11: ProvidesServices Trait Composition

**User Story:** As a package developer, I want to use the `ProvidesServices`
trait when I need to extend a different base class, so that I get full service
provider functionality without extending the Pixielity base ServiceProvider.

#### Acceptance Criteria

1. THE ProvidesServices_Trait SHALL compose all consolidated concern traits and
   provide `bootApplication()` and `registerApplication()` orchestration
   methods.
2. WHEN a class uses the ProvidesServices_Trait and calls `bootApplication()`,
   THE ProvidesServices_Trait SHALL execute the full boot sequence: fire booting
   event, load resources, discover resources, register publishables, dispatch
   hook interfaces, fire booted event.
3. WHEN a class uses the ProvidesServices_Trait and calls
   `registerApplication()`, THE ProvidesServices_Trait SHALL execute the full
   register sequence: fire registering event, dispatch HasBindings hook, fire
   registered event.
4. THE ProvidesServices_Trait SHALL read module configuration from the
   `#[Module]` attribute via `Attributes::forClass()`.
5. THE ProvidesServices_Trait SHALL provide an `initializeServiceProvider()`
   method that reads attributes and validates configuration.

### Requirement 12: Base ServiceProvider Class

**User Story:** As a package developer, I want a base `ServiceProvider` abstract
class that extends Laravel's ServiceProvider and uses the ProvidesServices
trait, so that I can extend it with minimal boilerplate.

#### Acceptance Criteria

1. THE Service_Provider abstract class SHALL extend
   `Illuminate\Support\ServiceProvider` and use the ProvidesServices_Trait.
2. THE Service_Provider abstract class SHALL implement `boot()` by calling
   `$this->bootApplication()`.
3. THE Service_Provider abstract class SHALL implement `register()` by calling
   `$this->registerApplication()`.
4. THE Service_Provider abstract class SHALL implement the `ServiceProvider`
   contract interface.
5. WHEN a package developer extends the Service_Provider class, THE developer
   SHALL only need to add `#[Module]` and optionally `#[LoadsResources]`
   attributes and implement desired hook interfaces.

### Requirement 13: Vendor View and Translation Overrides

**User Story:** As a package developer, I want the service provider to support
overriding third-party package views and translations by placing files in
`views/vendor/{package}/` and `i18n/vendor/{package}/` directories, so that my
module can customize other packages' output.

#### Acceptance Criteria

1. WHEN a `{sourceDir}/views/vendor/{package_name}/` directory exists, THE
   Service_Provider SHALL register those views as overrides for the
   `{package_name}` view namespace.
2. WHEN a `{sourceDir}/i18n/vendor/{package_name}/` directory exists, THE
   Service_Provider SHALL register those translations as overrides for the
   `{package_name}` translation namespace.
3. THE Service_Provider SHALL re-register vendor translation overrides after all
   providers have booted to ensure overrides take precedence.
4. WHEN no vendor override directories exist, THE Service_Provider SHALL skip
   vendor override registration without error.

### Requirement 14: Module Constants

**User Story:** As a package developer, I want standardized constants for
directory names, file names, and publishing tags, so that all modules use
consistent naming without magic strings.

#### Acceptance Criteria

1. THE Service_Provider package SHALL define constants for directory names:
   DIR_ROUTES='routes', DIR_VIEWS='views', DIR_I18N='i18n',
   DIR_MIGRATIONS='Migrations', DIR_SEEDERS='Seeders', DIR_COMMANDS='Commands',
   DIR_CONSOLE='Console', DIR_LISTENERS='Listeners', DIR_CONFIG='config',
   DIR_RESOURCES='resources', DIR_VENDOR='vendor'.
2. THE Service_Provider package SHALL define constants for file names:
   FILE_ROUTES_API='api.php', FILE_ROUTES_WEB='web.php',
   FILE_ROUTES_CHANNELS='channels.php', FILE_CONFIG='config.php'.
3. THE Service_Provider package SHALL define constants for publishing tags:
   TAG_ASSETS='assets', TAG_CONFIG='config', TAG_VIEWS='views', TAG_LANG='lang'.
4. THE Service_Provider package SHALL define a path prefix constant:
   PATH_PREFIX='pixielity'.

### Requirement 15: Deferred Loading Support

**User Story:** As a package developer, I want to mark my service provider as
deferred so it only loads when its services are requested, so that application
boot time is reduced for heavy modules.

#### Acceptance Criteria

1. WHEN a service provider sets `$defer = true` and implements
   `getProvidedServices()`, THE Service_Provider SHALL return the provided
   services array from the `provides()` method.
2. WHEN `$defer` is `false`, THE Service_Provider SHALL return an empty array
   from `provides()`.
3. THE Service_Provider SHALL support deferred loading for providers that only
   register container bindings and do not load routes, views, or middleware.

### Requirement 16: Debug Logging

**User Story:** As a package developer, I want conditional debug logging
prefixed with the module name, so that I can troubleshoot resource loading
issues during development.

#### Acceptance Criteria

1. WHEN the application debug mode is enabled (`config('app.debug')` is `true`)
   or the provider's `$debug` property is `true`, THE Service_Provider SHALL log
   debug messages via Laravel's logger.
2. THE Service_Provider SHALL prefix all debug log messages with
   `[Module: {ModuleName}]` for filtering.
3. WHEN debug mode is disabled, THE Service_Provider SHALL skip all debug
   logging with zero overhead.
