# Technical Design Document

## Introduction

This document describes the technical design for redesigning the Pixielity
service provider package. The redesigned package replaces property/flag-based
configuration with PHP 8.5 attributes, consolidates ~20 concern traits into 7,
uses `composer-attribute-collector` for zero-reflection attribute reading, and
`pixielity/laravel-discovery` for cached auto-discovery. All code is
Octane-safe.

The new package lives at `packages/service-provider/` with namespace
`Pixielity\ServiceProvider`.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Package Developer's Provider                  │
│                                                                  │
│  #[Module(name: 'Tenancy', namespace: 'Pixielity\\Tenancy')]    │
│  #[LoadsResources(migrations: true, routes: true)]              │
│  class TenancyServiceProvider extends ServiceProvider            │
│      implements HasBindings, HasMiddleware { ... }               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ extends
┌──────────────────────────▼──────────────────────────────────────┐
│              ServiceProvider (abstract base class)                │
│              uses ProvidesServices                                │
│              boot() → bootApplication()                          │
│              register() → registerApplication()                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ uses
┌──────────────────────────▼──────────────────────────────────────┐
│                    ProvidesServices (trait)                       │
│  Composes 7 traits:                                              │
│  ┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │
│  │ ReadsAttributes  │ │ LoadsResources   │ │ DiscoversResources│ │
│  └─────────────────┘ └──────────────────┘ └──────────────────┘  │
│  ┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │
│  │PublishesResources│ │ ManagesLifecycle │ │ RegistersHooks   │  │
│  └─────────────────┘ └──────────────────┘ └──────────────────┘  │
│  ┌─────────────────────┐                                         │
│  │SupportsDeferredLoad │                                         │
│  └─────────────────────┘                                         │
└─────────────────────────────────────────────────────────────────┘
         │                        │                    │
         ▼                        ▼                    ▼
┌─────────────────┐  ┌────────────────────┐  ┌─────────────────┐
│ Attributes::     │  │ Discovery::        │  │ Hook Interfaces │
│ forClass()       │  │ attribute()        │  │ HasBindings     │
│ (cached, zero    │  │ (cached discovery) │  │ HasMiddleware   │
│  reflection)     │  │                    │  │ HasRoutes ...   │
└─────────────────┘  └────────────────────┘  └─────────────────┘
```

## Data Flow

### Register Sequence

```
registerApplication()
  ├── resolveAttributes()          ← ReadsAttributes: Attributes::forClass()
  │   ├── resolve #[Module]        ← cached, zero reflection
  │   └── resolve #[LoadsResources]← cached, zero reflection
  ├── validateConfiguration()      ← throws RuntimeException if #[Module] missing
  ├── detectModulePath()           ← auto-detect from file location
  ├── fireEvent(REGISTERING)       ← ManagesLifecycle
  ├── dispatchBindingsHook()       ← RegistersHooks: if ($this instanceof HasBindings)
  └── fireEvent(REGISTERED)        ← ManagesLifecycle
