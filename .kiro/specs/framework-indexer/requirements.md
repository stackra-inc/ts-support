# Requirements Document — Framework Indexer Sub-Package

## Introduction

The `framework/src/Indexer/` sub-package provides the foundational indexing
layer for the Pixielity monorepo. It lives inside the framework package at
`packages/framework/src/Indexer/` under the namespace `Pixielity\Indexer`,
following the same pattern as `Aop/`, `Compiler/`, `Queue/`, `Event/`, and other
framework sub-packages.

This sub-package owns the pure PHP foundation that the `search` package and
`reporting` package build on top of. It contains attributes (`#[Indexed]`,
`#[EmbedOne]`, `#[EmbedMany]`, `#[Aggregatable]`, `#[UseIndex]`), contracts
(`IndexerInterface`, `IndexManagerInterface`, `RecordBuilderInterface`), traits
(`Indexable` for models, `RoutesToIndex` for repositories), enums
(`AggregationType`, `IndexStatus`, `BuildState`), events (`DocumentIndexed`),
and a compile-time registry (`IndexerRegistry`).

This sub-package has NO Elasticsearch dependency — it is pure PHP attributes,
contracts, traits, and enums. The search package (`pixielity/laravel-search`)
provides the ES-specific implementations using `pdphilip/elasticsearch`. The
reporting package provides ES aggregation implementations. This sub-package
defines the contracts and data structures they implement.

Key design decisions:

- No Scout dependency — Scout is dropped entirely. `pdphilip/elasticsearch` is
  the ES driver, used by the search package only.
- Reuses existing CRUD attributes — `#[Searchable]`, `#[Filterable]`,
  `#[Sortable]` stay in the CRUD package. The `IndexerRegistry` reads them via
  Discovery to build merged configurations. No duplication.
- `#[Indexed]` is minimal — only ES-specific config (label, geoField,
  rankingRules, synonyms, stopWords, displayedAttributes, distinctAttribute,
  typoTolerance, analyzer). Searchable/filterable/sortable fields are read from
  CRUD. Tenant scoping is auto-detected from `BelongsToTenant` trait.
- Tenant scoping is auto-detected at compile time from `BelongsToTenant` trait
  presence. The search package's `SearchBootstrapper` uses
  `pdphilip/elasticsearch`'s `setIndexPrefix()` for index-per-tenant strategy.

### Architecture

```
framework/src/Indexer/          ← THIS SPEC (foundation layer — pure PHP)
packages/search/                ← Search package (separate spec — uses Indexer + pdphilip/elasticsearch)
packages/reporting/             ← Reporting package (separate spec — uses Indexer + ES aggregations)
```

## Glossary

- **Indexer_Registry**: The compile-time registry (`IndexerRegistry`, bound as
  `#[Scoped]`) that discovers all `#[Indexed]` models via Discovery, merges
  their config with `#[Searchable]`/`#[Filterable]`/`#[Sortable]` from CRUD, and
  stores merged configuration DTOs. Pre-resolved by `IndexerRegistryCompiler`
  during `di:compile`.
- **Indexed_Attribute**: The `#[Indexed]` PHP attribute placed on model classes
  to opt them into ES indexing. Contains only ES-specific config: `label`,
  `geoField`, `rankingRules`, `synonyms`, `stopWords`, `displayedAttributes`,
  `distinctAttribute`, `typoTolerance`, `analyzer`. Does NOT contain
  searchable/filterable/sortable fields or tenant scoping.
- **EmbedOne_Attribute**: The `#[EmbedOne]` repeatable PHP attribute declaring a
  belongsTo/hasOne relationship to flatten into the ES document. Parameters:
  `field`, `relation`, `fields`.
- **EmbedMany_Attribute**: The `#[EmbedMany]` repeatable PHP attribute declaring
  a hasMany relationship to flatten into the ES document. Parameters: `field`,
  `relation`, `fields`, `limit`, `orderBy`.
