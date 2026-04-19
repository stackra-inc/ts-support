# Changelog

All notable changes to this project will be documented in this file.

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
