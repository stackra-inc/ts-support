# Implementation Plan: Search Package (`pixielity/laravel-search`)

## Overview

Implement the Elasticsearch search package that builds on the framework Indexer
sub-package. Uses `pdphilip/elasticsearch` v5 as the ES Eloquent driver. All
code at `packages/search/` under namespace `Pixielity\Search`. Framework Indexer
sub-package must be implemented first.

## Tasks

- [x] 1. Package scaffolding, configuration, and service provider
  - [x] 1.1 Create `packages/search/composer.json` with namespace
        `Pixielity\Search`, PSR-4 autoload from `src/`, dependencies on
        `pixielity/laravel-framework`, `pdphilip/elasticsearch: ^5.0`,
        `pixielity/laravel-discovery`, `pixielity/laravel-crud`,
        `pixielity/laravel-database`, `pixielity/laravel-tenancy`. Ensure
        `laravel/scout`, `meilisearch/meilisearch-php`, `pdphilip/elasticlens`,
        `matchish/laravel-scout-elasticsearch`, `elasticsearch/elasticsearch`
        are NOT listed.
    - _Requirements: 1.3, 1.4, 1.5_
  - [x] 1.2 Create `packages/search/module.json` with module name `Search`,
        alias, version, active flag
    - _Requirements: 1.6_
  - [x] 1.3 Create `packages/search/config/search.php` with all config keys:
        `connection`, `index.tenant_prefix_template`,
        `pagination.default_per_page`, `pagination.max_per_page`,
        `highlight.pre_tag`, `highlight.post_tag`, `analytics.enabled`,
        `analytics.retention_days`, `analytics.table`, `analytics.clicks_table`,
        `suggest.default_limit`, `suggest.max_limit`, `fallback.enabled`,
        `fallback.health_check_timeout`, `queue`
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9_
  - [x] 1.4 Create `SearchServiceProvider` at
        `src/Providers/SearchServiceProvider.php` with
        `#[Module(name: 'Search', priority: 55)]`,
        `#[LoadsResources(migrations: true, config: true, routes: true, commands: true, publishables: true)]`,
        implementing `HasBindings`, registering `SearchManagerInterface` and
        `SearchAnalyticsRepositoryInterface` as scoped bindings
    - _Requirements: 1.1, 1.2_
  - [x] 1.5 Create standard directory structure: `Contracts/`, `Controllers/`,
        `Concerns/`, `Enums/`, `Events/`, `Services/`, `Providers/`,
        `Repositories/`, `Commands/`, `Bootstrappers/`, `HealthChecks/`,
        `Jobs/`, `Observers/`, `Data/`, `Listeners/`, `Models/`, `Migrations/`,
        `routes/`
    - _Requirements: 1.6_

