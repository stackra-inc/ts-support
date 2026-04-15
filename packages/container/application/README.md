# @abdokouta/ts-application

Application bootstrap and module graph resolution for `@abdokouta/ts-container`.

## Installation

```bash
pnpm add @abdokouta/ts-application
```

## Features

- 🚀 `bootstrapApp()` convenience factory for app startup
- 🏗️ `ApplicationContext` — scans module tree, resolves providers, runs
  lifecycle hooks
- 🔍 `get()` / `getOptional()` / `has()` for provider resolution
- 🎯 `select(module, token)` for module-scoped resolution
- 🔄 Lifecycle: `onModuleInit()` on bootstrap, `onModuleDestroy()` on `close()`
- 🐛 Debug mode: exposes context on `window.__APP_CONTEXT__` in development
- ⚛️ Implements `ContainerResolver` — pass directly to `<ContainerProvider>`

## Usage

### Bootstrap with bootstrapApp()

```tsx
/**
 * |-------------------------------------------------------------------
 * | bootstrapApp() handles the full bootstrap sequence.
 * |-------------------------------------------------------------------
 */
import { bootstrapApp } from '@abdokouta/ts-application';
import { ContainerProvider } from '@abdokouta/ts-container-react';
import { AppModule } from './app.module';

const app = await bootstrapApp(AppModule, {
  debug: true,
  onReady: (ctx) => console.log('App ready!'),
});

ReactDOM.createRoot(root).render(
  <ContainerProvider context={app}>
    <App />
  </ContainerProvider>
);
```

### Direct ApplicationContext Usage

```typescript
/**
 * |-------------------------------------------------------------------
 * | ApplicationContext.create() for lower-level control.
 * |-------------------------------------------------------------------
 */
import { ApplicationContext } from '@abdokouta/ts-application';
import { AppModule } from './app.module';

const app = await ApplicationContext.create(AppModule);

const userService = app.get(UserService);
const config = app.get<CacheConfig>(CACHE_CONFIG);
const optional = app.getOptional(SomeService);

await app.close();
```

## API Reference

| Export                              | Type     | Description                                          |
| ----------------------------------- | -------- | ---------------------------------------------------- |
| `bootstrapApp(module, opts?)`       | Function | Bootstrap app with debug and onReady support         |
| `ApplicationContext.create(module)` | Static   | Create and bootstrap a context from root module      |
| `app.get(token)`                    | Method   | Resolve a provider (throws if not found)             |
| `app.getOptional(token)`            | Method   | Resolve a provider or return `undefined`             |
| `app.has(token)`                    | Method   | Check if a provider is registered                    |
| `app.select(module, token)`         | Method   | Resolve from a specific module                       |
| `app.getContainer()`                | Method   | Access the underlying NestContainer                  |
| `app.close()`                       | Method   | Shutdown: calls `onModuleDestroy()` on all providers |

### BootstrapOptions

| Option       | Type            | Default             | Description                        |
| ------------ | --------------- | ------------------- | ---------------------------------- |
| `debug`      | `boolean`       | auto (dev mode)     | Expose context on `window`         |
| `globalName` | `string`        | `'__APP_CONTEXT__'` | Window property name               |
| `onReady`    | `(app) => void` | —                   | Callback after bootstrap completes |

## License

MIT