```

### Boot Sequence

```
bootApplication()
  ├── resolveAttributes()          ← ReadsAttributes (cached from register)
  ├── fireEvent(BOOTING)           ← ManagesLifecycle
  │
  ├── [LoadsResources trait]
  │   ├── loadMigrations()         ← if resourceConfig->migrations
  │   ├── loadConfig()             ← if resourceConfig->config
  │   ├── loadViews()              ← if resourceConfig->views (+ vendor overrides)
  │   ├── loadTranslations()       ← if resourceConfig->translations (+ vendor overrides)
  │   └── loadRoutes()             ← if resourceConfig->routes (api.php, web.php, channels.php)
  │
  ├── [DiscoversResources trait]
  │   ├── discoverCommands()       ← Discovery::attribute(AsCommand::class)
  │   ├── discoverControllers()    ← Discovery::attribute(AsController::class)
  │   ├── discoverMiddleware()     ← Discovery::attribute(AsMiddleware::class)
  │   ├── discoverListeners()      ← Discovery::directories(Listeners/)
  │   └── discoverSeeders()        ← convention-based class check
  │
  ├── [PublishesResources trait]
  │   ├── publishAssets()          ← resources/ → public/pixielity/{slug}/{version}/
  │   ├── publishConfig()          ← config/*.php → config_path()
  │   ├── publishViews()           ← views/ → resources/views/vendor/{slug}/
  │   └── publishTranslations()   ← i18n/ → lang/vendor/{slug}/
  │
  ├── [RegistersHooks trait]
  │   ├── dispatchMiddlewareHook() ← if ($this instanceof HasMiddleware)
  │   ├── dispatchRoutesHook()     ← if ($this instanceof HasRoutes)
  │   ├── dispatchObserversHook()  ← if ($this instanceof HasObservers)
  │   ├── dispatchPoliciesHook()   ← if ($this instanceof HasPolicies)
  │   ├── dispatchHealthChecksHook()← if ($this instanceof HasHealthChecks)
  │   ├── dispatchMacrosHook()     ← if ($this instanceof HasMacros)
  │   ├── dispatchScheduledTasksHook()← if ($this instanceof HasScheduledTasks) && runningInConsole
  │   └── dispatchTerminatableHook()← if ($this instanceof Terminatable)
  │
  └── fireEvent(BOOTED)           ← ManagesLifecycle
```

## Detailed Component Design

### 1. Attributes

#### `#[Module]` Attribute

```php
namespace Pixielity\ServiceProvider\Attributes;

#[Attribute(Attribute::TARGET_CLASS)]
final readonly class Module
{
    public function __construct(
        public string $name,                    // e.g. 'Tenancy'
        public string $namespace,               // e.g. 'Pixielity\\Tenancy'
        public int $priority = 100,             // loading priority (1-999)
        public string $assetVersion = '1.0.0',  // for cache busting
        public array $dependencies = [],        // required module names
        public ?string $path = null,            // explicit module path (auto-detected if null)
        public ?string $viewNamespace = null,   // custom view namespace (defaults to lowercase name)
        public ?string $translationNamespace = null, // custom translation namespace
    ) {}
}
```

Covers: Requirement 1

#### `#[LoadsResources]` Attribute

```php
namespace Pixielity\ServiceProvider\Attributes;

#[Attribute(Attribute::TARGET_CLASS)]
final readonly class LoadsResources
{
    public function __construct(
        public bool $migrations = true,
        public bool $routes = true,
        public bool $views = true,
        public bool $translations = true,
        public bool $config = true,
        public bool $commands = true,
        public bool $seeders = true,
        public bool $publishables = true,
        public bool $middleware = true,
        public bool $observers = true,
        public bool $policies = true,
        public bool $healthChecks = true,
        public bool $listeners = true,
        public bool $macros = true,
        public bool $scheduledTasks = true,
    ) {}

    public function loadsAll(): bool { /* check all true */ }
    public function loadsNone(): bool { /* check all false */ }
}
```

Covers: Requirement 2

### 2. Concern Traits

#### `ReadsAttributes` Trait

Responsible for reading `#[Module]` and `#[LoadsResources]` from cached
attributes.

```php
namespace Pixielity\ServiceProvider\Concerns;

use Koriym\Attributes\Attributes;
use Pixielity\ServiceProvider\Attributes\Module;
use Pixielity\ServiceProvider\Attributes\LoadsResources;

trait ReadsAttributes
{
    private ?Module $moduleAttribute = null;
    private ?LoadsResources $resourcesAttribute = null;
    private bool $attributesResolved = false;

    // Module state derived from attributes
    protected string $moduleName;
    protected string $moduleNamespace;
    protected ?string $modulePath = null;

    /**
     * Resolve all attributes from cached collector.
     * Called once during register, cached for boot.
     */
    protected function resolveAttributes(): void
    {
        if ($this->attributesResolved) {
            return;
        }
        $this->attributesResolved = true;

        $classAttrs = Attributes::forClass(static::class);

        // Resolve #[Module] — required
        foreach ($classAttrs as $attr) {
            if ($attr instanceof Module) {
                $this->moduleAttribute = $attr;
            }
            if ($attr instanceof LoadsResources) {
                $this->resourcesAttribute = $attr;
            }
        }

        if ($this->moduleAttribute === null) {
            throw new \RuntimeException(
                "Missing #[Module] attribute on " . static::class .
                ". Add #[Module(name: 'YourModule', namespace: 'Your\\Namespace')] to the class."
            );
        }

        // Populate module properties from attribute
        $this->moduleName = $this->moduleAttribute->name;
        $this->moduleNamespace = $this->moduleAttribute->namespace;

        if ($this->moduleAttribute->path !== null) {
            $this->modulePath = $this->moduleAttribute->path;
        } else {
            $this->detectModulePath();
        }
    }

    protected function getModuleAttribute(): Module
    {
        $this->resolveAttributes();
        return $this->moduleAttribute;
    }

    protected function getResourcesConfig(): LoadsResources
    {
        $this->resolveAttributes();
        // Default: load everything if no attribute
        return $this->resourcesAttribute ?? new LoadsResources();
    }

    protected function shouldLoad(string $resource): bool
    {
        return $this->getResourcesConfig()->{$resource};
    }

    // Module accessors
    public function getModuleName(): string { $this->resolveAttributes(); return $this->moduleName; }
    public function getModuleNamespace(): string { $this->resolveAttributes(); return $this->moduleNamespace; }
    public function getModulePath(): string { $this->resolveAttributes(); return $this->modulePath ?? ''; }
    public function getPriority(): int { return $this->getModuleAttribute()->priority; }

    protected function getModuleSlug(): string
    {
        return strtolower($this->getModuleName());
    }

    protected function getModuleSourcePath(): string
    {
        $modulePath = $this->getModulePath();
        $srcPath = $modulePath . '/src';
        return is_dir($srcPath) ? $srcPath : $modulePath;
    }

    /**
     * Auto-detect module path from provider file location.
     * Provider at: {module}/src/Providers/XServiceProvider.php
     * Module root: {module}/
     */
    protected function detectModulePath(): void
    {
        if ($this->modulePath !== null) {
            return;
        }

        $fileName = (new \ReflectionClass(static::class))->getFileName();
        if ($fileName === false) {
            return;
        }

        $dir = dirname($fileName);

        if (basename($dir) === 'Providers') {
            $parent = dirname($dir);
            $this->modulePath = basename($parent) === 'src'
                ? (string) realpath(dirname($parent))
                : (string) realpath($parent);
        } else {
            $this->modulePath = (string) realpath($dir . '/../..');
        }
    }
}
```

