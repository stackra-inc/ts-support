# @abdokouta/ts-application

## 1.0.0

### Major Features

- 🎉 Initial release of @abdokouta/ts-application
- 🚀 `bootstrapApp()` convenience factory with debug mode and `onReady` callback
- 🏗️ `ApplicationContext.create()` — scans module tree, resolves all providers
- 🔍 `get()` / `getOptional()` / `has()` for provider resolution across all
  modules
- 🎯 `select(module, token)` for module-scoped provider resolution
- 🔄 Full lifecycle support: `onModuleInit()` on bootstrap, `onModuleDestroy()`
  on `close()`
- ⚛️ Implements `ContainerResolver` interface for `<ContainerProvider>`
  compatibility
- 🐛 Auto-exposes context on `window.__APP_CONTEXT__` in development mode
- 📦 Transient provider support with synchronous instantiation after bootstrap
- 🏷️ `IApplicationContext` interface exported for type-safe usage
