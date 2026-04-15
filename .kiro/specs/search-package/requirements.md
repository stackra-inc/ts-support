# Requirements Document — Search Package (`pixielity/laravel-search`)

## Introduction

The `pixielity/laravel-search` package provides the Elasticsearch implementation
layer for the Pixielity monorepo. It builds on top of the framework Indexer
sub-package (`packages/framework/src/Indexer/`) which owns the pure PHP
foundation: attributes (`#[Indexed]`, `#[EmbedOne]`, `#[EmbedMany]`,
`#[Aggregatable]`, `#[UseIndex]`), contracts (`IndexerInterface`,
`IndexManagerInterface`, `RecordBuilderInterface`), traits (`Indexable`,
`RoutesToIndex`), enums (`AggregationType`, `IndexStatus`, `BuildState`), events
(`DocumentIndexed`), registry (`IndexerRegistry` + `IndexerRegistryCompiler`),
DTO (`IndexConfigurationDTO`), and exception (`IndexUnavailableException`).

This package IMPLEMENTS the framework contracts and USES the framework
attributes/traits. It does NOT redefine them.

The search package uses `pdphilip/elasticsearch` (v5, supports Laravel 13) as
the Elasticsearch Eloquent driver. This provides an Eloquent-compatible
`Connection` with `setIndexPrefix()` for tenant isolation, query builders,
schema management, and full ES integration through Laravel's database layer. NO
`laravel/scout`, NO `meilisearch/meilisearch-php`, NO raw
`elasticsearch/elasticsearch` client.

### What This Package Owns

1. **ES-specific implementations** of framework contracts: `Indexer`,
   `IndexManager`, `RecordBuilder`
2. **Observer chains** (ElasticLens pattern): `ObserverRegistry`,
   `BaseModelObserver`, `EmbeddedModelTrigger`
3. **SearchBootstrapper** (`#[AsBootstrapper]`): sets `pdphilip/elasticsearch`
   connection's `indexPrefix` to `tenant_{key}_` on tenant init
4. **SearchManager** service: unified cross-entity search, entity-specific
   search, autocomplete, faceted search, SQL LIKE fallback
5. **Queued jobs**: `IndexBuildJob`, `IndexDeleteJob`, `BulkIndexJob`
6. **Search API controller + routes**
7. **Artisan commands**: `search:index`, `search:flush`, `search:rebuild`,
   `search:status`
8. **Health check** (`#[AsHealthCheck]`)
9. **Search analytics** (query tracking, click-through, zero-result tracking —
   stored in PostgreSQL)
10. **Domain events**: `IndexCreated`, `IndexRebuilt`, `IndexFlushed`,
    `IndexDeleted`, `SearchPerformed`, `SearchFallbackActivated`
11. **Configuration** (`config/search.php`)
12. **Tenant lifecycle listeners**: listen to `TenantCreated`/`TenantDeleted` to
    create/delete tenant indexes

### Architecture

```
framework/src/Indexer/          ← Foundation layer (pure PHP — attributes, contracts, traits, enums, registry)
packages/search/                ← THIS SPEC (ES implementation via pdphilip/elasticsearch)
packages/reporting/             ← Reporting package (separate spec — uses Indexer + ES aggregations)
```

### Key Design Decisions

- `pdphilip/elasticsearch` provides the ES Eloquent driver — Connection,
  Builder, Schema, Model support
- Index-per-tenant strategy via `Connection::setIndexPrefix()` in the
  `SearchBootstrapper`
- `BelongsToTenant` auto-detection is already done by the framework's
  `IndexerRegistry` at compile time
- Observer chains dispatch queued `IndexBuildJob`s (non-blocking)
- SQL LIKE fallback via existing `RequestSearchCriteria` from CRUD package
- Search result highlighting via ES highlight API
- Geo-search via ES `geo_point` + `geo_distance` filter
- Search analytics stored in PostgreSQL (not ES)
- Uses `Illuminate\Container\Attributes\Bind` and
  `Illuminate\Container\Attributes\Scoped` for DI

## Glossary

- **Indexer**: The ES-specific implementation of `IndexerInterface` from the
  framework. Uses `pdphilip/elasticsearch` to index, remove, flush, and rebuild
  documents in Elasticsearch.
- **Index_Manager**: The ES-specific implementation of `IndexManagerInterface`
  from the framework. Creates, deletes, rebuilds, and flushes ES indexes via
  `pdphilip/elasticsearch`'s `Connection` and `Schema\Builder`.
- **Record_Builder**: The ES-specific implementation of `RecordBuilderInterface`
  from the framework. Builds ES documents from Eloquent models by reading
  `#[Searchable]` fields and resolving `#[EmbedOne]`/`#[EmbedMany]`
  relationships into nested objects (ElasticLens RecordBuilder/RecordMapper
  pattern).
- **Search_Manager**: The core orchestration service (`SearchManagerInterface`)
  that coordinates all search operations — full-text search, entity-specific
  search, autocomplete, faceted search, geo-search. Uses
  `pdphilip/elasticsearch`'s query builder. Falls back to
  `RequestSearchCriteria` when ES is down.