- **Aggregatable_Attribute**: The `#[Aggregatable]` PHP attribute declaring
  which model fields support ES aggregations for reporting. Maps field names to
  `AggregationType` enum values.
- **UseIndex_Attribute**: The `#[UseIndex]` PHP attribute placed on repository
  classes to indicate that reads should route to ES when available. Used by the
  `RoutesToIndex` trait.
- **Indexable_Trait**: The `Indexable` model trait providing
  `toIndexableArray()` (flattens model + embeds into ES document),
  `buildIndex()`, `removeIndex()`, `excludeIndex()`, and observer chain
  registration on boot.
- **RoutesToIndex_Trait**: The `RoutesToIndex` repository trait that overrides
  `query()` to route reads to the ES Eloquent builder when the entity is indexed
  and ES is available, falling back to PostgreSQL otherwise. Transparent to
  service/controller layer.
- **Indexer_Interface**: The contract (`IndexerInterface`) defining the core
  indexing operations: `index()`, `remove()`, `flush()`, `rebuild()`.
  Implemented by the search package.
- **Index_Manager_Interface**: The contract (`IndexManagerInterface`) defining
  index lifecycle operations: `createIndex()`, `deleteIndex()`,
  `rebuildIndex()`, `flushIndex()`, `getIndexStatus()`, `resolveIndexName()`.
  Implemented by the search package.
- **Record_Builder_Interface**: The contract (`RecordBuilderInterface`) defining
  the document building pipeline: `build()`, `map()`, `dryRun()`. Implemented by
  the search package.
- **AggregationType_Enum**: Backed string enum defining ES aggregation types:
  `TERMS`, `SUM`, `AVG`, `MIN`, `MAX`, `DATE_HISTOGRAM`, `RANGE`, `GEO`,
  `CARDINALITY`, `PERCENTILES`.
- **IndexStatus_Enum**: Backed string enum defining index health states:
  `GREEN`, `YELLOW`, `RED`, `UNKNOWN`.
- **BuildState_Enum**: Backed string enum defining document build states:
  `PENDING`, `BUILDING`, `COMPLETED`, `FAILED`, `SKIPPED`.
- **DocumentIndexed_Event**: Domain event dispatched after a document is
  successfully indexed. Carries model class, record ID, and build state.
- **Indexer_Registry_Compiler**: Build-time compiler (`#[AsCompiler]`) that
  discovers `#[Indexed]` models, merges with CRUD attributes, detects tenant
  scoping, and caches into the `IndexerRegistry`.
- **Index_Configuration_DTO**: A readonly DTO holding the merged configuration
  for a single indexed entity: model class, index name, searchable fields,
  filterable fields, sortable fields, embed configs, aggregatable fields,
  tenant-scoped flag, and all `#[Indexed]` parameters.

## Requirements

### Requirement 1: Indexed Attribute (ES-Specific Configuration Only)

**User Story:** As a developer, I want to annotate my models with `#[Indexed]`
to opt them into Elasticsearch indexing with ES-specific configuration, reusing
existing `#[Searchable]`/`#[Filterable]`/`#[Sortable]` attributes for field
configuration, so that I avoid duplicating field declarations.

#### Acceptance Criteria

1. THE `#[Indexed]` attribute SHALL accept the following ES-specific parameters:
   `label` (string, human-readable entity name for API responses, default `''`),
   `geoField` (nullable string for geo-coordinate field name, default `null`),
   `rankingRules` (nullable array of ES boosting/scoring config, default
   `null`), `synonyms` (array mapping terms to synonym arrays, default `[]`),
   `stopWords` (array of stop word strings, default `[]`), `displayedAttributes`
   (nullable array of fields returned in results, default `null` meaning all),
   `distinctAttribute` (nullable string for deduplication field, default
   `null`), `typoTolerance` (bool for fuzzy matching, default `true`), and
   `analyzer` (nullable string for custom ES analyzer name, default `null`).
2. THE `#[Indexed]` attribute SHALL NOT accept `searchableFields`,
   `filterableAttributes`, `sortableAttributes`, or `tenantScoped` parameters.