- [x] 2. Contracts, DTOs, enums, and events
  - [x] 2.1 Create `SearchManagerInterface` at
        `src/Contracts/SearchManagerInterface.php` with
        `#[Bind(SearchManager::class)]` and method signatures: `search()`,
        `searchEntity()`, `suggest()`, `facets()`, `isAvailable()`
    - _Requirements: 7.1, 7.2_
  - [x] 2.2 Create `SearchAnalyticsRepositoryInterface` at
        `src/Contracts/SearchAnalyticsRepositoryInterface.php` with
        `#[Bind(SearchAnalyticsRepository::class)]` and method signatures:
        `recordSearch()`, `recordClick()`, `getSummary()`, `getTopQueries()`,
        `getZeroResultQueries()`
    - _Requirements: 20.1, 20.3, 20.4_
  - [x] 2.3 Create DTOs at `src/Data/`: `SearchResult`, `EntityResult`,
        `SearchSuggestion`, `IndexStatusDTO` — all `final readonly` with
        comprehensive docblocks
    - _Requirements: 8.3, 8.4, 9.6, 10.3, 3.6_
  - [x] 2.4 Create `SearchScope` enum at `src/Enums/SearchScope.php` with cases
        `ALL`, `TENANT`, `GLOBAL` as backed string enum with `use Enum`,
        `#[Label]`, `#[Description]` on each case
    - _Requirements: 21.1, 21.2, 21.3_
  - [x] 2.5 Create domain events at `src/Events/`: `IndexCreated`,
        `IndexRebuilt`, `IndexFlushed`, `IndexDeleted` (with `entityClass`,
        `indexName`, `tenantKey`), `SearchPerformed` (with `query`, `entities`,
        `resultCount`, `responseTimeMs`), `SearchFallbackActivated` (with
        `reason`) — all `final readonly` with `#[AsEvent]`, scalar properties
        only
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_
  - [ ]\* 2.6 Write property test for DTO construction round-trip
    - **Property 1: DTO construction round-trip**
    - **Validates: Requirements 8.3, 8.4, 9.6, 10.3**
  - [ ]\* 2.7 Write property test for package events are final readonly DTOs
    with scalar properties
    - **Property 18: Package events are final readonly DTOs with scalar
      properties**
    - **Validates: Requirements 19.4**
  - [ ]\* 2.8 Write unit tests for contracts, DTOs, enums, and events structure
    - Test `SearchScope` enum cases, backing values, Label/Description
      attributes
    - Test all events have `#[AsEvent]`, are `final readonly`
    - Test all DTOs are `final readonly` with correct constructor parameters
    - _Requirements: 21.1, 19.4_

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Framework contract implementations (SearchIndexer, SearchIndexManager,
     SearchRecordBuilder)
  - [x] 4.1 Create `SearchIndexer` at `src/Services/SearchIndexer.php`
        implementing `IndexerInterface` with `#[Scoped]`. Implement `index()`
        (build doc via RecordBuilder, persist to ES), `remove()` (delete by PK),
        `flush()` (delete-by-query match_all), `rebuild()` (flush + dispatch
        BulkIndexJob chunks with progress callback). Resolve tenant/global index
        from `IndexerRegistry`.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  - [x] 4.2 Create `SearchIndexManager` at `src/Services/SearchIndexManager.php`
        implementing `IndexManagerInterface` with `#[Scoped]`. Implement
        `createIndex()` (Schema\Builder with mappings, analyzers, geo_point,
        nested objects), `deleteIndex()` (dropIfExists), `rebuildIndex()`
        (delete + create + Indexer::rebuild), `flushIndex()` (delegate to
        Indexer::flush), `getIndexStatus()` (catIndices → IndexStatusDTO),
        `resolveIndexName()` (tenant prefix logic). Dispatch `IndexCreated`,
        `IndexRebuilt`, `IndexFlushed`, `IndexDeleted` events.
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 13.1_
  - [x] 4.3 Create `SearchRecordBuilder` at
        `src/Services/SearchRecordBuilder.php` implementing
        `RecordBuilderInterface` with `#[Scoped]`. Implement `build()` (load
        model, map, persist to ES, dispatch DocumentIndexed), `map()`
        (excludeIndex check, extract searchable fields, resolve
        EmbedOne/EmbedMany with limit/orderBy, transform geo field to
        geo_point), `dryRun()` (build without ES write).
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 13.2_
  - [ ]\* 4.4 Write property test for index name resolution follows
    tenant/global pattern
    - **Property 3: Index name resolution follows tenant/global pattern**
    - **Validates: Requirements 2.7, 14.7**
  - [ ]\* 4.5 Write property test for document building includes all searchable
    fields and embed field names
    - **Property 4: Document building includes all searchable fields and embed
      field names**
    - **Validates: Requirements 4.3, 4.4**
  - [ ]\* 4.6 Write property test for EmbedMany respects limit constraint
    - **Property 5: EmbedMany respects limit constraint**
    - **Validates: Requirements 4.5**
  - [ ]\* 4.7 Write property test for excludeIndex returns null from map
    - **Property 6: excludeIndex returns null from map**
    - **Validates: Requirements 4.6**
  - [ ]\* 4.8 Write property test for rebuild chunking covers all record IDs
    - **Property 2: Rebuild chunking covers all record IDs**
    - **Validates: Requirements 2.6**
  - [ ]\* 4.9 Write property test for geo field transformation produces valid ES
    geo_point
    - **Property 14: Geo field transformation produces valid ES geo_point**
    - **Validates: Requirements 13.2**
  - [ ]\* 4.10 Write unit tests for SearchIndexer, SearchIndexManager,
    SearchRecordBuilder
    - Mock ES Connection, Schema Builder, IndexerRegistry
    - Verify `index()` calls build + persist, `remove()` calls delete, `flush()`
      calls delete-by-query
    - Verify `createIndex()` creates with correct mappings/analyzers, events
      dispatched
    - Verify `build()` loads model + embeds, `dryRun()` skips ES write
    - _Requirements: 2.3, 2.4, 2.5, 3.3, 3.4, 3.5, 3.7, 4.3, 4.7_

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Observer chains and queued jobs
  - [x] 6.1 Create `ObserverRegistry` at `src/Observers/ObserverRegistry.php`
        that reads `IndexerRegistry` config and registers `BaseModelObserver` on
        base models and `EmbeddedModelTrigger` on embedded relationship models
        from `#[EmbedOne]`/`#[EmbedMany]` configs. Invoked from framework's
        `Indexable` trait `bootIndexable()`.
    - _Requirements: 5.1, 5.6_
  - [x] 6.2 Create `BaseModelObserver` at `src/Observers/BaseModelObserver.php`
        that dispatches `IndexBuildJob` on `saved` (created/updated),
        `IndexDeleteJob` on `deleting`, handles soft-delete awareness on
        `deleted`/`restored`
    - _Requirements: 5.2, 5.7_
  - [x] 6.3 Create `EmbeddedModelTrigger` at
        `src/Observers/EmbeddedModelTrigger.php` that traverses relationship
        chain upstream to parent `#[Indexed]` model(s) and dispatches
        `IndexBuildJob`(s) in chunked queries (100 records per chunk)
    - _Requirements: 5.3, 5.4, 5.5_
  - [x] 6.4 Create `IndexBuildJob` at `src/Jobs/IndexBuildJob.php` implementing
        `ShouldQueue` with `entityClass`, `id`, `source` properties. Uses queue
        from `search.queue` config. Delegates to
        `RecordBuilderInterface::build()`. On failure: log error, dispatch
        `DocumentIndexed` with `BuildState::FAILED`.
    - _Requirements: 14.1, 14.4, 14.5, 14.6, 14.7, 14.8_
  - [x] 6.5 Create `IndexDeleteJob` at `src/Jobs/IndexDeleteJob.php`
        implementing `ShouldQueue` with `entityClass`, `id` properties.
        Delegates to `IndexerInterface::remove()`.
    - _Requirements: 14.2, 14.7, 14.8_
  - [x] 6.6 Create `BulkIndexJob` at `src/Jobs/BulkIndexJob.php` implementing
        `ShouldQueue` with `entityClass`, `ids` array. Iterates IDs and
        delegates each to `RecordBuilderInterface::build()`.
    - _Requirements: 14.3, 14.7, 14.8_
  - [ ]\* 6.7 Write unit tests for observer chain and jobs
    - Verify `ObserverRegistry::register()` attaches observers to base and
      embedded models
    - Verify `BaseModelObserver::saved()` dispatches `IndexBuildJob`,
      `deleting()` dispatches `IndexDeleteJob`
    - Verify `EmbeddedModelTrigger` traverses upstream and dispatches chunked
      jobs
    - Verify job queue configuration from config
    - _Requirements: 5.1, 5.2, 5.3, 14.1, 14.2, 14.3_

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. SearchBootstrapper and tenant lifecycle listeners
  - [x] 8.1 Create `SearchBootstrapper` at
        `src/Bootstrappers/SearchBootstrapper.php` implementing
        `TenancyBootstrapperInterface` with `#[AsBootstrapper(priority: 110)]`.
        Store original prefix, set `tenant_{key}_` prefix on bootstrap via
        `Connection::setIndexPrefix()`, restore on revert. Global indexes
        unaffected.
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [x] 8.2 Create `CreateTenantIndexes` listener at
        `src/Listeners/CreateTenantIndexes.php` that listens to `TenantCreated`
        and creates all tenant-scoped indexes via `IndexManager::createIndex()`
        for each entity in `IndexerRegistry::tenantScoped()`
    - _Requirements: 16.1, 16.3, 16.4_
  - [x] 8.3 Create `DeleteTenantIndexes` listener at
        `src/Listeners/DeleteTenantIndexes.php` that listens to `TenantDeleted`
        and deletes all tenant-scoped indexes via `IndexManager::deleteIndex()`
    - _Requirements: 16.2, 16.3, 16.4_
  - [ ]\* 8.4 Write property test for bootstrapper prefix round-trip
    - **Property 7: Bootstrapper prefix round-trip**
    - **Validates: Requirements 6.2, 6.3, 6.4**
  - [ ]\* 8.5 Write unit tests for SearchBootstrapper and tenant lifecycle
    listeners
    - Verify bootstrap sets correct prefix, revert restores original
    - Verify `CreateTenantIndexes` calls `IndexManager::createIndex()` for each
      tenant-scoped entity
    - Verify `DeleteTenantIndexes` calls `IndexManager::deleteIndex()` for each
      tenant-scoped entity
    - _Requirements: 6.1, 6.2, 6.3, 16.1, 16.2_