Covers: Requirements 1, 2, 3, 5

Note: `detectModulePath()` is the ONE place where reflection is used — only for
file path detection (not attribute reading). This is a boot-time operation, not
a hot path. The `ReflectionClass::getFileName()` call is unavoidable for path
auto-detection.

#### `LoadsResources` Trait

Consolidates HasResourceLoading + HasRoutes. Loads migrations, config, views,
translations, routes.

```php
namespace Pixielity\ServiceProvider\Concerns;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Pixielity\ServiceProvider\ModuleConstants;

trait LoadsResources
{
    /**
     * Load all enabled resources based on #[LoadsResources] attribute.
     */
    protected function loadResources(): void
    {
        if ($this->shouldLoad('migrations')) {
            $this->loadModuleMigrations();
        }
        if ($this->shouldLoad('config')) {
            $this->loadModuleConfig();
        }
        if ($this->shouldLoad('views')) {
            $this->loadModuleViews();
        }
        if ($this->shouldLoad('translations')) {
            $this->loadModuleTranslations();
        }
        if ($this->shouldLoad('routes')) {
            $this->loadModuleRoutes();
        }
    }

    protected function loadModuleMigrations(): void
    {
        $path = $this->getModuleSourcePath() . '/' . ModuleConstants::DIR_MIGRATIONS;
        if (is_dir($path)) {
            $this->loadMigrationsFrom($path);
            $this->debugLog('Loaded migrations', ['path' => $path]);
        }
    }

    protected function loadModuleConfig(): void
    {
        $configPath = $this->getModulePath() . '/' . ModuleConstants::DIR_CONFIG . '/' . ModuleConstants::FILE_CONFIG;
        if (File::exists($configPath)) {
            $this->mergeConfigFrom($configPath, $this->getModuleSlug() . '.config');
        }
    }

    protected function loadModuleViews(): void
    {
        $viewsPath = $this->getModuleSourcePath() . '/' . ModuleConstants::DIR_VIEWS;
        if (!is_dir($viewsPath)) {
            return;
        }

        $namespace = $this->getModuleAttribute()->viewNamespace ?? $this->getModuleSlug();

        // Register vendor overrides
        $vendorPath = $viewsPath . '/' . ModuleConstants::DIR_VENDOR;
        if (is_dir($vendorPath)) {
            foreach (array_filter(scandir($vendorPath) ?: [], fn($d) => $d !== '.' && $d !== '..' && is_dir("$vendorPath/$d")) as $pkg) {
                $this->loadViewsFrom("$vendorPath/$pkg", $pkg);
            }
        }

        $this->loadViewsFrom($viewsPath, $namespace);
        $this->debugLog('Loaded views', ['namespace' => $namespace]);
    }

    protected function loadModuleTranslations(): void
    {
        $langPath = $this->getModuleSourcePath() . '/' . ModuleConstants::DIR_I18N;
        if (!is_dir($langPath)) {
            return;
        }

        $namespace = $this->getModuleAttribute()->translationNamespace ?? $this->getModuleSlug();

        // Register vendor overrides
        $vendorPath = $langPath . '/' . ModuleConstants::DIR_VENDOR;
        if (is_dir($vendorPath)) {
            foreach (array_filter(scandir($vendorPath) ?: [], fn($d) => $d !== '.' && $d !== '..' && is_dir("$vendorPath/$d")) as $pkg) {
                $pkgPath = "$vendorPath/$pkg";
                $this->loadTranslationsFrom($pkgPath, $pkg);
                // Re-register after boot to ensure override precedence
                $this->app->booted(fn() => $this->app->make('translator')->addNamespace($pkg, $pkgPath));
            }
        }

        $this->loadTranslationsFrom($langPath, $namespace);
        $this->debugLog('Loaded translations', ['namespace' => $namespace]);
    }

    protected function loadModuleRoutes(): void
    {
        $sourcePath = $this->getModuleSourcePath();
        $routesDir = $sourcePath . '/' . ModuleConstants::DIR_ROUTES;

        $apiPath = $routesDir . '/' . ModuleConstants::FILE_ROUTES_API;
        if (File::exists($apiPath)) {
            Route::middleware('api')->group($apiPath);
        }

        $webPath = $routesDir . '/' . ModuleConstants::FILE_ROUTES_WEB;
        if (File::exists($webPath)) {
            $this->loadRoutesFrom($webPath);
        }

        $channelsPath = $routesDir . '/' . ModuleConstants::FILE_ROUTES_CHANNELS;
        if (File::exists($channelsPath)) {
            $this->loadRoutesFrom($channelsPath);
        }
    }
}
```

