# Changelog

All notable changes to this project will be documented in this file.

## [2.7.0] - 2026-05-04

### Added

- **Stringable class** — New fluent string wrapper for chainable string operations.
  Provides a fluent interface for all Str methods, similar to Laravel's Stringable
- **Dual-mode str() helper** — The `str()` function now supports two usage patterns:
  - `str().camel('hello-world')` — Static usage, returns the Str class
  - `str('hello-world').camel()` — Fluent usage, returns a Stringable instance for chaining
- **Type declarations** — Updated `@types/index.d.ts` with function overloads for both patterns

### Changed

- **str() function signature** — Now uses TypeScript function overloads to support both
  static and fluent usage patterns with full type safety

## [2.6.4] - 2026-05-04

### Added

- **str() global helper** — Added `str()` function to global helpers that provides
  access to the `Str` utility class. After calling `bootGlobals()`, you can use
  `str().camel()`, `str().snake()`, `str().kebab()`, and all other Str methods
  globally without imports
- **Type declarations** — Added `str()` function signature to `@types/index.d.ts`
  for full TypeScript support

### Changed

- **Global helpers** — Updated `bootGlobals()` to register the `str()` function
  in the GlobalRegistry
- **Exports** — Added `str` to the exported functions from `src/globals/index.ts`

## [2.6.3] - 2026-05-02

### Fixed

- **Facade proxy** — `Facade.make()` proxy now returns graceful defaults for
  introspection properties (`toString`, `valueOf`, `Symbol.toPrimitive`,
  `Symbol.toStringTag`, `$$typeof`, `constructor`, etc.) when the application
  hasn't been set yet. Previously, any property access on a Facade proxy before
  `Facade.setApplication(app)` would throw. This caused `Uncaught Error` noise
  in development when React Fast Refresh inspected module exports at evaluation
  time (before bootstrap). The app still boots correctly — the errors were
  cosmetic but confusing.

## [2.6.2] - 2026-04-30

### Fixed

- **ESLint config** — switched from `viteConfig` to `baseConfig` in
  `eslint.config.ts`. The `viteConfig` preset includes `eslint-plugin-react`
  which is incompatible with ESLint 10 (`context.getFilename()` removed).
  Since `ts-support` is a pure TypeScript utility library with no React,
  the base config is the correct choice.
- **ESLint version** — pinned to `^9.28.0` until `eslint-plugin-react`
  adds ESLint 10 support

## [2.6.1] - 2026-04-30

### Fixed

- **@types import paths** — changed `../src/` relative imports to
  `@stackra/ts-support` package imports in `@types/index.d.ts`. Fixes type
  resolution when consumed as an npm package (the `../src/` paths don't exist
  in published packages)
- **engines** — relaxed `node` requirement from `>=22` to `>=20` for broader
  compatibility

## [2.6.0] - 2026-04-29

### Added

- **Env class** — Laravel-style environment variable accessor with typed getters
  (`string`, `boolean`, `number`, `array`), `getOrFail`, environment checks
  (`isProduction`, `isLocal`, `isTesting`), configurable repository
  (`process.env`, `import.meta.env`, or custom)
- **Arr class** — Laravel-style array/object utilities: dot-notation `get`/`set`/
  `has`/`forget`, `only`, `except`, `pluck`, `groupBy`, `keyBy`, `first`, `last`,
  `flatten`, `wrap`, `shuffle`, `sortBy`, `unique`, `chunk`, `combine`
- **Num class** — Number formatting and helpers: `format`, `abbreviate`,
  `forHumans`, `ordinal`, `percentage`, `currency`, `fileSize`, `clamp`,
  `random`, `between`, type checks (`isNumber`, `isInteger`, `isEven`, `isOdd`)
- **GlobalRegistry** — Extensible registry for global helper functions. Other
  `@stackra/*` packages can register their own globals via
  `GlobalRegistry.register()`
- **bootGlobals()** — Registers built-in helpers (`env`, `collect`, `collectMap`,
  `collectSet`, `value`, `tap`, `filled`, `blank`, `retry`, `sleep`) on
  `globalThis`
- **Global helper functions** — `env()`, `value()`, `tap()`, `filled()`,
  `blank()`, `retry()`, `sleep()` available as importable functions or globals
- **@types declarations** — TypeScript global type declarations for all helpers.
  Consumers add `"@stackra/ts-support/@types"` to tsconfig `types` array
- **`./@types` export** — New package.json exports entry for the type declarations

## [2.5.9] - 2026-04-28