- **Search_Bootstrapper**: A tenancy bootstrapper
  (`TenancyBootstrapperInterface`) annotated with `#[AsBootstrapper]` that sets
  `pdphilip/elasticsearch`'s `Connection::setIndexPrefix('tenant_{key}_')` on
  tenant init and reverts on teardown.
- **Observer_Registry**: Service that registers model observers for both base
  models and embedded relationship models declared via
  `#[EmbedOne]`/`#[EmbedMany]`. Dispatches queued `IndexBuildJob`s on model
  save/delete.
- **Base_Model_Observer**: Eloquent observer attached to `#[Indexed]` models
  that dispatches `IndexBuildJob` on save and `IndexDeleteJob` on delete.
- **Embedded_Model_Trigger**: Observer handler that traverses the relationship
  chain from an embedded model back to the parent `#[Indexed]` model(s) and
  dispatches `IndexBuildJob`s to rebuild affected parent documents (ElasticLens
  EmbeddedModelTrigger pattern).
- **Index_Build_Job**: A queued job that builds a single ES document for a model
  record using the `RecordBuilder`.
- **Index_Delete_Job**: A queued job that removes a single ES document from the
  index.
- **Bulk_Index_Job**: A queued job that bulk-rebuilds documents for the
  `search:rebuild` command.
- **Search_Result**: A DTO containing aggregated search results grouped by
  entity type, including items, total counts, facet values, highlights, and
  metadata (query time, total hits).
- **Entity_Result**: A DTO containing search results for a single entity type
  with items, total count, facets, and highlights.
- **Search_Suggestion**: A DTO containing autocomplete data: text, entity type,
  record ID, relevance score.
- **Search_Analytics_Repository**: Repository for persisting and querying search
  analytics in PostgreSQL: queries, result counts, click-through events,
  zero-result queries.
- **Search_Controller**: REST API controller exposing unified search,
  entity-specific search, autocomplete, facets, and analytics endpoints.
- **Search_Service_Provider**: Package service provider with `#[Module]` and
  `#[LoadsResources]`.
- **Search_Health_Check**: Health check class annotated with `#[AsHealthCheck]`
  that verifies ES connectivity and index health.
- **Tenant_Context**: Current tenant scope. Auto-detected from `BelongsToTenant`
  trait at compile time by the framework's `IndexerRegistryCompiler`, cached in
  `IndexerRegistry`.
- **Global_Index**: ES index for models without `BelongsToTenant` (e.g.,
  `events`).
- **Tenant_Index**: ES index prefixed with tenant key for models with
  `BelongsToTenant` (e.g., `tenant_42_events`).
- **ES_Connection**: The `pdphilip/elasticsearch` `Connection` class that
  extends Laravel's `Illuminate\Database\Connection` and provides
  `setIndexPrefix()`, `getSchemaBuilder()`, query execution, and direct ES
  client access.

## Requirements

### Requirement 1: Package Scaffolding and Service Provider

**User Story:** As a developer, I want the search package to follow the standard
Pixielity package layout, so that it integrates seamlessly with the monorepo
build system and module discovery.

#### Acceptance Criteria

1. THE Search_Service_Provider SHALL be annotated with
   `#[Module(name: 'Search', priority: 55)]` and
   `#[LoadsResources(migrations: true, config: true, routes: true, commands: true, publishables: true)]`.
2. THE Search_Service_Provider SHALL implement `HasBindings` and register
   bindings for `SearchManagerInterface`, and any package-local interfaces.
3. THE package SHALL use the namespace `Pixielity\Search` with PSR-4 autoloading
   from `src/`.
4. THE package SHALL declare `pixielity/laravel-framework` (for Indexer
   sub-package attributes, contracts, traits, enums, registry),
   `pdphilip/elasticsearch: ^5.0` (ES Eloquent driver),
   `pixielity/laravel-discovery`, `pixielity/laravel-crud`,
   `pixielity/laravel-database`, and `pixielity/laravel-tenancy` as composer
   dependencies.
5. THE package SHALL NOT depend on `laravel/scout`,
   `meilisearch/meilisearch-php`, `pdphilip/elasticlens`,
   `matchish/laravel-scout-elasticsearch`, or `elasticsearch/elasticsearch`
   directly.
6. THE package SHALL include `composer.json`, `module.json`,
   `config/search.php`, and standard directory structure (`Contracts/`,
   `Controllers/`, `Concerns/`, `Enums/`, `Events/`, `Services/`, `Providers/`,
   `Repositories/`, `Commands/`, `Bootstrappers/`, `HealthChecks/`, `Jobs/`,
   `Observers/`, `Data/`, `routes/`).

### Requirement 2: Indexer Implementation (IndexerInterface)

**User Story:** As a developer, I want an ES-specific implementation of the
framework's `IndexerInterface`, so that models opted into indexing are persisted
to Elasticsearch via `pdphilip/elasticsearch`.