- [x] 9. SearchManager service
  - [x] 9.1 Create `SearchManager` at `src/Services/SearchManager.php`
        implementing `SearchManagerInterface` with `#[Bind]` and `#[Scoped]`.
        Implement `search()` for unified cross-entity search: build ES bool
        queries with `multi_match` across searchable fields, `fuzziness: 'AUTO'`
        when `typoTolerance` is true, highlights with configurable pre/post
        tags, aggregations for facets. Return `SearchResult` DTO with metadata
        (totalHits, queryTimeMs, query, fallback flag). Dispatch
        `SearchPerformed` event. Record analytics if enabled.
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 8.1, 8.2, 8.3, 8.4,
      8.5, 8.6_
  - [x] 9.2 Implement `searchEntity()` for entity-specific search: apply ES
        filter clauses from filterable fields, sorting from sortable fields,
        pagination. Validate filter/sort fields against declared fields, return
        validation errors for undeclared fields. Return `EntityResult` DTO with
        items, total, page, perPage, facets, highlights.
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  - [x] 9.3 Implement `suggest()` for autocomplete: ES `match_phrase_prefix`
        queries across requested entities with reduced result set, return
        `SearchSuggestion` DTOs with text, entity, id, highlight, score. Request
        only `displayedAttributes`.
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - [x] 9.4 Implement `facets()` for faceted search: ES aggregation queries on
        all filterable fields, return associative array keyed by field name with
        facet values and document counts. Accept optional `q` parameter for
        scoped facets.
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  - [x] 9.5 Implement highlight support: include ES highlight data with
        configurable `pre_tag`/`post_tag` from config, include `_highlights`
        field in result items, empty array when no matches
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  - [x] 9.6 Implement geo-search support: accept `lat`, `lng`, `radius`
        parameters in entity search, apply `geo_distance` filter, include
        `_geoDistance` in results via ES `sort` with `_geo_distance`
    - _Requirements: 13.3, 13.4, 13.5_
  - [x] 9.7 Implement SQL LIKE fallback: check ES availability via
        `Connection::getClientInfo()` with configurable timeout, fall back to
        `RequestSearchCriteria` when unavailable and fallback enabled, dispatch
        `SearchFallbackActivated` event, set `fallback: true` in `SearchResult`,
        auto-resume ES when available
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_
  - [x] 9.8 Implement `isAvailable()` method for ES health check
    - _Requirements: 7.1_
  - [ ]\* 9.9 Write property test for search query DSL includes searchable
    fields with conditional fuzziness
    - **Property 8: Search query DSL includes searchable fields with conditional
      fuzziness**
    - **Validates: Requirements 7.3, 7.4**
  - [ ]\* 9.10 Write property test for filter and sort validation rejects
    undeclared fields
    - **Property 9: Filter and sort validation rejects undeclared fields**
    - **Validates: Requirements 9.4, 9.5**
  - [ ]\* 9.11 Write property test for filter clauses generated from filterable
    fields
    - **Property 10: Filter clauses generated from filterable fields**
    - **Validates: Requirements 9.2**
  - [ ]\* 9.12 Write property test for sort clauses generated from sortable
    fields
    - **Property 11: Sort clauses generated from sortable fields**
    - **Validates: Requirements 9.3**
  - [ ]\* 9.13 Write property test for aggregation query contains terms for
    filterable fields
    - **Property 12: Aggregation query contains terms for filterable fields**
    - **Validates: Requirements 11.2**
  - [ ]\* 9.14 Write property test for highlight configuration uses configured
    tags
    - **Property 13: Highlight configuration uses configured tags**
    - **Validates: Requirements 12.1**
  - [ ]\* 9.15 Write property test for geo distance filter generation
    - **Property 15: Geo distance filter generation**
    - **Validates: Requirements 13.4**
  - [ ]\* 9.16 Write property test for unrecognized entity validation
    - **Property 16: Unrecognized entity validation**
    - **Validates: Requirements 8.6**
  - [ ]\* 9.17 Write unit tests for SearchManager
    - Test unified search builds correct ES query DSL
    - Test entity search applies filters, sorts, pagination
    - Test suggest returns SearchSuggestion DTOs
    - Test facets returns aggregation results
    - Test geo-search applies geo_distance filter
    - Test fallback mode activates when ES unavailable
    - Test fallback flag in SearchResult
    - Test auto-resume when ES recovers
    - _Requirements: 7.3, 7.4, 8.6, 9.2, 9.3, 9.4, 9.5, 10.2, 11.2, 12.1, 13.4,
      17.1, 17.4, 17.5_

