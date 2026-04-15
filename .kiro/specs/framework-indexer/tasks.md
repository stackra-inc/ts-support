# Implementation Plan: Framework Indexer Sub-Package

## Overview

Implement the `packages/framework/src/Indexer/` sub-package under namespace
`Pixielity\Indexer`. This is a pure PHP foundation layer — zero Elasticsearch
dependency. All code follows Pixielity conventions: `declare(strict_types=1)`,
comprehensive docblocks, `ATTR_*` constants, `#[Bind]` on interfaces pointing to
search package implementations via string class references.

The implementation proceeds bottom-up: enums → attributes → DTOs → contracts →
exceptions → events → registry → compiler → traits, wiring everything together
at the end.

## Tasks

- [x] 1. Scaffold project structure and package metadata
  - Create `packages/framework/src/Indexer/composer.json` with
    `pixielity/framework-indexer` name, `Pixielity\Indexer\` PSR-4 autoload, PHP
    `^8.5` requirement, and `pixielity/laravel-discovery` dependency
  - Create `packages/framework/src/Indexer/module.json` with module name, alias,
    and version
  - Create directory structure: `src/Attributes/`, `src/Compiler/`,
    `src/Concerns/`, `src/Contracts/`, `src/Data/`, `src/Enums/`, `src/Events/`,
    `src/Exceptions/`, `src/Registry/`
  - Create `tests/Unit/` and `tests/Feature/` directories with `.gitkeep` files
  - _Requirements: All (package structure)_

- [x] 2. Implement enums
  - [x] 2.1 Create `src/Enums/AggregationType.php` — backed string enum with 10
        cases (`TERMS`, `SUM`, `AVG`, `MIN`, `MAX`, `DATE_HISTOGRAM`, `RANGE`,
        `GEO`, `CARDINALITY`, `PERCENTILES`), `use Enum` trait,
        `#[Label]`/`#[Description]` on every case, `isNumeric(): bool` helper
        method
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 2.2 Create `src/Enums/IndexStatus.php` — backed string enum with 4 cases
        (`GREEN`, `YELLOW`, `RED`, `UNKNOWN`), `use Enum` trait,
        `#[Label]`/`#[Description]` on every case, `isHealthy()`,
        `isDegraded()`, `isUnhealthy()` helper methods
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 2.3 Create `src/Enums/BuildState.php` — backed string enum with 5 cases
        (`PENDING`, `BUILDING`, `COMPLETED`, `FAILED`, `SKIPPED`), `use Enum`
        trait, `#[Label]`/`#[Description]` on every case, `isTerminal()`,
        `isActive()` helper methods
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]\* 2.4 Write property tests for enum metadata and classification
    - **Property 3: All Indexer enum cases have Label and Description metadata**
    - **Property 4: AggregationType.isNumeric() correctly classifies cases**
    - **Property 5: IndexStatus health categorization is mutually exclusive and
      exhaustive**
    - **Property 6: BuildState terminal/active categorization is mutually
      exclusive and exhaustive**
    - **Validates: Requirements 5.3, 5.4, 6.3, 6.4, 7.3, 7.4**