3. THE `#[Indexed]` attribute SHALL target `Attribute::TARGET_CLASS` and be
   declared as `final readonly`.
4. THE `#[Indexed]` attribute SHALL define `ATTR_*` constants for each parameter
   name following the Pixielity convention (e.g., `ATTR_LABEL`,
   `ATTR_GEO_FIELD`, `ATTR_SYNONYMS`).
5. THE `#[Indexed]` attribute SHALL reside in
   `packages/framework/src/Indexer/src/Attributes/Indexed.php` under the
   namespace `Pixielity\Indexer\Attributes`.

### Requirement 2: EmbedOne and EmbedMany Attributes

**User Story:** As a developer, I want to declare embedded relationships via
`#[EmbedOne]` and `#[EmbedMany]` attributes so that related model data is
flattened into the ES document for denormalized search.

#### Acceptance Criteria

1. THE `#[EmbedOne]` attribute SHALL accept parameters: `field` (string, the
   index field name), `relation` (class-string of the related model), and
   `fields` (array of field names to include from the related model, default
   `[]` meaning all).
2. THE `#[EmbedMany]` attribute SHALL accept parameters: `field` (string, the
   index field name), `relation` (class-string of the related model), `fields`
   (array of field names to include, default `[]` meaning all), `limit`
   (nullable int, max records to embed, default `null` meaning all), and
   `orderBy` (nullable string in `field:direction` format, default `null`).
3. BOTH `#[EmbedOne]` and `#[EmbedMany]` SHALL target `Attribute::TARGET_CLASS`
   and be repeatable (`Attribute::IS_REPEATABLE`).
4. BOTH attributes SHALL be declared as `final readonly` and define `ATTR_*`
   constants for each parameter name.
5. BOTH attributes SHALL reside in
   `packages/framework/src/Indexer/src/Attributes/` under the namespace
   `Pixielity\Indexer\Attributes`.

### Requirement 3: Aggregatable Attribute

**User Story:** As a developer, I want to declare which model fields support ES
aggregations via `#[Aggregatable]` so that the reporting package knows which
fields can be used for analytics dashboards.

#### Acceptance Criteria

1. THE `#[Aggregatable]` attribute SHALL accept a `fields` parameter: an
   associative array mapping field names (string) to `AggregationType` enum
   values or arrays of `AggregationType` enum values.
2. THE `#[Aggregatable]` attribute SHALL target `Attribute::TARGET_CLASS` and be
   declared as `final readonly`.
3. THE `#[Aggregatable]` attribute SHALL define an `ATTR_FIELDS` constant.
4. WHEN a field maps to a single `AggregationType`, THE attribute SHALL accept
   it as a single value (e.g., `'status' => AggregationType::TERMS`).
5. WHEN a field supports multiple aggregation types, THE attribute SHALL accept
   an array of `AggregationType` values (e.g.,
   `'price' => [AggregationType::AVG, AggregationType::SUM, AggregationType::RANGE]`).
6. THE `#[Aggregatable]` attribute SHALL reside in
   `packages/framework/src/Indexer/src/Attributes/Aggregatable.php` under the
   namespace `Pixielity\Indexer\Attributes`.

### Requirement 4: UseIndex Attribute

**User Story:** As a developer, I want to annotate my repository classes with
`#[UseIndex]` to indicate that reads should route to ES when available, so that
the `RoutesToIndex` trait knows which repositories participate in index-based
reads.

#### Acceptance Criteria

1. THE `#[UseIndex]` attribute SHALL accept an optional `fallback` parameter
   (bool, default `true`) indicating whether to fall back to PostgreSQL when ES
   is unavailable.
2. THE `#[UseIndex]` attribute SHALL target `Attribute::TARGET_CLASS` and be
   declared as `final readonly`.
3. THE `#[UseIndex]` attribute SHALL define `ATTR_FALLBACK` constant.
4. THE `#[UseIndex]` attribute SHALL reside in
   `packages/framework/src/Indexer/src/Attributes/UseIndex.php` under the
   namespace `Pixielity\Indexer\Attributes`.