- [x] 10. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Search analytics (models, migrations, repository)
  - [x] 11.1 Create migration `create_search_analytics_table` at
        `src/Migrations/` with columns: `id`, `query`, `entities` (json),
        `total_results`, `result_counts` (json), `is_zero_result` (boolean),
        `user_id` (nullable, indexed), `tenant_id` (nullable, indexed),
        `response_time_ms` (float), `created_at` (timestamp). Add composite
        indexes on `(query, created_at)` and `(tenant_id, created_at)`.
    - _Requirements: 20.1, 20.7_
  - [x] 11.2 Create migration `create_search_clicks_table` at `src/Migrations/`
        with columns: `id`, `query`, `entity`, `record_id`, `position`
        (integer), `user_id` (nullable, indexed), `tenant_id` (nullable,
        indexed), `created_at` (timestamp). Add composite index on
        `(query, entity, created_at)`.
    - _Requirements: 20.3, 20.7_
  - [x] 11.3 Create `SearchAnalytic` model at `src/Models/SearchAnalytic.php`
        with table from config, casts for `entities` (array), `result_counts`
        (array), `is_zero_result` (boolean), `response_time_ms` (float)
    - _Requirements: 20.1, 20.7_
  - [x] 11.4 Create `SearchClick` model at `src/Models/SearchClick.php` with
        table from config, casts for `position` (integer)
    - _Requirements: 20.3, 20.7_
  - [x] 11.5 Create `SearchAnalyticsRepository` at
        `src/Repositories/SearchAnalyticsRepository.php` implementing
        `SearchAnalyticsRepositoryInterface`. Implement `recordSearch()`
        (persist query record, flag zero-result), `recordClick()` (persist click
        event), `getSummary()` (aggregated analytics with date/tenant filters),
        `getTopQueries()`, `getZeroResultQueries()`.
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_
  - [ ]\* 11.6 Write property test for zero-result analytics flag
    - **Property 17: Zero-result analytics flag**
    - **Validates: Requirements 20.2**
  - [ ]\* 11.7 Write unit tests for search analytics
    - Verify `recordSearch()` persists correct data
    - Verify zero-result flag set when totalResults is 0
    - Verify `recordClick()` persists click event
    - Verify analytics skipped when config disabled
    - _Requirements: 20.1, 20.2, 20.3, 20.6_