Covers: Requirements 9, 13

#### `DiscoversResources` Trait

Consolidates HasResourceDiscovery. Uses Discovery facade exclusively.

```php
namespace Pixielity\ServiceProvider\Concerns;

use Pixielity\Discovery\Facades\Discovery;
use Pixielity\ServiceProvider\ModuleConstants;
use Symfony\Component\Console\Attribute\AsCommand;

trait DiscoversResources
{
    protected function discoverResources(): void
    {
        if ($this->shouldLoad('commands')) {
            $this->discoverAndRegisterCommands();
        }
        if ($this->shouldLoad('middleware')) {
            $this->discoverAndRegisterMiddleware();
        }
        if ($this->shouldLoad('listeners')) {
            $this->discoverAndRegisterListeners();
        }
        if ($this->shouldLoad('seeders')) {
            $this->registerSeeder();
        }
        // Controllers discovered via routes — handled by Discovery in HasRoutes-like logic
        if ($this->shouldLoad('routes')) {
            $this->discoverAndRegisterControllers();
        }
    }

    protected function discoverAndRegisterCommands(): void
    {
        $commandsPath = $this->getModuleSourcePath() . '/' . ModuleConstants::DIR_CONSOLE . '/' . ModuleConstants::DIR_COMMANDS;
        if (!is_dir($commandsPath)) {
            return;
        }

        $commands = Discovery::attribute(AsCommand::class)
            ->directories($commandsPath)
            ->instantiable()
            ->cached("commands.{$this->getModuleSlug()}")
            ->get()
            ->keys()
            ->values()
            ->all();

        if ($commands !== []) {
            $this->commands($commands);
            $this->debugLog('Registered commands', ['count' => count($commands)]);
        }
    }

    protected function discoverAndRegisterControllers(): void
    {
        // Controllers with #[AsController] are registered via Discovery
        // The RouteRegistrar handles the actual route registration
        if (!class_exists(\Pixielity\Routing\Attributes\AsController::class)) {
            return;
        }

        $registrar = $this->app->make(\Pixielity\Routing\RouteRegistrar::class);

        Discovery::attribute(\Pixielity\Routing\Attributes\AsController::class)
            ->cached("controllers.{$this->getModuleSlug()}")
            ->get()
            ->keys()
            ->filter(fn(string $c) => class_exists($c))
            ->each(fn(string $c) => $registrar->registerController($c));
    }

    protected function discoverAndRegisterMiddleware(): void
    {
        if (!class_exists(\Pixielity\Routing\Attributes\AsMiddleware::class)) {
            return;
        }

        $router = $this->app['router'];

        Discovery::attribute(\Pixielity\Routing\Attributes\AsMiddleware::class)
            ->cached("middleware.{$this->getModuleSlug()}")
            ->get()
            ->each(function (array $metadata, string $class) use ($router) {
                $attr = $metadata['attribute'] ?? null;
                if (!$attr instanceof \Pixielity\Routing\Attributes\AsMiddleware || !$attr->enabled) {
                    return;
                }
                $router->aliasMiddleware($attr->alias, $class);
                foreach ($attr->groups as $group) {
                    $router->pushMiddlewareToGroup($group, $class);
                }
            });
    }

    protected function discoverAndRegisterListeners(): void
    {
        $listenersPath = $this->getModuleSourcePath() . '/' . ModuleConstants::DIR_LISTENERS;
        if (!is_dir($listenersPath)) {
            return;
        }

        Discovery::directories($listenersPath)
            ->instantiable()
            ->cached("listeners.{$this->getModuleSlug()}")
            ->get();
        // Laravel auto-discovers events from listener handle methods
    }

    protected function registerSeeder(): void
    {
        $seederClass = $this->getModuleNamespace() . '\\Seeders\\' . $this->getModuleName() . 'DatabaseSeeder';
        if (class_exists($seederClass)) {
            $this->app->booted(function () use ($seederClass) {
                $seeders = config('app.module_seeders', []);
                $seeders[] = $seederClass;
                config()->set('app.module_seeders', $seeders);
            });
        }
    }
}
```

