# @abdokouta/ts-container

## 1.0.0

### Major Features

- 🎉 Initial release of @abdokouta/ts-container
- 💉 `@Injectable()` decorator with scope support (Singleton, Transient)
- 🎯 `@Inject(token)` for explicit token-based constructor injection
- ❓ `@Optional()` for optional dependency injection
- 📦 `@Module()` decorator for module metadata declaration
- 🌐 `@Global()` decorator for global module registration
- 🔧 `DynamicModule` interface for `forRoot()` / `forFeature()` pattern
- 🏗️ `NestContainer` — core container managing module registry
- 🔍 `DependenciesScanner` — walks module tree, resolves imports/exports
- 🔄 `InstanceLoader` — creates provider instances, calls lifecycle hooks
- 🔗 `Injector` — resolves constructor dependencies across module boundaries
- 📦 `InstanceWrapper` — tracks provider state (resolved, transient, instance)
- 🔗 `forwardRef()` utility for circular dependency resolution
- 🎭 Four provider types: `ClassProvider`, `ValueProvider`, `FactoryProvider`,
  `ExistingProvider`
- 🔄 Lifecycle hooks: `OnModuleInit`, `OnModuleDestroy`
- 🏷️ Metadata constants exported for library authors