### Requirement 5: AggregationType Enum

**User Story:** As a developer, I want a typed enum of ES aggregation types so
that `#[Aggregatable]` field declarations are type-safe and self-documenting.

#### Acceptance Criteria

1. THE `AggregationType` enum SHALL be a backed string enum with cases: `TERMS`
   (`'terms'`), `SUM` (`'sum'`), `AVG` (`'avg'`), `MIN` (`'min'`), `MAX`
   (`'max'`), `DATE_HISTOGRAM` (`'date_histogram'`), `RANGE` (`'range'`), `GEO`
   (`'geo_distance'`), `CARDINALITY` (`'cardinality'`), and `PERCENTILES`
   (`'percentiles'`).
2. THE `AggregationType` enum SHALL use the `Enum` trait from
   `Pixielity\Enum\Enum`.
3. EACH case SHALL have `#[Label]` and `#[Description]` attributes following the
   Pixielity enum convention.
4. THE `AggregationType` enum SHALL provide a `isNumeric(): bool` helper method
   that returns `true` for `SUM`, `AVG`, `MIN`, `MAX`, `PERCENTILES`.
5. THE `AggregationType` enum SHALL reside in
   `packages/framework/src/Indexer/src/Enums/AggregationType.php` under the
   namespace `Pixielity\Indexer\Enums`.

### Requirement 6: IndexStatus Enum

**User Story:** As a developer, I want a typed enum of index health states so
that index status reporting is consistent across the search and reporting
packages.

#### Acceptance Criteria

1. THE `IndexStatus` enum SHALL be a backed string enum with cases: `GREEN`
   (`'green'`), `YELLOW` (`'yellow'`), `RED` (`'red'`), and `UNKNOWN`
   (`'unknown'`).
2. THE `IndexStatus` enum SHALL use the `Enum` trait from `Pixielity\Enum\Enum`.
3. EACH case SHALL have `#[Label]` and `#[Description]` attributes.
4. THE `IndexStatus` enum SHALL provide `isHealthy(): bool` (returns `true` for
   `GREEN`), `isDegraded(): bool` (returns `true` for `YELLOW`), and
   `isUnhealthy(): bool` (returns `true` for `RED` or `UNKNOWN`) helper methods.
5. THE `IndexStatus` enum SHALL reside in
   `packages/framework/src/Indexer/src/Enums/IndexStatus.php` under the
   namespace `Pixielity\Indexer\Enums`.

### Requirement 7: BuildState Enum

**User Story:** As a developer, I want a typed enum of document build states so
that index build progress and failures are tracked consistently.

#### Acceptance Criteria

1. THE `BuildState` enum SHALL be a backed string enum with cases: `PENDING`
   (`'pending'`), `BUILDING` (`'building'`), `COMPLETED` (`'completed'`),
   `FAILED` (`'failed'`), and `SKIPPED` (`'skipped'`).
2. THE `BuildState` enum SHALL use the `Enum` trait from `Pixielity\Enum\Enum`.
3. EACH case SHALL have `#[Label]` and `#[Description]` attributes.
4. THE `BuildState` enum SHALL provide `isTerminal(): bool` (returns `true` for
   `COMPLETED`, `FAILED`, `SKIPPED`) and `isActive(): bool` (returns `true` for
   `PENDING`, `BUILDING`) helper methods.
5. THE `BuildState` enum SHALL reside in
   `packages/framework/src/Indexer/src/Enums/BuildState.php` under the namespace
   `Pixielity\Indexer\Enums`.

### Requirement 8: IndexerInterface Contract

**User Story:** As a developer, I want a contract defining core indexing
operations so that the search package can provide an implementation while the
framework sub-package remains ES-agnostic.

#### Acceptance Criteria