Covers: Requirements 4, 6

#### `PublishesResources` Trait

Consolidates HasPublishing.

```php
namespace Pixielity\ServiceProvider\Concerns;

use Pixielity\ServiceProvider\ModuleConstants;

trait PublishesResources
{
    protected function registerPublishables(): void
    {
        if (!$this->shouldLoad('publishables')) {
            return;
        }

        $this->publishModuleAssets();
        $this->publishModuleConfig();
        $this->publishModuleViews();
        $this->publishModuleTranslations();
    }

    protected function publishModuleAssets(): void
    {
        $path = $this->getModulePath() . '/' . ModuleConstants::DIR_RESOURCES;
        if (!is_dir($path)) { return; }

        $slug = $this->getModuleSlug();
        $version = $this->getModuleAttribute()->assetVersion;

        $this->publishes([
            $path => public_path(ModuleConstants::PATH_PREFIX . "/$slug/$version"),
        ], "$slug-" . ModuleConstants::TAG_ASSETS);
    }

    protected function publishModuleConfig(): void
    {
        $configDir = $this->getModulePath() . '/' . ModuleConstants::DIR_CONFIG;
        if (!is_dir($configDir)) { return; }

        $slug = $this->getModuleSlug();
        $configs = glob($configDir . '/*.php') ?: [];

        foreach ($configs as $config) {
            $this->publishes([
                $config => config_path(basename($config)),
            ], "$slug-" . ModuleConstants::TAG_CONFIG);
        }
    }

    protected function publishModuleViews(): void
    {
        $viewsPath = $this->getModuleSourcePath() . '/' . ModuleConstants::DIR_VIEWS;
        if (!is_dir($viewsPath)) { return; }

        $slug = $this->getModuleSlug();
        $this->publishes([
            $viewsPath => resource_path("views/vendor/$slug"),
        ], "$slug-" . ModuleConstants::TAG_VIEWS);
    }

    protected function publishModuleTranslations(): void
    {
        $langPath = $this->getModuleSourcePath() . '/' . ModuleConstants::DIR_I18N;
        if (!is_dir($langPath)) { return; }

        $slug = $this->getModuleSlug();
        $this->publishes([
            $langPath => $this->app->langPath("vendor/$slug"),
        ], "$slug-" . ModuleConstants::TAG_LANG);
    }
}
```

Covers: Requirement 10

#### `ManagesLifecycle` Trait

Consolidates HasModuleLifecycle + HasDebugging.

```php
namespace Pixielity\ServiceProvider\Concerns;

use Pixielity\ServiceProvider\Contracts\Terminatable;
use Pixielity\ServiceProvider\Enums\ModuleLifecycleEvent;

trait ManagesLifecycle
{
    protected bool $debug = false;
    private bool $debugMode = false;
    private bool $debugModeResolved = false;

    protected function fireEvent(ModuleLifecycleEvent $event): void
    {
        event($event->value, [
            'module' => $this->moduleName ?? 'unknown',
            'namespace' => $this->moduleNamespace ?? '',
            'path' => $this->modulePath ?? null,
        ]);
    }

    protected function registerTerminatingCallback(): void
    {
        if ($this instanceof Terminatable) {
            $this->app->terminating(function () {
                try {
                    $this->terminating();
                } catch (\Throwable $e) {
                    logger()->error("Module termination failed", [
                        'module' => $this->moduleName ?? 'unknown',
                        'error' => $e->getMessage(),
                    ]);
                }
            });
        }
    }

    protected function debugLog(string $message, array $context = []): void
    {
        if (!$this->debugModeResolved) {
            $this->debugMode = (bool) config('app.debug', false);
            $this->debugModeResolved = true;
        }

        if ($this->debug || $this->debugMode) {
            logger()->debug("[Module: {$this->moduleName}] $message", $context);
        }
    }
}
```

Covers: Requirements 8, 16

#### `RegistersHooks` Trait

Consolidates all hook interface dispatch into one trait.