#### Acceptance Criteria

1. THE `Indexer` class SHALL implement
   `Pixielity\Indexer\Contracts\IndexerInterface` from the framework Indexer
   sub-package.
2. THE `Indexer` class SHALL be bound to `IndexerInterface` via
   `#[Bind(Indexer::class)]` on the interface (already declared in the
   framework).
3. THE `Indexer::index(object $model): void` method SHALL build the ES document
   using the `RecordBuilder` and persist it to the correct ES index via
   `pdphilip/elasticsearch`'s Eloquent model operations.
4. THE `Indexer::remove(object $model): void` method SHALL delete the document
   from the ES index by the model's primary key.
5. THE `Indexer::flush(string $entityClass): void` method SHALL remove all
   documents from the entity's ES index using `pdphilip/elasticsearch`'s
   `Connection::delete()` with a match-all query.
6. THE `Indexer::rebuild(string $entityClass, ?callable $progress = null): void`
   method SHALL flush the index and re-import all records from the database by
   dispatching `BulkIndexJob`s in chunks, calling the progress callback with
   rows imported and total rows.
7. THE `Indexer` SHALL resolve the correct tenant-scoped or global index name
   from the framework's `IndexerRegistry` for all operations.
8. THE `Indexer` SHALL reside in `packages/search/src/Services/Indexer.php`
   under the namespace `Pixielity\Search\Services`.

### Requirement 3: IndexManager Implementation (IndexManagerInterface)

**User Story:** As a platform operator, I want an ES-specific implementation of
the framework's `IndexManagerInterface`, so that ES indexes can be created,
deleted, rebuilt, and inspected programmatically.

#### Acceptance Criteria

1. THE `IndexManager` class SHALL implement
   `Pixielity\Indexer\Contracts\IndexManagerInterface` from the framework
   Indexer sub-package.
2. THE `IndexManager` class SHALL be bound to `IndexManagerInterface` via
   `#[Bind(IndexManager::class)]` on the interface (already declared in the
   framework).
3. WHEN `createIndex(string $entityClass, ?int $tenantKey = null)` is called,
   THE `IndexManager` SHALL create the ES index via `pdphilip/elasticsearch`'s
   `Connection::getSchemaBuilder()` with configured mappings (field types,
   nested objects for embeds, `geo_point` for geo fields), analyzers (synonyms,
   stop words, custom analyzer), and settings from the `#[Indexed]` attribute
   read via the framework's `IndexerRegistry`.
4. WHEN `deleteIndex(string $entityClass, ?int $tenantKey = null)` is called,
   THE `IndexManager` SHALL drop the ES index via `pdphilip/elasticsearch`'s
   `Connection::dropIndex()`.
5. WHEN
   `rebuildIndex(string $entityClass, ?int $tenantKey = null, ?callable $progress = null)`
   is called, THE `IndexManager` SHALL flush the index, re-apply all index
   settings, and re-import all records by delegating to `Indexer::rebuild()`.
6. WHEN `getIndexStatus(string $entityClass, ?int $tenantKey = null)` is called,
   THE `IndexManager` SHALL return an `IndexStatusDTO` containing: index name,
   document count, index size, health status (`IndexStatus` enum from
   framework), and last update timestamp, queried via `pdphilip/elasticsearch`'s
   `Connection::catIndices()` and `Connection::getIndex()`.
7. THE `IndexManager` SHALL dispatch `IndexCreated`, `IndexRebuilt`,
   `IndexFlushed`, and `IndexDeleted` events (owned by this package) for each
   lifecycle operation.
8. THE `IndexManager` SHALL reside in
   `packages/search/src/Services/IndexManager.php` under the namespace
   `Pixielity\Search\Services`.

### Requirement 4: RecordBuilder Implementation (RecordBuilderInterface)

**User Story:** As a developer, I want an ES-specific implementation of the
framework's `RecordBuilderInterface`, so that Eloquent models are transformed
into ES documents with embedded relationship data flattened.

#### Acceptance Criteria

1. THE `RecordBuilder` class SHALL implement
   `Pixielity\Indexer\Contracts\RecordBuilderInterface` from the framework
   Indexer sub-package.
2. THE `RecordBuilder` class SHALL be bound to `RecordBuilderInterface` via
   `#[Bind(RecordBuilder::class)]` on the interface (already declared in the
   framework).
3. THE `RecordBuilder::build(string $entityClass, int|string $id): array` method
   SHALL load the model from the database, resolve `#[EmbedOne]` and
   `#[EmbedMany]` configurations from the framework's `IndexerRegistry`, load
   related models, and produce a flat ES document array.
4. WHEN a model has `#[EmbedOne]` declarations, THE `RecordBuilder` SHALL load
   the related model and include its declared fields as a nested object in the
   document.
5. WHEN a model has `#[EmbedMany]` declarations, THE `RecordBuilder` SHALL load
   the related models (respecting `limit` and `orderBy` parameters) and include
   them as an array of nested objects in the document.