- [x] 3. Implement attributes
  - [x] 3.1 Create `src/Attributes/Indexed.php` — `final readonly` class,
        `Attribute::TARGET_CLASS`, 9 constructor parameters (`label`,
        `geoField`, `rankingRules`, `synonyms`, `stopWords`,
        `displayedAttributes`, `distinctAttribute`, `typoTolerance`, `analyzer`)
        with documented defaults, `ATTR_*` constants for each parameter
    - Must NOT accept `searchableFields`, `filterableAttributes`,
      `sortableAttributes`, or `tenantScoped`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 3.2 Create `src/Attributes/EmbedOne.php` — `final readonly` class,
        `Attribute::TARGET_CLASS | Attribute::IS_REPEATABLE`, parameters:
        `field`, `relation`, `fields` (default `[]`), `ATTR_*` constants
    - _Requirements: 2.1, 2.3, 2.4, 2.5_

  - [x] 3.3 Create `src/Attributes/EmbedMany.php` — `final readonly` class,
        `Attribute::TARGET_CLASS | Attribute::IS_REPEATABLE`, parameters:
        `field`, `relation`, `fields` (default `[]`), `limit` (default `null`),
        `orderBy` (default `null`), `ATTR_*` constants
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [x] 3.4 Create `src/Attributes/Aggregatable.php` — `final readonly` class,
        `Attribute::TARGET_CLASS`, parameter: `fields` (array mapping field
        names to `AggregationType` or arrays of `AggregationType`),
        `ATTR_FIELDS` constant
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 3.5 Create `src/Attributes/UseIndex.php` — `final readonly` class,
        `Attribute::TARGET_CLASS`, parameter: `fallback` (bool, default `true`),
        `ATTR_FALLBACK` constant
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]\* 3.6 Write property test for attribute construction round-trip
    - **Property 1: Attribute construction round-trip**
    - **Validates: Requirements 1.1, 2.1, 2.2, 3.1, 3.4, 3.5, 4.1**

  - [ ]\* 3.7 Write unit tests for attribute structural constraints
    - Verify `Attribute::TARGET_CLASS` targets, `final readonly` modifiers,
      `IS_REPEATABLE` flags, `ATTR_*` constants presence
    - _Requirements: 1.2, 1.3, 1.4, 2.3, 2.4, 3.2, 3.3, 4.2, 4.3_

- [x] 4. Checkpoint — Ensure all enum and attribute tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement data models, contracts, exceptions, and events
  - [x] 5.1 Create `src/Data/IndexConfigurationDTO.php` — `final readonly` class
        with all 18 properties (`modelClass`, `indexName`, `label`,
        `searchableFields`, `filterableFields`, `sortableFields`,
        `embedOneConfigs`, `embedManyConfigs`, `aggregatableFields`,
        `isTenantScoped`, `geoField`, `rankingRules`, `synonyms`, `stopWords`,
        `displayedAttributes`, `distinctAttribute`, `typoTolerance`,
        `analyzer`), full PHPDoc on each property
    - _Requirements: 16.1, 16.2, 16.3_

  - [x] 5.2 Create `src/Contracts/IndexerInterface.php` — interface with
        `#[Bind('Pixielity\\Search\\Services\\SearchIndexer')]`, methods:
        `index()`, `remove()`, `flush()`, `rebuild()`, full PHPDoc with
        `@param`/`@return`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 5.3 Create `src/Contracts/IndexManagerInterface.php` — interface with
        `#[Bind('Pixielity\\Search\\Services\\SearchIndexManager')]`, methods:
        `createIndex()`, `deleteIndex()`, `rebuildIndex()`, `flushIndex()`,
        `getIndexStatus()`, `resolveIndexName()`
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 5.4 Create `src/Contracts/RecordBuilderInterface.php` — interface with
        `#[Bind('Pixielity\\Search\\Services\\SearchRecordBuilder')]`, methods:
        `build()`, `map()`, `dryRun()`
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 5.5 Create `src/Exceptions/IndexUnavailableException.php` — extends
        `\RuntimeException`, constructor accepts entity class string, message
        includes entity class name
    - _Requirements: 17.1, 17.2, 17.3_

  - [x] 5.6 Create `src/Events/DocumentIndexed.php` — `final readonly` class
        with `#[AsEvent]`, properties: `modelClass` (string), `recordId`
        (int|string), `buildState` (BuildState), `indexName` (string)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ]\* 5.7 Write property test for DTO and Event construction round-trip
    - **Property 2: DTO and Event construction round-trip**
    - **Validates: Requirements 11.2, 16.1**

  - [ ]\* 5.8 Write property test for IndexUnavailableException message
    - **Property 9: IndexUnavailableException message contains entity class**
    - **Validates: Requirements 13.5, 17.2**

  - [ ]\* 5.9 Write unit tests for interface structure and contract signatures
    - Verify `#[Bind]` annotations point to correct search package classes
      (string references, not imports)
    - Verify method signatures match requirements
    - _Requirements: 8.1, 8.2, 9.1, 9.2, 10.1, 10.2_