### Changed

- Standardized configs, scripts, hooks, and CI workflows

## [2.5.7] - 2026-04-24

### Fixed

- 📦 **Exports map fix** — corrected `package.json` exports to match actual tsup
  build output (`import` → `./dist/index.js`, `require` → `./dist/index.cjs`).
  Previously referenced non-existent `index.mjs` for ESM entry point.
- 📝 **tsup.config.ts comment fix** — corrected build output filenames in JSDoc
  to match actual output when `"type": "module"` is set

## [2.5.6] - 2026-04-20

### Changed

- Version bump for npm publish (v2.5.5 was already published)

## [2.5.5] - 2026-04-20

### Changed

- 🏢 Org rename — migrated from `@stackra` → `@stackra` across package name,
  repository URLs, author field, peer dependencies, README, workflows, and
  source file headers
- 🔧 Updated CI and publish workflows
- 📝 Updated steering and product docs

## [2.5.4] - 2026-04-18

### Fixed

- Corrected org name and banner path in README

## [2.5.3] - 2026-04-18

### Fixed

- Root cause: `banner.png` was missing (404) — Slack rejects image blocks with
  invalid URLs, returning HTTP 400
- Generated and committed `banner.png` from `banner.svg`
- Restored `slackapi/slack-github-action@v2` (reverted curl approach)

## [2.5.2] - 2026-04-18

### Fixed

- Use `jq` to build Slack JSON payloads — properly escapes backticks, em dashes,
  and newlines in release notes that caused HTTP 400

## [2.5.1] - 2026-04-18

### Fixed

- Fixed broken quoting in Slack failure notification step

## [2.5.0] - 2026-04-18

### Fixed

- Replaced `slackapi/slack-github-action@v2` with `curl` for Slack notifications
  — eliminates Node 20 deprecation warning and fixes silent webhook failures
  under forced Node 24

## [2.4.0] - 2026-04-18

### Changed

- Upgraded `pnpm/action-setup` v4 → v5 (Node 24 native)
- Disabled `no-explicit-any`, `no-this-alias`, `no-empty-object-type`, and
  `no-control-regex` lint rules — unavoidable in a utility library wrapping
  collect.js generics and facades

## [2.3.0] - 2026-04-18

### Changed

- Upgraded GitHub Actions to Node 24 compatible versions
  - `actions/checkout` v4 → v5
  - `actions/setup-node` v4 → v5
  - `actions/upload-artifact` v4 → v6
  - `actions/download-artifact` v4 → v6
- Added `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` env var for remaining v2 actions

## [2.2.0] - 2026-04-18

### Stable Release

- Production-grade stable release
- All features are now considered stable and production-ready
- API is stabilized — breaking changes will follow semver from this point
  forward

## [2.1.0] - 2026-04-18

### Changed

- Moved interfaces from `src/types/` to dedicated `src/interfaces/` folder
- Synced CI workflows, tsup, vitest, and tsconfig across packages
- Updated package dependencies

## [2.0.0] - 2026-04-05

### Stable Release

- First production-grade stable release
- All features from previous versions are now considered stable and
  production-ready
- API is now stabilized — breaking changes will follow semver from this point
  forward

## [1.2.0] - 2026-04-05

### Refactored

- Centralized all types and interfaces into `src/types/` with `.type.ts`
  convention
- Extracted utility functions into `src/utils/` with `.util.ts` convention
- Moved `MultipleInstanceManager` into `src/managers/` module
- Removed `RegistryCollection` adapter — `BaseRegistry` now uses `MapCollection`
  directly
- Switched all internal imports to `@/*` path aliases
- Removed facade source files (types extracted to `src/types/`)
- Updated root barrel to only export types from `src/types/`

### Fixed

- Added `ES2020` and `DOM` libs to tsconfig for `Map`, `URL`, `Buffer`, and
  `btoa` support
- Added `node` to tsconfig types for Node.js globals
- Fixed strict null checks in `Str.pluralStudly` and `Str.replaceArray`

### Changed

- Migrated ESLint config from JS to TypeScript
- Added `.prettierrc.ts` configuration

## [1.0.0] - 2024-03-31

### Added

- Initial release
- `Str` class with 100+ Laravel-style string manipulation methods
- `Collection` class for array collections (powered by collect.js)
- `MapCollection` class for Map data structures
- `SetCollection` class for Set data structures
- `BaseRegistry` class for building extensible registry patterns
- Full TypeScript support with comprehensive type definitions