- [x] 12. SearchController and API routes
  - [x] 12.1 Create `SearchController` at `src/Controllers/SearchController.php`
        with constructor injection of `SearchManagerInterface` and
        `SearchAnalyticsRepositoryInterface`. Implement: `search()` (GET
        /api/search — params: q, entities, per_page, page), `searchEntity()`
        (GET /api/search/{entity} — params: q, filters, sort, per_page, page,
        lat, lng, radius), `suggest()` (GET /api/search/suggest — params: q,
        entities, limit), `facets()` (GET /api/search/facets/{entity} — params:
        q), `recordClick()` (POST /api/search/analytics/click),
        `analyticsSummary()` (GET /api/search/analytics/summary)
    - _Requirements: 8.1, 9.1, 10.1, 11.1, 20.3, 20.4_
  - [x] 12.2 Create `src/routes/api.php` with route definitions for all
        controller endpoints
    - _Requirements: 8.1, 9.1, 10.1, 11.1_
  - [ ]\* 12.3 Write unit/integration tests for SearchController
    - HTTP tests for all endpoints with mocked SearchManager
    - Verify request validation (required `q` param, entity validation,
      filter/sort validation)
    - Verify response structure matches DTO format
    - _Requirements: 8.1, 8.6, 9.1, 9.4, 9.5, 10.1, 11.1_