- [x] 6. Checkpoint — Ensure all DTO, contract, event, and exception tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement IndexerRegistry
  - [x] 7.1 Create `src/Registry/IndexerRegistry.php` — `#[Scoped]` class with
        `$configs` array, methods: `get()` (throws `\InvalidArgumentException`
        for unregistered), `all()`, `has()`, `tenantScoped()`, `register()`,
        `loadFromCache()`, full docblocks
    - _Requirements: 14.6, 14.7, 14.8_

  - [ ]\* 7.2 Write property test for IndexerRegistry CRUD consistency
    - **Property 10: IndexerRegistry CRUD consistency**
    - **Validates: Requirements 14.6**

- [x] 8. Implement IndexerRegistryCompiler
  - [x] 8.1 Create `src/Compiler/IndexerRegistryCompiler.php` —
        `#[AsCompiler(priority: 25, phase: CompilerPhase::REGISTRY)]`,
        implements `CompilerInterface`, `compile()` method discovers
        `#[Indexed]` models via Discovery, merges with CRUD attributes
        (`#[Searchable]`, `#[Filterable]`, `#[Sortable]`), reads
        `#[EmbedOne]`/`#[EmbedMany]`/`#[Aggregatable]`, detects
        `BelongsToTenant` via `class_uses_recursive()`, builds
        `IndexConfigurationDTO` per model, caches to
        `bootstrap/cache/indexer_registry.php`, returns
        `CompilerResult::success()` or `CompilerResult::skipped()`
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 15.1, 15.2, 15.3, 15.4, 15.5,
      15.6_

  - [ ]\* 8.2 Write unit test for compiler skip behavior
    - Verify `CompilerResult::skipped('No indexed models found')` when no
      `#[Indexed]` models discovered
    - _Requirements: 15.5_

- [x] 9. Implement Indexable trait (model concern)
  - [x] 9.1 Create `src/Concerns/Indexable.php` — trait with `bootIndexable()`
        (registers `saved`/`deleted` observers), `toIndexableArray()` (reads
        `#[Searchable]` fields via Discovery, resolves
        `#[EmbedOne]`/`#[EmbedMany]` relationships), `buildIndex()` (delegates
        to `RecordBuilderInterface`), `removeIndex()` (delegates to
        `IndexerInterface`), `excludeIndex()` (returns `false` by default)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ]\* 9.2 Write property tests for Indexable trait
    - **Property 7: toIndexableArray() includes all searchable fields and
      resolved embeds**
    - **Property 8: EmbedMany respects limit constraint**
    - **Validates: Requirements 12.1, 12.2, 12.3**

- [x] 10. Implement RoutesToIndex trait (repository concern)
  - [x] 10.1 Create `src/Concerns/RoutesToIndex.php` — trait overriding
        `query()`, checks `IndexerRegistry::has()`, checks `IndexerInterface`
        availability, returns ES builder when available, falls back to PG
        builder or throws `IndexUnavailableException` based on
        `#[UseIndex(fallback)]` setting
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]\* 10.2 Write integration tests for RoutesToIndex routing logic
    - Mock `IndexerRegistry` and `IndexerInterface`, verify ES builder returned
      when available, PG fallback, exception when fallback disabled
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All files must include `declare(strict_types=1)`, file-level docblocks, and
  method-level docblocks per steering
- `#[Bind]` on interfaces uses string class references (e.g.,
  `'Pixielity\\Search\\Services\\SearchIndexer'`), NOT imports
- The `Indexable` and `RoutesToIndex` traits resolve dependencies via the
  Laravel container, not constructor injection
- Property tests validate universal correctness properties from the design
  document
- Unit tests validate structural constraints and specific examples
