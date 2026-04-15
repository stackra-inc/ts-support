# @abdokouta/ts-cache

## 1.0.0

### Major Features

- 🎉 Initial release of @abdokouta/ts-cache
- 🚀 Multiple cache drivers: Memory, Redis (Upstash), Null
- 🏷️ Cache tagging support for Redis
- 📦 Laravel-inspired Repository pattern
- ⚡ Browser-compatible Redis via Upstash HTTP API
- 🎣 React hooks: `useCache` and `useCachedQuery`
- 🔄 Remember pattern for get-or-set caching
- 💉 Dependency injection with @abdokouta/container

### Stores

- **MemoryStore**: In-memory cache with LRU eviction
- **RedisStore**: Redis-backed cache with tagging support
- **NullStore**: No-op cache for testing

### Features

- Repository pattern with high-level API
- Cache tagging (Redis only)
- TTL support
- Increment/decrement operations
- Remember and rememberForever methods
- Pull method (get and delete)
- Multiple store management
- React hooks for components
- TypeScript support with generics
- Comprehensive documentation

### API

- `get(key, default?)` - Retrieve item
- `put(key, value, ttl)` - Store item
- `remember(key, ttl, callback)` - Get or execute callback
- `rememberForever(key, callback)` - Get or execute callback (no expiration)
- `forget(key)` - Remove item
- `flush()` - Clear all items
- `increment(key, value?)` - Increment value
- `decrement(key, value?)` - Decrement value
- `pull(key, default?)` - Get and delete
- `tags(names)` - Begin tagged operation (Redis only)

### Documentation

- Comprehensive README with examples
- JSDoc documentation for all classes and methods
- Laravel comparison table
- Configuration examples
- Best practices guide
