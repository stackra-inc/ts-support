# Implementation Tasks

## Task 1: Package Scaffolding

- [x] Create `packages/framework/src/ServiceProvider/composer.json` with
      dependencies
- [x] Create `packages/framework/src/ServiceProvider/module.json`

## Task 2: ModuleConstants Interface

- [x] Create `src/ModuleConstants.php` — interface with DIR*\*, FILE*_, TAG\__,
      PATH*PREFIX, CACHE_KEY*\* constants

## Task 3: Attributes

- [x] Create `src/Attributes/Module.php` — #[Module] attribute with ATTR\_\*
      constants, name, namespace, priority, assetVersion, dependencies, path,
      viewNamespace, translationNamespace
- [x] Create `src/Attributes/LoadsResources.php` — #[LoadsResources] attribute
      with ATTR\_\* constants, 15 boolean flags, loadsAll(), loadsNone()

## Task 4: Enums

- [x] Create `src/Enums/ModuleLifecycleEvent.php` — backed string enum with
      REGISTERING, REGISTERED, BOOTING, BOOTED cases

## Task 5: Contracts

- [x] Create `src/Contracts/ServiceProviderInterface.php`
- [x] Create `src/Contracts/HasBindings.php`
- [x] Create `src/Contracts/HasMiddleware.php`
- [x] Create `src/Contracts/HasRoutes.php`
- [x] Create `src/Contracts/HasObservers.php`
- [x] Create `src/Contracts/HasPolicies.php`
- [x] Create `src/Contracts/HasHealthChecks.php`
- [x] Create `src/Contracts/HasMacros.php`
- [x] Create `src/Contracts/HasScheduledTasks.php`
- [x] Create `src/Contracts/Terminatable.php`

## Task 6: Concern Traits

- [x] Create `src/Concerns/ReadsAttributes.php` —
      reads #[Module] + #[LoadsResources] via Attributes::forClass(), module
      identity accessors, path auto-detection
- [x] Create `src/Concerns/LoadsResources.php` — migrations, config, views
      (vendor overrides), translations (vendor overrides), routes (api, web,
      channels)
- [x] Create `src/Concerns/DiscoversResources.php` — commands, controllers,
      middleware, listeners, seeders via Discovery
- [x] Create `src/Concerns/PublishesResources.php` — assets, config, views,
      translations publishing
- [x] Create `src/Concerns/ManagesLifecycle.php` — lifecycle events,
      termination, debug logging
- [x] Create `src/Concerns/RegistersHooks.php` — boot-phase + register-phase
      hook dispatch via instanceof
- [x] Create `src/Concerns/SupportsDeferredLoading.php` — deferred provider
      support
- [x] Create `src/Concerns/ProvidesServices.php` — composition trait bundling
      all 7 traits

## Task 7: Base ServiceProvider Class

- [x] Create `src/Providers/ServiceProvider.php` — abstract base class extending
      Laravel's ServiceProvider
