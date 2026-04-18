# Changelog

All notable changes to this project will be documented in this file.

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