1. THE `IndexerInterface` SHALL define methods: `index(object $model): void`
   (index a single model record), `remove(object $model): void` (remove a single
   model record from the index), `flush(string $entityClass): void` (remove all
   documents from an entity's index), and
   `rebuild(string $entityClass, ?callable $progress = null): void` (rebuild all
   documents for an entity).
2. THE `IndexerInterface` SHALL be annotated with `#[Bind]` pointing to the
   search package's implementation class.
3. THE `IndexerInterface` SHALL reside in
   `packages/framework/src/Indexer/src/Contracts/IndexerInterface.php` under the
   namespace `Pixielity\Indexer\Contracts`.
4. THE `IndexerInterface` SHALL include full PHPDoc on each method with `@param`
   and `@return` annotations.

### Requirement 9: IndexManagerInterface Contract

**User Story:** As a developer, I want a contract defining index lifecycle
operations so that the search package can manage ES indexes while the framework
sub-package defines the API.

#### Acceptance Criteria

1. THE `IndexManagerInterface` SHALL define methods:
   `createIndex(string $entityClass, ?int $tenantKey = null): void`,
   `deleteIndex(string $entityClass, ?int $tenantKey = null): void`,
   `rebuildIndex(string $entityClass, ?int $tenantKey = null, ?callable $progress = null): void`,
   `flushIndex(string $entityClass, ?int $tenantKey = null): void`,
   `getIndexStatus(string $entityClass, ?int $tenantKey = null): IndexStatusDTO`,
   and `resolveIndexName(string $entityClass, ?int $tenantKey = null): string`.
2. THE `IndexManagerInterface` SHALL be annotated with `#[Bind]` pointing to the
   search package's implementation class.
3. THE `IndexManagerInterface` SHALL reside in
   `packages/framework/src/Indexer/src/Contracts/IndexManagerInterface.php`
   under the namespace `Pixielity\Indexer\Contracts`.

### Requirement 10: RecordBuilderInterface Contract

**User Story:** As a developer, I want a contract defining the document building
pipeline so that the search package can implement ES document construction while
the framework sub-package defines the API.

#### Acceptance Criteria

1. THE `RecordBuilderInterface` SHALL define methods:
   `build(string $entityClass, int|string $id): array` (build a single ES
   document from a model record), `map(object $model, array $config): ?array`
   (map a model instance to an ES document array, returning `null` if excluded),
   and `dryRun(string $entityClass, int|string $id): array` (build without
   persisting to ES, for validation).
2. THE `RecordBuilderInterface` SHALL be annotated with `#[Bind]` pointing to
   the search package's implementation class.
3. THE `RecordBuilderInterface` SHALL reside in
   `packages/framework/src/Indexer/src/Contracts/RecordBuilderInterface.php`
   under the namespace `Pixielity\Indexer\Contracts`.

### Requirement 11: DocumentIndexed Event

**User Story:** As a developer, I want a domain event dispatched after a
document is indexed so that other packages can react to indexing operations
(e.g., analytics, logging, cache invalidation).

#### Acceptance Criteria

1. THE `DocumentIndexed` event SHALL be a `final readonly` class annotated with
   `#[AsEvent]`.
2. THE `DocumentIndexed` event SHALL carry: `modelClass` (class-string of the
   indexed model), `recordId` (int|string), `buildState` (BuildState enum
   value), and `indexName` (string, the resolved ES index name).
3. THE `DocumentIndexed` event SHALL reside in
   `packages/framework/src/Indexer/src/Events/DocumentIndexed.php` under the
   namespace `Pixielity\Indexer\Events`.
4. THE `DocumentIndexed` event SHALL follow the Pixielity event convention:
   readonly DTO with IDs only, no model instances.

### Requirement 12: Indexable Trait (Model Concern)

**User Story:** As a developer, I want a model trait that provides ES document
building, index management methods, and automatic observer chain registration,
so that models opted into indexing have a consistent API.

#### Acceptance Criteria

1. THE `Indexable` trait SHALL provide a `toIndexableArray(): array` method that
   builds the ES document by reading `#[Searchable]` fields from the model and
   resolving `#[EmbedOne]`/`#[EmbedMany]` relationships into nested objects
   within the document.
2. WHEN a model has `#[EmbedOne]` declarations, THE `toIndexableArray()` method
   SHALL load the related model and include its declared fields as a nested
   object in the document.
3. WHEN a model has `#[EmbedMany]` declarations, THE `toIndexableArray()` method
   SHALL load the related models (respecting `limit` and `orderBy`) and include
   them as an array of nested objects in the document.
4. THE `Indexable` trait SHALL provide `buildIndex(): array` (delegates to
   `RecordBuilderInterface::build()`), `removeIndex(): bool` (delegates to
   `IndexerInterface::remove()`), and `excludeIndex(): bool` (returns `false` by
   default, overridable by the model to conditionally exclude records from
   indexing).
5. THE `Indexable` trait SHALL register observer chains on boot via a
   `bootIndexable()` method that hooks into model `saved` and `deleted` events
   to trigger index rebuilds.
6. THE `Indexable` trait SHALL reside in
   `packages/framework/src/Indexer/src/Concerns/Indexable.php` under the
   namespace `Pixielity\Indexer\Concerns`.
7. THE `Indexable` trait SHALL resolve embed configurations from
   `Discovery::forClass(static::class)` reading `#[EmbedOne]` and `#[EmbedMany]`
   attributes.

### Requirement 13: RoutesToIndex Trait (Repository Concern)

**User Story:** As a developer, I want a repository trait that transparently
routes reads to ES when the entity is indexed and ES is available, falling back
to PostgreSQL otherwise, so that the service/controller layer does not need to
know about the search backend.

#### Acceptance Criteria

1. THE `RoutesToIndex` trait SHALL override the repository's `query()` method to
   check if the entity is indexed (via `IndexerRegistry`) and if ES is available
   (via `IndexerInterface`).
2. WHEN the entity is indexed and ES is available, THE `RoutesToIndex` trait
   SHALL return an ES Eloquent builder (from `pdphilip/elasticsearch`) instead
   of the default PostgreSQL builder.
3. WHEN ES is unavailable or the entity is not indexed, THE `RoutesToIndex`
   trait SHALL fall back to the default PostgreSQL builder transparently.
4. THE `RoutesToIndex` trait SHALL read the `#[UseIndex]` attribute from the
   repository class to determine if fallback is enabled (default `true`).
5. IF `#[UseIndex(fallback: false)]` is set and ES is unavailable, THEN THE
   `RoutesToIndex` trait SHALL throw an `IndexUnavailableException`.
6. THE `RoutesToIndex` trait SHALL reside in
   `packages/framework/src/Indexer/src/Concerns/RoutesToIndex.php` under the
   namespace `Pixielity\Indexer\Concerns`.

### Requirement 14: IndexerRegistry (Compile-Time Discovery and Merged Configuration)

**User Story:** As a developer, I want a registry that discovers all
`#[Indexed]` models at compile time, merges their configuration with CRUD
attributes, and provides a fast lookup API, so that runtime operations avoid
repeated attribute resolution.

#### Acceptance Criteria

1. THE `IndexerRegistry` SHALL use `Discovery::attribute(Indexed::class)->get()`
   to discover all indexed models.
2. FOR each discovered model, THE `IndexerRegistry` SHALL read `#[Searchable]`
   from the model class via `Discovery::forClass()` and store its fields as the
   searchable field configuration.
3. FOR each discovered model, THE `IndexerRegistry` SHALL read `#[Filterable]`
   and `#[Sortable]` from the model's repository class (via the CRUD
   `RepositoryConfigRegistry`) and store them as filterable and sortable field
   configurations.
