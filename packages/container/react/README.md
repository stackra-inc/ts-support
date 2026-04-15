# @abdokouta/ts-container-react

React bindings for `@abdokouta/ts-container` — provides DI context to React
components via hooks.

## Installation

```bash
pnpm add @abdokouta/ts-container-react
```

## Features

- ⚛️ `ContainerProvider` — React component that provides the DI context
- 🎣 `useInject(token)` — resolve a provider in any component
- ❓ `useOptionalInject(token)` — resolve or get `undefined`
- 🔧 `useContainer()` — access the raw `ContainerResolver`
- 🔗 Works with `ApplicationContext` from `@abdokouta/ts-application`

## Usage

### Wrapping Your App

```tsx
/**
 * |-------------------------------------------------------------------
 * | Wrap your app with ContainerProvider after bootstrapping.
 * |-------------------------------------------------------------------
 */
import { bootstrapApp } from '@abdokouta/ts-application';
import { ContainerProvider } from '@abdokouta/ts-container-react';
import { AppModule } from './app.module';

const app = await bootstrapApp(AppModule);

ReactDOM.createRoot(root).render(
  <ContainerProvider context={app}>
    <App />
  </ContainerProvider>
);
```

### useInject Hook

```tsx
/**
 * |-------------------------------------------------------------------
 * | Resolve any provider by its injection token.
 * |-------------------------------------------------------------------
 */
import { useInject } from '@abdokouta/ts-container-react';

function UserProfile() {
  const userService = useInject(UserService);
  const config = useInject<AppConfig>(APP_CONFIG);

  return <div>{userService.getUser('1').name}</div>;
}
```

### useOptionalInject Hook

```tsx
/**
 * |-------------------------------------------------------------------
 * | Resolve a provider or get undefined if not registered.
 * |-------------------------------------------------------------------
 */
import { useOptionalInject } from '@abdokouta/ts-container-react';

function Analytics() {
  const analytics = useOptionalInject(AnalyticsService);
  analytics?.track('page_view');
  return null;
}
```

## API Reference

| Export                     | Type      | Description                              |
| -------------------------- | --------- | ---------------------------------------- |
| `ContainerProvider`        | Component | Provides DI context to child components  |
| `useInject(token)`         | Hook      | Resolve a provider (throws if not found) |
| `useOptionalInject(token)` | Hook      | Resolve a provider or return `undefined` |
| `useContainer()`           | Hook      | Access the raw `ContainerResolver`       |
| `ContainerContext`         | Context   | React context (for advanced use)         |

### ContainerProviderProps

| Prop       | Type                | Description                         |
| ---------- | ------------------- | ----------------------------------- |
| `context`  | `ContainerResolver` | The bootstrapped ApplicationContext |
| `children` | `ReactNode`         | Child components                    |

## License

MIT
