<p align="center">
  <img src="https://raw.githubusercontent.com/stackra-co/ts-support/main/.github/assets/banner.svg" alt="@stackra/ts-support" width="100%" />
</p>

<h1 align="center">@stackra/ts-support</h1>

<p align="center">
  <strong>Laravel-style utilities for JavaScript/TypeScript</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@stackra/ts-support"><img src="https://img.shields.io/npm/v/@stackra/ts-support.svg?style=flat-square" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@stackra/ts-support"><img src="https://img.shields.io/npm/dm/@stackra/ts-support.svg?style=flat-square" alt="npm downloads" /></a>
  <a href="https://github.com/stackra-co/ts-support/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@stackra/ts-support.svg?style=flat-square" alt="license" /></a>
  <a href="https://github.com/stackra-co/ts-support"><img src="https://img.shields.io/github/stars/stackra-co/ts-support?style=flat-square" alt="GitHub stars" /></a>
</p>

<p align="center">
  Powerful string manipulation, collection handling, facades, and registry patterns inspired by Laravel
</p>

---

## ✨ Features

- 🎯 **Str Class** - 100+ string manipulation methods matching Laravel's API
- 📦 **Collection** - Array collection with 50+ chainable methods (powered by
  collect.js)
- 🗺️ **MapCollection** - Map data structure with collection methods
- 🎲 **SetCollection** - Set data structure with collection methods
- 🏗️ **BaseRegistry** - Generic registry pattern for building extensible systems
- 🎭 **Facades** - Laravel-style facades for clean service access
- 💪 **TypeScript** - Full type safety with comprehensive type definitions
- 🔗 **Chainable** - Fluent, chainable API for elegant code
- 🚀 **Zero Config** - Works out of the box

## 📦 Installation

```bash
npm install @stackra/ts-support
# or
pnpm add @stackra/ts-support
# or
yarn add @stackra/ts-support
```

## 🚀 Usage

### Str Class

```typescript
import { Str } from '@stackra/ts-support';

// String manipulation
Str.camel('foo_bar'); // 'fooBar'
Str.snake('fooBar'); // 'foo_bar'
Str.kebab('fooBar'); // 'foo-bar'
Str.studly('foo_bar'); // 'FooBar'
Str.title('a nice title'); // 'A Nice Title'

// String inspection
Str.contains('This is my name', 'my'); // true
Str.startsWith('Hello World', 'Hello'); // true
Str.endsWith('Hello World', 'World'); // true
Str.isJson('{"key": "value"}'); // true
Str.isUrl('https://example.com'); // true
Str.isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de'); // true

// String extraction
Str.after('This is my name', 'This is'); // ' my name'
Str.before('This is my name', 'my'); // 'This is '
Str.between('This is my name', 'This', 'name'); // ' is my '

// String modification
Str.limit('The quick brown fox', 10); // 'The quick...'
Str.slug('Laravel 5 Framework', '-'); // 'laravel-5-framework'

// And 80+ more methods!
```

### Collection (Array)

```typescript
import { collect } from '@stackra/ts-support';

// Create a collection
const collection = collect([1, 2, 3, 4, 5]);

// Chainable methods
collection
  .filter((item) => item > 2)
  .map((item) => item * 2)
  .sum(); // 24

// Working with objects
const users = collect([
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 },
  { name: 'Bob', age: 35 },
]);

users.where('age', '>', 25).pluck('name').all();
// ['John', 'Bob']

// Aggregation
collect([1, 2, 3, 4, 5]).sum(); // 15
collect([1, 2, 3, 4, 5]).avg(); // 3
collect([1, 2, 3, 4, 5]).max(); // 5
collect([1, 2, 3, 4, 5]).min(); // 1
```

### Facades

```typescript
import { Facade, createFacade } from '@stackra/ts-support';
import { Container } from '@stackra/ts-container';

// Set the container for facades
Facade.setFacadeContainer(Container.getContainer());

// Create a facade for a service
const Config = createFacade<IConfigService>('ConfigService');

// Use the facade
Config.get('app.name');
Config.set('app.debug', true);
```

### MapCollection

```typescript
import { collectMap } from '@stackra/ts-support';

const map = collectMap({ name: 'John', age: 30 });

map.set('city', 'New York');
map.get('name'); // 'John'
map.has('age'); // true
map.keys(); // ['name', 'age', 'city']
map.values(); // ['John', 30, 'New York']
```

### SetCollection

```typescript
import { collectSet } from '@stackra/ts-support';

const set1 = collectSet([1, 2, 3]);
const set2 = collectSet([2, 3, 4]);

set1.union(set2).all(); // [1, 2, 3, 4]
set1.intersect(set2).all(); // [2, 3]
set1.diff(set2).all(); // [1]
```

### BaseRegistry

```typescript
import { BaseRegistry } from '@stackra/ts-support';

// Create a typed registry
interface Theme {
  name: string;
  colors: Record<string, string>;
}

const themeRegistry = new BaseRegistry<Theme>({
  validateBeforeAdd: (key, theme) => {
    if (!theme.name) {
      return { valid: false, error: 'Theme must have a name' };
    }
    return { valid: true };
  },
  afterAdd: (key, theme) => {
    console.log(`Registered theme: ${theme.name}`);
  },
});

// Register items
themeRegistry.register('dark', { name: 'Dark', colors: { bg: '#000' } });
themeRegistry.register('light', { name: 'Light', colors: { bg: '#fff' } });

// Retrieve items
const theme = themeRegistry.get('dark');
const allThemes = themeRegistry.getAll();
const hasTheme = themeRegistry.has('dark');
```

## 📘 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import {
  Str,
  Collection,
  MapCollection,
  SetCollection,
  BaseRegistry,
} from '@stackra/ts-support';

// Type-safe collections
const numbers: Collection<number> = collect([1, 2, 3]);

// Type-safe maps
const userMap: MapCollection<string, User> = collectMap();

// Type-safe sets
const tags: SetCollection<string> = collectSet(['tag1', 'tag2']);

// Type-safe registries
const registry = new BaseRegistry<MyType>();
```

## 📄 License

MIT

## 🙏 Credits

- Inspired by [Laravel](https://laravel.com)'s support package
- Array collections powered by [collect.js](https://collect.js.org/)