4. FOR each discovered model, THE `IndexerRegistry` SHALL read `#[EmbedOne]`,
   `#[EmbedMany]`, and `#[Aggregatable]` attributes from the model class and
   store the embedded relationship and aggregation configurations.
5. FOR each discovered model, THE `IndexerRegistry` SHALL detect tenant scoping
   by checking if the model uses the `BelongsToTenant` trait via
   `in_array(BelongsToTenant::class, class_uses_recursive($modelClass))`.
6. THE `IndexerRegistry` SHALL provide methods:
   `get(string $modelClass): IndexConfigurationDTO` (get merged config for a
   model), `all(): Collection` (all registered configs),
   `has(string $modelClass): bool` (check if a model is indexed), and
   `tenantScoped(): Collection` (all tenant-scoped configs).
7. THE `IndexerRegistry` SHALL be bound as `#[Scoped]` for Octane-safe
   per-request isolation.
8. THE `IndexerRegistry` SHALL reside in
   `packages/framework/src/Indexer/src/Registry/IndexerRegistry.php` under the
   namespace `Pixielity\Indexer\Registry`.

### Requirement 15: IndexerRegistryCompiler (Build-Time Compilation)

**User Story:** As a developer, I want the indexer registry to be pre-resolved
at compile time via `di:compile`, so that runtime boot is fast and avoids
repeated Discovery calls.