6. THE `RecordBuilder::map(object $model, array $config): ?array` method SHALL
   map a model instance to an ES document array, returning `null` if the model's
   `excludeIndex()` returns `true`.
7. THE `RecordBuilder::dryRun(string $entityClass, int|string $id): array`
   method SHALL build the document without persisting to ES, for validation and
   debugging.
8. THE `RecordBuilder` SHALL follow the ElasticLens
   `RecordBuilder`/`RecordMapper` pattern adapted to Pixielity conventions
   (attributes instead of manual `fieldMap()` methods).
9. THE `RecordBuilder` SHALL reside in
   `packages/search/src/Services/RecordBuilder.php` under the namespace
   `Pixielity\Search\Services`.

### Requirement 5: Observer Chains for Embedded Model Sync

**User Story:** As a developer, I want the ES index to automatically update when
a base model or any of its embedded relationship models change, so that search
results stay in sync without manual re-indexing.

#### Acceptance Criteria

1. THE package SHALL provide an `ObserverRegistry` that registers model
   observers for both the base model and all embedded relationship models
   declared via `#[EmbedOne]`/`#[EmbedMany]` (read from the framework's
   `IndexerRegistry`).
2. THE package SHALL provide a `BaseModelObserver` that dispatches
   `IndexBuildJob` when a base `#[Indexed]` model is saved (created or updated)
   and dispatches `IndexDeleteJob` when a base model is deleted.
3. THE package SHALL provide an `EmbeddedModelTrigger` that, when an embedded
   relationship model is saved or deleted, traverses the relationship chain back
   to the parent `#[Indexed]` model(s) and dispatches `IndexBuildJob`(s) to
   rebuild the affected parent documents.
4. THE `EmbeddedModelTrigger` SHALL handle multi-level relationships by walking
   upstream through the relationship chain until reaching the base model
   (ElasticLens `EmbeddedModelTrigger` pattern).
5. THE `EmbeddedModelTrigger` SHALL use chunked queries (100 records per chunk)
   when rebuilding multiple parent documents affected by an embedded model
   change.
6. THE `ObserverRegistry` SHALL be invoked during model boot via the framework's
   `Indexable` trait's `bootIndexable()` method.
7. ALL observer dispatches SHALL be queued jobs
   (`IndexBuildJob`/`IndexDeleteJob`) to ensure non-blocking request handling.
8. THE observer classes SHALL reside in `packages/search/src/Observers/` under
   the namespace `Pixielity\Search\Observers`.

### Requirement 6: SearchBootstrapper (#[AsBootstrapper])

**User Story:** As a platform operator, I want the search system to
automatically scope ES indexes to the current tenant, so that search operations
are transparently tenant-isolated.

#### Acceptance Criteria

1. THE `SearchBootstrapper` SHALL implement `TenancyBootstrapperInterface` and
   be annotated with `#[AsBootstrapper(priority: 110)]`.
2. WHEN the `SearchBootstrapper` bootstraps a tenant, THE `SearchBootstrapper`
   SHALL call `Connection::setIndexPrefix('tenant_{tenantKey}_')` on the
   `pdphilip/elasticsearch` connection to scope all ES operations to the
   tenant's indexes.
3. WHEN the `SearchBootstrapper` reverts tenancy, THE `SearchBootstrapper` SHALL
   restore the original index prefix on the `pdphilip/elasticsearch` connection.
4. THE `SearchBootstrapper` SHALL store the original index prefix before
   bootstrap so it can be restored on revert without data loss.