```php
namespace Pixielity\ServiceProvider\Concerns;

use Illuminate\Console\Scheduling\Schedule;
use Pixielity\ServiceProvider\Contracts\HasBindings;
use Pixielity\ServiceProvider\Contracts\HasHealthChecks;
use Pixielity\ServiceProvider\Contracts\HasMacros;
use Pixielity\ServiceProvider\Contracts\HasMiddleware;
use Pixielity\ServiceProvider\Contracts\HasObservers;
use Pixielity\ServiceProvider\Contracts\HasPolicies;
use Pixielity\ServiceProvider\Contracts\HasRoutes;
use Pixielity\ServiceProvider\Contracts\HasScheduledTasks;
use Pixielity\ServiceProvider\Contracts\Terminatable;
use Spatie\Health\Checks\Check;
use Spatie\Health\Facades\Health;

trait RegistersHooks
{
    /**
     * Dispatch all boot-phase hooks based on implemented interfaces.
     * Uses instanceof checks — zero reflection.
     */
    protected function dispatchBootHooks(): void
    {
        if ($this instanceof HasMiddleware) {
            $this->middleware($this->app['router']);
        }

        if ($this instanceof HasRoutes) {
            $this->routes($this->app['router']);
        }

        if ($this instanceof HasObservers) {
            $this->observers();
        }

        if ($this instanceof HasPolicies) {
            $this->policies();
        }

        if ($this instanceof HasHealthChecks) {
            $checks = $this->healthChecks();
            if (is_array($checks) && $checks !== []) {
                Health::checks($checks);
            }
        }

        if ($this instanceof HasMacros) {
            $this->macros();
        }

        if ($this instanceof HasScheduledTasks && $this->app->runningInConsole()) {
            $this->app->booted(fn() => $this->scheduledTasks($this->app->make(Schedule::class)));
        }

        if ($this instanceof Terminatable) {
            $this->registerTerminatingCallback();
        }
    }

    /**
     * Dispatch register-phase hooks.
     */
    protected function dispatchRegisterHooks(): void
    {
        if ($this instanceof HasBindings) {
            $this->bindings();
        }
    }
}
```

Covers: Requirement 7

#### `SupportsDeferredLoading` Trait

```php
namespace Pixielity\ServiceProvider\Concerns;

trait SupportsDeferredLoading
{
    protected bool $defer = false;

    public function provides(): array
    {
        return $this->defer ? $this->getProvidedServices() : [];
    }

    protected function getProvidedServices(): array
    {
        return [];
    }
}
```

Covers: Requirement 15

#### `ProvidesServices` Trait (Composition)

```php
namespace Pixielity\ServiceProvider\Concerns;

use Pixielity\ServiceProvider\Enums\ModuleLifecycleEvent;

trait ProvidesServices
{
    use ReadsAttributes;
    use LoadsResources;
    use DiscoversResources;
    use PublishesResources;
    use ManagesLifecycle;
    use RegistersHooks;
    use SupportsDeferredLoading;

    /**
     * Execute the full boot sequence.
     */
    protected function bootApplication(): void
    {
        $this->resolveAttributes();
        $this->fireEvent(ModuleLifecycleEvent::BOOTING);

        $this->loadResources();
        $this->discoverResources();
        $this->registerPublishables();
        $this->dispatchBootHooks();

        $this->fireEvent(ModuleLifecycleEvent::BOOTED);
    }

    /**
     * Execute the full register sequence.
     */
    protected function registerApplication(): void
    {
        $this->resolveAttributes();
        $this->fireEvent(ModuleLifecycleEvent::REGISTERING);

        $this->dispatchRegisterHooks();

        $this->fireEvent(ModuleLifecycleEvent::REGISTERED);
    }

    /**
     * Initialize the service provider (called from constructor).
     */
    protected function initializeServiceProvider(): void
    {
        // Attributes are lazily resolved on first access
    }
}
```

Covers: Requirements 6, 11

### 3. Base ServiceProvider Class

```php
namespace Pixielity\ServiceProvider\Providers;

use Illuminate\Support\ServiceProvider as BaseServiceProvider;
use Pixielity\ServiceProvider\Concerns\ProvidesServices;
use Pixielity\ServiceProvider\Contracts\ServiceProviderInterface;

abstract class ServiceProvider extends BaseServiceProvider implements ServiceProviderInterface
{
    use ProvidesServices;

    public function boot(): void
    {
        $this->bootApplication();
    }

    public function register(): void
    {
        $this->registerApplication();
    }
}
```

Covers: Requirement 12

### 4. ModuleConstants Interface

```php
namespace Pixielity\ServiceProvider;

interface ModuleConstants
{
    // Directory names
    public const DIR_ROUTES = 'routes';
    public const DIR_VIEWS = 'views';
    public const DIR_I18N = 'i18n';
    public const DIR_MIGRATIONS = 'Migrations';
    public const DIR_SEEDERS = 'Seeders';
    public const DIR_COMMANDS = 'Commands';
    public const DIR_CONSOLE = 'Console';
    public const DIR_LISTENERS = 'Listeners';
    public const DIR_CONFIG = 'config';
    public const DIR_RESOURCES = 'resources';
    public const DIR_VENDOR = 'vendor';

    // File names
    public const FILE_ROUTES_API = 'api.php';
    public const FILE_ROUTES_WEB = 'web.php';
    public const FILE_ROUTES_CHANNELS = 'channels.php';
    public const FILE_CONFIG = 'config.php';

    // Publishing tags
    public const TAG_ASSETS = 'assets';
    public const TAG_CONFIG = 'config';
    public const TAG_VIEWS = 'views';
    public const TAG_LANG = 'lang';

    // Path prefix
    public const PATH_PREFIX = 'pixielity';
}
```