#### Acceptance Criteria

1. THE `IndexerRegistryCompiler` SHALL be annotated with
   `#[AsCompiler(priority: 25, phase: CompilerPhase::REGISTRY)]`.
2. THE `IndexerRegistryCompiler` SHALL implement `CompilerInterface` with
   `compile(CompilerContext $context): CompilerResult` and `name(): string`.
3. WHEN compiled, THE `IndexerRegistryCompiler` SHALL discover all `#[Indexed]`
   models, merge with CRUD attributes, detect tenant scoping, and cache the
   merged configurations to `bootstrap/cache/indexer_registry.php`.
4. THE `IndexerRegistryCompiler` SHALL return a `CompilerResult::success()` with
   the count of discovered indexed models.
5. IF no `#[Indexed]` models are found, THE `IndexerRegistryCompiler` SHALL
   return `CompilerResult::skipped('No indexed models found')`.
6. THE `IndexerRegistryCompiler` SHALL reside in
   `packages/framework/src/Indexer/src/Compiler/IndexerRegistryCompiler.php`
   under the namespace `Pixielity\Indexer\Compiler`.

### Requirement 16: IndexConfigurationDTO (Merged Configuration Data Object)

**User Story:** As a developer, I want a typed DTO holding the merged
configuration for an indexed entity so that all indexing components work with a
consistent, validated data structure.

#### Acceptance Criteria

1. THE `IndexConfigurationDTO` SHALL be a `final readonly` class with
   properties: `modelClass` (class-string), `indexName` (string, derived from
   model table name), `label` (string), `searchableFields` (array),
   `filterableFields` (array), `sortableFields` (array), `embedOneConfigs`
   (array of EmbedOne attribute instances), `embedManyConfigs` (array of
   EmbedMany attribute instances), `aggregatableFields` (array mapping field
   names to AggregationType values), `isTenantScoped` (bool), `geoField`
   (?string), `rankingRules` (?array), `synonyms` (array), `stopWords` (array),
   `displayedAttributes` (?array), `distinctAttribute` (?string),
   `typoTolerance` (bool), and `analyzer` (?string).
2. THE `IndexConfigurationDTO` SHALL reside in
   `packages/framework/src/Indexer/src/Data/IndexConfigurationDTO.php` under the
   namespace `Pixielity\Indexer\Data`.
3. THE `IndexConfigurationDTO` SHALL include full PHPDoc on each property.

### Requirement 17: IndexUnavailableException

**User Story:** As a developer, I want a typed exception for when ES is
unavailable and fallback is disabled, so that error handling is explicit and
consistent.

#### Acceptance Criteria

1. THE `IndexUnavailableException` SHALL extend `\RuntimeException`.
2. THE `IndexUnavailableException` SHALL accept the entity class name in its
   constructor and produce a descriptive message (e.g., "Elasticsearch index
   unavailable for {entityClass} and fallback is disabled").
3. THE `IndexUnavailableException` SHALL reside in
   `packages/framework/src/Indexer/src/Exceptions/IndexUnavailableException.php`
   under the namespace `Pixielity\Indexer\Exceptions`.