5. THE `SearchBootstrapper` SHALL NOT modify index resolution for entities that
   do not use the `BelongsToTenant` trait (global indexes remain unchanged —
   this is handled by the `IndexerRegistry`'s `isTenantScoped` flag).
6. THE `SearchBootstrapper` SHALL reside in
   `packages/search/src/Bootstrappers/SearchBootstrapper.php` under the
   namespace `Pixielity\Search\Bootstrappers`.

### Requirement 7: SearchManager Service

**User Story:** As a developer, I want a single service that handles all search
operations using `pdphilip/elasticsearch`, so that I have a clean API for
full-text search, filtering, sorting, geo-search, highlighting, and fallback.

#### Acceptance Criteria

1. THE `SearchManager` SHALL implement `SearchManagerInterface` (owned by this
   package) and use `pdphilip/elasticsearch`'s query builder and `Connection`
   for all ES operations.
2. THE `SearchManager` SHALL provide methods:
   `search(string $query, array $entities = [], array $options = [])` for
   unified cross-entity search (GET /api/search),
   `searchEntity(string $entity, string $query, array $filters = [], ?string $sort = null, array $options = [])`
   for entity-specific search (GET /api/search/{entity}),
   `suggest(string $query, array $entities = [], int $limit = 5)` for
   autocomplete (GET /api/search/suggest), and
   `facets(string $entity, ?string $query = null)` for faceted search (GET
   /api/search/facets/{entity}).
3. THE `SearchManager` SHALL build ES query DSL (bool queries with
   must/filter/should clauses) from the search parameters, applying the entity's
   configured searchable fields, filterable attributes, and sortable attributes
   read from the framework's `IndexerRegistry`.
4. THE `SearchManager` SHALL apply typo tolerance (fuzzy matching) when the
   entity's `#[Indexed]` attribute has `typoTolerance: true` (default).
5. THE `SearchManager` SHALL apply synonyms and stop words from the entity's
   `#[Indexed]` configuration during index creation (analyzer settings managed
   by `IndexManager`).
6. WHILE a tenant context is active, THE `SearchManager` SHALL automatically use
   the tenant-prefixed ES connection (set by `SearchBootstrapper`) for tenant
   entities and the global connection for non-tenant entities.
7. THE `SearchManager` SHALL be bound via `#[Bind]` on `SearchManagerInterface`
   and registered as `#[Scoped]` for Octane safety.
8. THE `SearchManager` SHALL reside in
   `packages/search/src/Services/SearchManager.php` under the namespace
   `Pixielity\Search\Services`.

### Requirement 8: Unified Search API (GET /api/search)

**User Story:** As a frontend developer, I want a single API endpoint to search
across multiple entity types simultaneously, so that I can build unified search
experiences like the POS Spotlight (⌘K).

#### Acceptance Criteria

1. THE `SearchController` SHALL expose a `GET /api/search` endpoint that accepts
   query parameters: `q` (search term, required), `entities` (comma-separated
   entity identifiers, optional — defaults to all indexed entities), `per_page`
   (results per entity, default 10), `page` (page number, default 1).
2. WHEN a search query is submitted, THE `SearchManager` SHALL execute searches
   across all requested entity types using their configured ES indexes via
   `pdphilip/elasticsearch`.
3. THE `SearchManager` SHALL return a `SearchResult` DTO containing results
   grouped by entity type, with each group including: items (array of search
   hits), total count, and highlights for matched terms.
4. THE `SearchResult` SHALL include metadata: total hits across all entities,
   query processing time in milliseconds, and the original query string.
5. WHILE a tenant context is active, THE `SearchManager` SHALL automatically
   search tenant-scoped indexes for tenant entities and global indexes for
   non-tenant entities.
6. WHEN the `entities` parameter is provided, THE `SearchManager` SHALL search
   only the specified entity types and return a validation error for
   unrecognized entity identifiers.

### Requirement 9: Entity-Specific Search API (GET /api/search/{entity})

**User Story:** As a frontend developer, I want to search within a specific
entity type with full filtering, sorting, and pagination support, so that I can
build entity-specific search pages like the admin event list.

#### Acceptance Criteria

1. THE `SearchController` SHALL expose a `GET /api/search/{entity}` endpoint
   that accepts query parameters: `q` (search term, required), `filters`
   (associative array of filterable attribute values), `sort` (field name with
   optional `:asc` or `:desc` suffix), `per_page` (default 20), `page` (default
   1).
2. WHEN filters are provided, THE `SearchManager` SHALL apply ES filter clauses
   using the entity's declared filterable fields from the framework's
   `IndexerRegistry`.
3. WHEN a sort parameter is provided, THE `SearchManager` SHALL apply ES sorting
   using the entity's declared sortable fields from the framework's
   `IndexerRegistry`.
4. IF a filter references a field not declared in the entity's filterable
   fields, THEN THE `SearchManager` SHALL return a validation error listing the
   allowed filterable fields.
5. IF a sort references a field not declared in the entity's sortable fields,
   THEN THE `SearchManager` SHALL return a validation error listing the allowed
   sortable fields.
6. THE response SHALL include: items (array of search hits with highlights),
   total count, current page, per-page count, and available facet distributions
   for the entity's filterable fields.

### Requirement 10: Autocomplete/Suggestions API (GET /api/search/suggest)

**User Story:** As a frontend developer, I want an autocomplete endpoint that
returns fast search suggestions as the user types, so that I can build
responsive search-as-you-type experiences.

#### Acceptance Criteria

1. THE `SearchController` SHALL expose a `GET /api/search/suggest` endpoint that
   accepts query parameters: `q` (partial search term, required), `entities`
   (comma-separated entity identifiers, optional), `limit` (max suggestions,
   default 5).
2. WHEN a suggestion query is submitted, THE `SearchManager` SHALL execute ES
   prefix/match_phrase_prefix queries across requested entities with a reduced
   result set (limited to `limit` per entity).
3. THE response SHALL return an array of `SearchSuggestion` DTOs containing:
   `text` (the suggested completion or match), `entity` (the entity type
   identifier), `id` (the record ID), and `highlight` (the matched portion with
   highlight markers).
4. THE suggestion endpoint SHALL prioritize response speed by requesting only
   `displayedAttributes` from ES and limiting result processing.
5. WHILE a tenant context is active, THE suggestion endpoint SHALL respect
   tenant-scoped index resolution.

### Requirement 11: Faceted Search API (GET /api/search/facets/{entity})

**User Story:** As a frontend developer, I want to retrieve available facet
values for an entity's filterable attributes, so that I can build filter UIs
with dynamic options.

#### Acceptance Criteria

1. THE `SearchController` SHALL expose a `GET /api/search/facets/{entity}`
   endpoint that returns the available facet distributions for the entity's
   declared filterable fields.
2. WHEN a facet request is submitted, THE `SearchManager` SHALL query ES using
   aggregation queries on all filterable fields of the specified entity.
3. THE response SHALL include an associative array keyed by field name, where
   each value is an array of facet values with their document counts.
4. THE facet endpoint SHALL accept an optional `q` parameter to return facet
   distributions scoped to a search query.
5. WHILE a tenant context is active, THE facet endpoint SHALL query the
   tenant-scoped index for the entity.

### Requirement 12: Search Result Highlighting

**User Story:** As a frontend developer, I want matched terms in search results
to be highlighted, so that I can visually indicate why a result matched the
query.

#### Acceptance Criteria

1. WHEN search results are returned, THE `SearchManager` SHALL include ES
   highlight data with matched terms wrapped in configurable highlight markers.
2. THE config file SHALL expose `search.highlight.pre_tag` (default: `<em>`) and
   `search.highlight.post_tag` (default: `</em>`) for customizing highlight
   markers.
3. THE search result items SHALL include a `_highlights` field containing an
   associative array of field names to highlighted values for fields that
   matched the query.
4. WHEN no fields match the query for a result item, THE `_highlights` field
   SHALL be an empty array.

### Requirement 13: Geo-Search Support

**User Story:** As a frontend developer, I want to search for venues and events
by geographic proximity, so that I can build location-based search features like
"find venues within radius".

#### Acceptance Criteria

1. WHEN a model's `#[Indexed]` attribute (from the framework) has a `geoField`
   configured, THE `IndexManager` SHALL configure the ES index mapping with
   `geo_point` type for the geo field via `pdphilip/elasticsearch`'s schema
   builder.
2. THE `IndexManager` SHALL transform the model's geo field into ES's geo-point
   format during indexing (accepting `{lat},{lng}` string or
   `['lat' => float, 'lng' => float]` array).
3. THE entity-specific search endpoint (`GET /api/search/{entity}`) SHALL accept
   optional `lat`, `lng`, and `radius` (in meters) query parameters for
   geo-filtering.
4. WHEN geo parameters are provided, THE `SearchManager` SHALL apply ES
   `geo_distance` filter to return only results within the specified radius.
5. WHEN geo parameters are provided, THE `SearchManager` SHALL include
   `_geoDistance` in each result item indicating the distance from the query
   point in meters, using ES's `sort` with `_geo_distance`.

### Requirement 14: Queued Index Build Jobs

**User Story:** As a developer, I want index build operations to be dispatched
as queued jobs, so that indexing does not block the request lifecycle and can be
retried on failure.

#### Acceptance Criteria

1. THE package SHALL provide an `IndexBuildJob` that accepts the entity class,
   record ID, and source description, and builds the ES document for that record
   using the `RecordBuilder` (framework contract implementation).
2. THE package SHALL provide an `IndexDeleteJob` that accepts the entity class
   and record ID, and removes the ES document from the index using the `Indexer`
   (framework contract implementation).
3. THE package SHALL provide a `BulkIndexJob` that accepts the entity class and
   a chunk of record IDs, and bulk-rebuilds documents for the `search:rebuild`
   command.
4. THE `IndexBuildJob` SHALL use the queue name from `search.queue` config
   (nullable, default null meaning sync/default queue).
5. WHEN the `IndexBuildJob` fails after all retries, THE job SHALL log the
   failure with the entity class, record ID, and error message, and dispatch a
   `DocumentIndexed` event (from the framework) with `BuildState::FAILED`.
6. THE observer chains (Requirement 5) SHALL dispatch `IndexBuildJob` and
   `IndexDeleteJob` instead of performing synchronous ES operations, ensuring
   non-blocking request handling.
7. ALL jobs SHALL resolve the correct tenant-scoped or global index name based
   on the entity's `isTenantScoped` flag from the framework's `IndexerRegistry`.
8. THE job classes SHALL reside in `packages/search/src/Jobs/` under the
   namespace `Pixielity\Search\Jobs`.

### Requirement 15: Artisan Commands (search:index, search:flush, search:rebuild, search:status)

**User Story:** As a developer, I want Artisan commands to manage ES indexes
from the CLI, so that I can perform index operations during deployment and
maintenance.

#### Acceptance Criteria

1. THE package SHALL provide a `search:index` command that creates ES indexes
   for all registered entities (from the framework's `IndexerRegistry`) or a
   specific entity via `--entity` option, with optional `--tenant` flag.
2. THE package SHALL provide a `search:flush` command that removes all documents
   from indexes for all registered entities (or a specific entity via `--entity`
   option), with optional `--tenant` flag.
3. THE package SHALL provide a `search:rebuild` command that flushes and
   re-imports all data for all registered entities (or a specific entity via
   `--entity` option), with optional `--tenant` flag and progress display using
   Laravel Prompts.
4. THE package SHALL provide a `search:status` command that displays the status
   of all indexes (document count, size, health status using the framework's
   `IndexStatus` enum) in a table format using Laravel Prompts.
5. ALL commands SHALL use Laravel Prompts for output formatting (tables,
   progress bars, info/warning/error messages) and SHALL NOT use `$this->info()`
   or `$this->error()`.
6. WHEN the `--tenant` flag is set to `all`, THE commands SHALL iterate over all
   tenants and perform the operation for each tenant's indexes.
7. THE `search:rebuild` command SHALL dispatch `BulkIndexJob`s in chunks for all
   records of the target entity, using the configured queue.
8. THE command classes SHALL reside in `packages/search/src/Commands/` under the
   namespace `Pixielity\Search\Commands`.

### Requirement 16: Tenant Lifecycle Listeners

**User Story:** As a platform operator, I want tenant indexes to be
automatically created when a tenant is created and deleted when a tenant is
removed, so that tenant search infrastructure is managed automatically.

#### Acceptance Criteria

1. WHEN a `TenantCreated` event is dispatched, THE package SHALL listen and
   create all tenant-scoped ES indexes for the new tenant with the configured
   mappings, analyzers, synonyms, and stop words, using the `IndexManager`.
2. WHEN a `TenantDeleted` event is dispatched, THE package SHALL listen and
   delete all tenant-scoped ES indexes belonging to the deleted tenant, using
   the `IndexManager`.
3. THE tenant lifecycle listeners SHALL read the list of tenant-scoped entities
   from the framework's `IndexerRegistry::tenantScoped()` method.
4. THE listeners SHALL reside in `packages/search/src/Listeners/` under the
   namespace `Pixielity\Search\Listeners`.

### Requirement 17: SQL LIKE Fallback

**User Story:** As a platform operator, I want search to gracefully fall back to
SQL LIKE queries when Elasticsearch is unavailable, so that basic search
functionality is maintained during search engine outages.

#### Acceptance Criteria

1. WHEN the ES service is unreachable and fallback is enabled in config, THE
   `SearchManager` SHALL fall back to executing SQL LIKE queries using the
   existing `RequestSearchCriteria` from the CRUD package.
2. WHEN fallback mode is active, THE `SearchManager` SHALL search flat fields
   only — embedded relationship search (`#[EmbedOne]`/`#[EmbedMany]`) SHALL NOT
   be available in fallback mode.
3. WHEN fallback mode is active, THE `SearchManager` SHALL log a warning
   indicating that search is operating in fallback mode and dispatch a
   `SearchFallbackActivated` event.
4. WHEN fallback mode is active, THE `SearchResult` SHALL include a
   `fallback: true` flag in the metadata to inform the frontend that results may
   have reduced relevance.
5. WHEN ES becomes available again, THE `SearchManager` SHALL automatically
   resume using ES without requiring a restart.
6. THE `SearchManager` SHALL check ES availability using a lightweight cluster
   health check via `pdphilip/elasticsearch`'s `Connection::getClientInfo()`
   with a configurable timeout (`search.fallback.health_check_timeout`, default:
   2 seconds).

### Requirement 18: Health Check (#[AsHealthCheck])

**User Story:** As a platform operator, I want a health check for the search
infrastructure, so that monitoring systems can detect Elasticsearch issues.

#### Acceptance Criteria

1. THE package SHALL provide a `SearchHealthCheck` class annotated with
   `#[AsHealthCheck]` that checks ES connectivity and index health.
2. THE `SearchHealthCheck` SHALL verify that the ES cluster is reachable and
   responding using `pdphilip/elasticsearch`'s `Connection::getClientInfo()`.
3. THE `SearchHealthCheck` SHALL verify that all expected indexes exist (based
   on the framework's `IndexerRegistry`) and report their health status using
   the framework's `IndexStatus` enum (GREEN/YELLOW/RED/UNKNOWN).
4. IF the ES cluster is unreachable, THEN THE `SearchHealthCheck` SHALL report a
   failure with the connection error details.
5. IF any expected indexes are missing, THEN THE `SearchHealthCheck` SHALL
   report a warning listing the missing indexes.
6. THE `SearchHealthCheck` SHALL report index sync status: count of ES documents
   vs database records for each indexed entity (ElasticLens LensState pattern).
7. THE `SearchHealthCheck` SHALL reside in
   `packages/search/src/HealthChecks/SearchHealthCheck.php` under the namespace
   `Pixielity\Search\HealthChecks`.

### Requirement 19: Domain Events (#[AsEvent])

**User Story:** As a developer in another package, I want to listen to search
lifecycle events, so that I can trigger side effects like cache invalidation or
notifications.

#### Acceptance Criteria

1. THE package SHALL dispatch the following index lifecycle events annotated
   with `#[AsEvent]`: `IndexCreated`, `IndexRebuilt`, `IndexFlushed`,
   `IndexDeleted`, each containing the entity class (class-string), index name
   (string), and optional tenant key (int|string|null).
2. THE package SHALL dispatch a `SearchPerformed` event annotated with
   `#[AsEvent]` after each search operation, containing the query string, entity
   types, result count, and response time in milliseconds.
3. THE package SHALL dispatch a `SearchFallbackActivated` event annotated with
   `#[AsEvent]` when the system switches to SQL LIKE fallback mode, containing
   the error reason.
4. ALL events SHALL be `final readonly` DTOs carrying scalar values (not model
   instances) following the Pixielity event convention.
5. THE package SHALL NOT redefine the `DocumentIndexed` event — that event is
   owned by the framework Indexer sub-package and dispatched by the `Indexer`
   implementation after successful indexing.
6. THE event classes SHALL reside in `packages/search/src/Events/` under the
   namespace `Pixielity\Search\Events`.

### Requirement 20: Search Analytics

**User Story:** As a platform operator, I want to track what users search for
and which results they interact with, so that I can improve search relevance and
understand user behavior.

#### Acceptance Criteria

1. THE `SearchAnalyticsRepository` SHALL persist search query records in
   PostgreSQL containing: query string, entity types searched, result count per
   entity, total result count, user ID (nullable), tenant ID (nullable),
   response time in milliseconds, and timestamp.
2. WHEN a search query returns zero results, THE `SearchAnalyticsRepository`
   SHALL flag the record as a zero-result query for reporting.
3. THE `SearchController` SHALL expose a `POST /api/search/analytics/click`
   endpoint that records a click-through event containing: query string, clicked
   entity type, clicked record ID, result position, user ID, and tenant ID.
4. THE `SearchController` SHALL expose a `GET /api/search/analytics/summary`
   endpoint that returns aggregated analytics: top queries, zero-result queries,
   average result count, average response time, and click-through rate,
   filterable by date range and tenant.
5. THE config file SHALL expose `search.analytics.enabled` (default: true) and
   `search.analytics.retention_days` (default: 90) for controlling analytics
   collection and data retention.
6. WHEN analytics is disabled via config, THE `SearchManager` SHALL skip
   analytics recording without affecting search functionality.
7. THE analytics data SHALL be stored in PostgreSQL tables (not ES), configured
   via `search.analytics.table` (default: `search_analytics`) and
   `search.analytics.clicks_table` (default: `search_clicks`).

### Requirement 21: Search Enums (Package-Owned Only)

**User Story:** As a developer, I want typed enums for search-specific constants
that are not already provided by the framework Indexer sub-package.

#### Acceptance Criteria

1. THE package SHALL provide a `SearchScope` enum with cases: `ALL` (`'all'`),
   `TENANT` (`'tenant'`), `GLOBAL` (`'global'`) as a backed string enum with
   `use Enum` trait, `#[Label]`, and `#[Description]` on each case, representing
   the scope of a search operation.
2. THE package SHALL NOT redefine `IndexStatus`, `BuildState`, or
   `AggregationType` enums — those are owned by the framework Indexer
   sub-package.
3. THE package SHALL use the framework's `IndexStatus` enum for index health
   reporting and the framework's `BuildState` enum for document build state
   tracking.
4. THE enum classes SHALL reside in `packages/search/src/Enums/` under the
   namespace `Pixielity\Search\Enums`.

### Requirement 22: Configuration

**User Story:** As a developer, I want a publishable config file for the search
package, so that I can customize Elasticsearch behavior per environment.

#### Acceptance Criteria

1. THE config file `config/search.php` SHALL expose: `search.connection`
   (string, the `pdphilip/elasticsearch` database connection name, default
   `'elasticsearch'`).
2. THE config file SHALL expose: `search.index.tenant_prefix_template` (default:
   `tenant_%tenant%_`) to allow customization of the tenant prefix pattern used
   by the `SearchBootstrapper`.
3. THE config file SHALL expose: `search.pagination.default_per_page` (default:
   20), `search.pagination.max_per_page` (default: 100).
4. THE config file SHALL expose: `search.highlight.pre_tag` (default: `<em>`),
   `search.highlight.post_tag` (default: `</em>`).
5. THE config file SHALL expose: `search.analytics.enabled` (default: true),
   `search.analytics.retention_days` (default: 90), `search.analytics.table`
   (default: `search_analytics`), `search.analytics.clicks_table` (default:
   `search_clicks`).
6. THE config file SHALL expose: `search.suggest.default_limit` (default: 5),
   `search.suggest.max_limit` (default: 20).
7. THE config file SHALL expose: `search.fallback.enabled` (default: true),
   `search.fallback.health_check_timeout` (default: 2 seconds) to control SQL
   LIKE fallback behavior.
8. THE config file SHALL expose: `search.queue` (nullable string, default null)
   for the queue name used by `IndexBuildJob`, `IndexDeleteJob`, and
   `BulkIndexJob` dispatches.
9. THE config file SHALL NOT expose ES host/auth settings — those are configured
   in Laravel's `config/database.php` under the `pdphilip/elasticsearch`
   connection, following the driver's conventions.
