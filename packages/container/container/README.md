# @abdokouta/ts-container

NestJS-style IoC container and dependency injection for TypeScript. Built from
scratch — no Inversify, no heavy runtime.

## Installation

```bash
pnpm add @abdokouta/ts-container
```

## Features

- 💉 `@Injectable()` decorator for marking classes as DI-managed
- 🎯 `@Inject(token)` for explicit token-based injection
- ❓ `@Optional()` for optional dependencies
- 📦 `@Module()` for declaring module metadata (providers, imports, exports)
- 🌐 `@Global()` for global module registration
- 🔧 `DynamicModule` with `forRoot()` / `forFeature()` pattern
- 🏗️ `NestContainer` — the core DI engine
- 🔍 `DependenciesScanner` for module tree walking
- 🔄 `InstanceLoader` for provider instantiation and lifecycle hooks
- 🔗 `forwardRef()` for circular dependency resolution
- 🎭 Provider types: class, value, factory, existing (alias)
- 🔄 Lifecycle hooks: `OnModuleInit`, `OnModuleDestroy`
- 📐 Scope support: Singleton, Transient

## Usage

### Defining Providers

```typescript
/**
 * |-------------------------------------------------------------------
 * | Mark classes with @Injectable() for DI management.
 * |-------------------------------------------------------------------
 */
import { Injectable, Inject, Optional } from '@abdokouta/ts-container';

@Injectable()
class LoggerService {
  info(msg: string) {
    console.log(msg);
  }
}

@Injectable()
class UserService {
  constructor(
    private logger: LoggerService,
    @Inject('API_URL') private apiUrl: string,
    @Optional() private analytics?: AnalyticsService
  ) {}
}
```

### Defining Modules

```typescript
/**
 * |-------------------------------------------------------------------
 * | Use @Module() to group providers and declare dependencies.
 * |-------------------------------------------------------------------
 */
import { Module } from '@abdokouta/ts-container';

@Module({
  providers: [LoggerService, UserService],
  exports: [UserService],
})
class UserModule {}

@Module({
  imports: [UserModule],
  providers: [AppService],
})
class AppModule {}
```

### Dynamic Modules

```typescript
/**
 * |-------------------------------------------------------------------
 * | forRoot() / forFeature() return DynamicModule for configuration.
 * |-------------------------------------------------------------------
 */
import { Module, type DynamicModule } from '@abdokouta/ts-container';

@Module({})
class CacheModule {
  static forRoot(config: CacheConfig): DynamicModule {
    return {
      module: CacheModule,
      global: true,
      providers: [
        { provide: CACHE_CONFIG, useValue: config },
        { provide: CacheManager, useClass: CacheManager },
      ],
      exports: [CacheManager],
    };
  }
}
```

### Provider Types

```typescript
/**
 * |-------------------------------------------------------------------
 * | Four provider types: class, value, factory, existing.
 * |-------------------------------------------------------------------
 */
const providers = [
  // Class provider
  { provide: UserService, useClass: UserService },

  // Value provider
  { provide: 'API_URL', useValue: 'https://api.example.com' },

  // Factory provider
  {
    provide: DbConnection,
    useFactory: (config) => createConnection(config),
    inject: [DB_CONFIG],
  },

  // Existing (alias) provider
  { provide: CACHE_MANAGER, useExisting: CacheManager },
];
```

## API Reference

| Export                | Type      | Description                                  |
| --------------------- | --------- | -------------------------------------------- |
| `@Injectable()`       | Decorator | Mark a class as injectable                   |
| `@Inject(token)`      | Decorator | Inject by token (string, symbol, or class)   |
| `@Optional()`         | Decorator | Mark a dependency as optional                |
| `@Module(metadata)`   | Decorator | Declare module metadata                      |
| `@Global()`           | Decorator | Make a module's exports globally available   |
| `DynamicModule`       | Interface | Return type for `forRoot()` / `forFeature()` |
| `NestContainer`       | Class     | Core DI container engine                     |
| `DependenciesScanner` | Class     | Module tree scanner                          |
| `InstanceLoader`      | Class     | Provider instantiation and lifecycle         |
| `Injector`            | Class     | Dependency resolution engine                 |
| `forwardRef(fn)`      | Utility   | Resolve circular dependencies                |
| `OnModuleInit`        | Interface | Lifecycle hook after instantiation           |
| `OnModuleDestroy`     | Interface | Lifecycle hook before shutdown               |
| `Scope`               | Enum      | `DEFAULT` (singleton), `TRANSIENT`           |

## License

MIT