Covers: Requirement 14

### 5. Contracts (Hook Interfaces)

All contracts are kept from the current package with minimal changes:

```php
// Pixielity\ServiceProvider\Contracts\ServiceProviderInterface
interface ServiceProviderInterface
{
    public function boot(): void;
    public function register(): void;
}

// Pixielity\ServiceProvider\Contracts\HasBindings
interface HasBindings
{
    public function bindings(): void;
}

// Pixielity\ServiceProvider\Contracts\HasMiddleware
interface HasMiddleware
{
    public function middleware(\Illuminate\Routing\Router $router): void;
}

// Pixielity\ServiceProvider\Contracts\HasRoutes
interface HasRoutes
{
    public function routes(\Illuminate\Routing\Router $router): void;
}

// Pixielity\ServiceProvider\Contracts\HasObservers
interface HasObservers
{
    public function observers(): void;
}

// Pixielity\ServiceProvider\Contracts\HasPolicies
interface HasPolicies
{
    public function policies(): void;
}

// Pixielity\ServiceProvider\Contracts\HasHealthChecks
interface HasHealthChecks
{
    /** @return array<\Spatie\Health\Checks\Check> */
    public function healthChecks(): array;
}

// Pixielity\ServiceProvider\Contracts\HasMacros
interface HasMacros
{
    public function macros(): void;
}

// Pixielity\ServiceProvider\Contracts\HasScheduledTasks
interface HasScheduledTasks
{
    public function scheduledTasks(\Illuminate\Console\Scheduling\Schedule $schedule): void;
}

// Pixielity\ServiceProvider\Contracts\Terminatable
interface Terminatable
{
    public function terminating(): void;
}
```

Covers: Requirement 7

### 6. Enums

```php
namespace Pixielity\ServiceProvider\Enums;

use Pixielity\Enum\Attributes\Description;
use Pixielity\Enum\Attributes\Label;
use Pixielity\Enum\Enum;

enum ModuleLifecycleEvent: string
{
    use Enum;

    #[Label('Registering')]
    #[Description('Fired at the start of register()')]
    case REGISTERING = 'module.registering';

    #[Label('Registered')]
    #[Description('Fired at the end of register()')]
    case REGISTERED = 'module.registered';

    #[Label('Booting')]
    #[Description('Fired at the start of boot()')]
    case BOOTING = 'module.booting';

    #[Label('Booted')]
    #[Description('Fired at the end of boot()')]
    case BOOTED = 'module.booted';
}
```

Covers: Requirement 8

## File Structure

```
packages/service-provider/
├── composer.json
├── src/
│   ├── Attributes/
│   │   ├── Module.php                    ← #[Module] attribute
│   │   └── LoadsResources.php            ← #[LoadsResources] attribute
│   ├── Concerns/
│   │   ├── ReadsAttributes.php           ← reads #[Module] + #[LoadsResources] from cache
│   │   ├── LoadsResources.php            ← migrations, config, views, translations, routes
│   │   ├── DiscoversResources.php        ← commands, controllers, middleware, listeners, seeders
│   │   ├── PublishesResources.php         ← assets, config, views, translations publishing
│   │   ├── ManagesLifecycle.php           ← lifecycle events + debug logging
│   │   ├── RegistersHooks.php            ← interface-based hook dispatch
│   │   ├── SupportsDeferredLoading.php   ← deferred provider support
│   │   └── ProvidesServices.php          ← composition trait (bundles all 7)
│   ├── Contracts/
│   │   ├── ServiceProviderInterface.php
│   │   ├── HasBindings.php
│   │   ├── HasMiddleware.php
│   │   ├── HasRoutes.php
│   │   ├── HasObservers.php
│   │   ├── HasPolicies.php
│   │   ├── HasHealthChecks.php
│   │   ├── HasMacros.php
│   │   ├── HasScheduledTasks.php
│   │   └── Terminatable.php
│   ├── Enums/
│   │   └── ModuleLifecycleEvent.php
│   ├── ModuleConstants.php               ← interface with all constants
│   └── Providers/
│       └── ServiceProvider.php           ← abstract base class
```

## Composer Dependencies