- [x] 13. Artisan commands
  - [x] 13.1 Create `IndexCommand` at `src/Commands/IndexCommand.php`
        (`search:index`) with `--entity` and `--tenant` options. Delegates to
        `IndexManager::createIndex()`. Uses Laravel Prompts for output. When
        `--tenant=all`, iterates all tenants.
    - _Requirements: 15.1, 15.5, 15.6, 15.8_
  - [x] 13.2 Create `FlushCommand` at `src/Commands/FlushCommand.php`
        (`search:flush`) with `--entity` and `--tenant` options. Delegates to
        `IndexManager::flushIndex()`. Uses Laravel Prompts.
    - _Requirements: 15.2, 15.5, 15.6, 15.8_
  - [x] 13.3 Create `RebuildCommand` at `src/Commands/RebuildCommand.php`
        (`search:rebuild`) with `--entity` and `--tenant` options. Delegates to
        `IndexManager::rebuildIndex()` with progress display via Laravel
        Prompts. Dispatches `BulkIndexJob`s in chunks.
    - _Requirements: 15.3, 15.5, 15.6, 15.7, 15.8_
  - [x] 13.4 Create `StatusCommand` at `src/Commands/StatusCommand.php`
        (`search:status`). Displays index status table (doc count, size, health
        via `IndexStatus` enum) using Laravel Prompts.
    - _Requirements: 15.4, 15.5, 15.8_
  - [ ]\* 13.5 Write unit tests for Artisan commands
    - Mock `IndexManager`, verify correct methods called with correct arguments
    - Verify `--tenant=all` iterates all tenants
    - Verify output uses Laravel Prompts (no `$this->info()`)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.6_

- [x] 14. Health check
  - [x] 14.1 Create `SearchHealthCheck` at
        `src/HealthChecks/SearchHealthCheck.php` with `#[AsHealthCheck]`
        implementing `HealthCheckInterface`. Check ES connectivity via
        `Connection::getClientInfo()`, verify all expected indexes exist (from
        `IndexerRegistry`), report health per index via `IndexStatus` enum,
        report sync status (ES doc count vs DB record count per entity). Report
        failure on unreachable cluster, warning on missing indexes.
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_
  - [ ]\* 14.2 Write unit tests for SearchHealthCheck
    - Mock ES connection and registry
    - Verify cluster check, index existence, sync status reporting
    - _Requirements: 18.2, 18.3, 18.4, 18.5, 18.6_

- [x] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document
- Unit tests validate specific examples and edge cases
- Framework Indexer sub-package (`packages/framework/src/Indexer/`) must be
  implemented before this package
- All PHP files must have `declare(strict_types=1)`, comprehensive docblocks,
  and follow Pixielity code style
- Uses `pdphilip/elasticsearch` v5 — no Scout, no raw ES client, no Meilisearch