```json
{
  "name": "pixielity/laravel-service-provider",
  "description": "Attribute-based modular service provider for Laravel 13",
  "require": {
    "php": "^8.5",
    "illuminate/support": "^13.0",
    "illuminate/routing": "^13.0",
    "illuminate/console": "^13.0",
    "koriym/attributes": "^1.0",
    "pixielity/laravel-discovery": "^1.0",
    "pixielity/laravel-enum": "^1.0"
  },
  "suggest": {
    "spatie/laravel-health": "Required for health check registration",
    "pixielity/laravel-routing": "Required for controller/middleware discovery via #[AsController]/#[AsMiddleware]"
  },
  "autoload": {
    "psr-4": {
      "Pixielity\\ServiceProvider\\": "src/"
    }
  }
}
```

## Usage Example

### Minimal Service Provider

```php
use Pixielity\ServiceProvider\Attributes\Module;
use Pixielity\ServiceProvider\Providers\ServiceProvider;

#[Module(name: 'Tenancy', namespace: 'Pixielity\\Tenancy')]
class TenancyServiceProvider extends ServiceProvider
{
    // That's it! All resources auto-loaded from conventional paths.
}
```

### Selective Resource Loading

```php
use Pixielity\ServiceProvider\Attributes\Module;
use Pixielity\ServiceProvider\Attributes\LoadsResources;
use Pixielity\ServiceProvider\Providers\ServiceProvider;

#[Module(name: 'Api', namespace: 'Pixielity\\Api')]
#[LoadsResources(views: false, translations: false)]
class ApiServiceProvider extends ServiceProvider
{
    // Loads everything except views and translations
}
```

### Full-Featured with Hooks

```php
use Pixielity\ServiceProvider\Attributes\Module;
use Pixielity\ServiceProvider\Attributes\LoadsResources;
use Pixielity\ServiceProvider\Contracts\HasBindings;
use Pixielity\ServiceProvider\Contracts\HasMiddleware;
use Pixielity\ServiceProvider\Contracts\HasScheduledTasks;
use Pixielity\ServiceProvider\Providers\ServiceProvider;

#[Module(name: 'Tenancy', namespace: 'Pixielity\\Tenancy', priority: 10)]
#[LoadsResources(healthChecks: true)]
class TenancyServiceProvider extends ServiceProvider implements HasBindings, HasMiddleware, HasScheduledTasks
{
    public function bindings(): void
    {
        $this->app->singleton(TenancyManagerInterface::class, TenancyManager::class);
    }

    public function middleware(Router $router): void
    {
        $router->aliasMiddleware('tenant', IdentifyTenant::class);
    }

    public function scheduledTasks(Schedule $schedule): void
    {
        $schedule->command('tenancy:cleanup')->daily();
    }
}
```

### Using ProvidesServices Trait (Different Base Class)

```php
use Illuminate\Support\ServiceProvider as BaseServiceProvider;
use Pixielity\ServiceProvider\Attributes\Module;
use Pixielity\ServiceProvider\Concerns\ProvidesServices;

#[Module(name: 'Custom', namespace: 'Pixielity\\Custom')]
class CustomServiceProvider extends BaseServiceProvider
{
    use ProvidesServices;

    public function boot(): void
    {
        $this->bootApplication();
    }

    public function register(): void
    {
        $this->registerApplication();
    }
}
```

## Requirements Traceability

| Requirement                       | Design Component                                                |
| --------------------------------- | --------------------------------------------------------------- |
| R1: Module Attribute              | `#[Module]` attribute + `ReadsAttributes` trait                 |
| R2: Resource Configuration        | `#[LoadsResources]` attribute + `ReadsAttributes.shouldLoad()`  |
| R3: Zero Reflection               | `Attributes::forClass()` in `ReadsAttributes`                   |
| R4: Discovery-Based Registration  | `DiscoversResources` trait + Discovery facade                   |
| R5: Octane-Safe                   | Instance properties only, no static mutable state               |
| R6: Consolidated Traits           | 7 traits in `ProvidesServices`                                  |
| R7: Hook Interface Dispatch       | `RegistersHooks` trait + instanceof checks                      |
| R8: Lifecycle Events              | `ManagesLifecycle` trait + `ModuleLifecycleEvent` enum          |
| R9: Resource Loading              | `LoadsResources` trait                                          |
| R10: Resource Publishing          | `PublishesResources` trait                                      |
| R11: ProvidesServices Composition | `ProvidesServices` trait                                        |
| R12: Base ServiceProvider         | `Providers\ServiceProvider` abstract class                      |
| R13: Vendor Overrides             | `LoadsResources.loadModuleViews()` + `loadModuleTranslations()` |
| R14: Module Constants             | `ModuleConstants` interface                                     |
| R15: Deferred Loading             | `SupportsDeferredLoading` trait                                 |
| R16: Debug Logging                | `ManagesLifecycle.debugLog()`                                   |
