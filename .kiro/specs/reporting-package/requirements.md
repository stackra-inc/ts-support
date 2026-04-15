# Requirements Document — Reporting Package (`pixielity/laravel-reporting`)

## Introduction

The `pixielity/laravel-reporting` package provides the reporting and analytics
engine for the MNGO venue management platform. It builds on top of the framework
Indexer sub-package (`packages/framework/src/Indexer/`) which owns the
`#[Aggregatable]` attribute, `AggregationType` enum, `IndexerRegistry`, and
`IndexConfigurationDTO`, and the search package (`packages/search/`) which owns
the Elasticsearch implementation via `pdphilip/elasticsearch`, `SearchManager`,
and `IndexManager`.

This package executes ES aggregation queries (terms, sum, avg, date_histogram,
range, geo, cardinality, percentiles) on the same indexes that the search
package manages. There is no separate data store, no materialized views, no SaaS
analytics service. Reports are ES aggregation queries on existing indexed data,
with results cached in PostgreSQL for historical access.

The package introduces the `#[AsReport]` attribute for declaring pre-built
report classes, a `ReportManager` service for executing reports and ad-hoc
aggregations, scheduling support for automated report generation, and
integration with the import-export package's `ExportManager` for
CSV/XLSX/JSON/PDF export. It also provides a REST API for report execution,
export, and historical access, plus domain events for cross-package integration.

### Architecture

```
framework/src/Indexer/          ← Foundation (owns #[Aggregatable], AggregationType enum, IndexerRegistry)
packages/search/                ← ES implementation (manages indexes, provides ES connection via pdphilip/elasticsearch)
packages/reporting/             ← THIS SPEC (report definitions, aggregation queries, scheduling, export)
packages/import-export/         ← Export engine (CSV, XLSX, JSON, PDF — used by reporting for exports)
```

### What This Package Owns

1. **`#[AsReport]` attribute** — declares report classes with metadata (name,
   label, entity, schedule)
2. **`ReportInterface` contract** — defines the report class API (aggregations,
   filters, default date range)
3. **`ReportManager` service** — discovers reports, executes ES aggregations,
   validates aggregatable fields, supports ad-hoc queries
4. **Report scheduling** — auto-registers scheduled reports with Laravel's
   scheduler, stores results in PostgreSQL
5. **Report export** — integrates with import-export package's `ExportManager`
   for CSV/XLSX/JSON/PDF
6. **Report API** — REST endpoints for listing, executing, exporting, ad-hoc
   aggregation, and historical results
7. **Domain events** — `ReportGenerated`, `ReportExported`, `ReportScheduled`
8. **MNGO Phase 1 report definitions** — sales, attendance, POS, membership,
   promotion, B2B, access control reports

### Key Design Decisions

- Reports are ES aggregation queries on the same indexes the search package
  manages
- `#[Aggregatable]` on models (framework) declares which fields support
  aggregations
- `#[AsReport]` on report classes (this package) defines pre-built report
  configurations
- Ad-hoc aggregations are supported for AI-driven reporting via the AI Gateway
- Report results are stored in PostgreSQL `report_results` table for historical
  access
- Scheduled reports use Laravel's scheduler (cron expressions in `#[AsReport]`)
- Export uses the import-export package's `ExportManager` (no duplication)
- Tenant-scoped via the search package's `SearchBootstrapper` (ES connection
  prefix)
- NO direct ES dependency — uses search package's ES connection
- Uses `Illuminate\Container\Attributes\Bind` and
  `Illuminate\Container\Attributes\Scoped`

## Glossary

- **Report_Manager**: The core orchestration service (`ReportManagerInterface`)
  that discovers all `#[AsReport]` classes, executes reports by building ES
  aggregation queries on the search package's ES connection, validates
  aggregation requests against `#[Aggregatable]` fields from the framework's
  `IndexerRegistry`, and supports ad-hoc aggregation queries.
- **Report_Interface**: The contract (`ReportInterface`) that all report classes
  implement, defining `aggregations()` (ES aggregation definitions), `filters()`
  (available filter parameters), and `defaultDateRange()` (default date range
  for the report).
- **AsReport_Attribute**: The `#[AsReport]` PHP attribute placed on report
  classes to declare metadata: `name` (unique slug), `label` (human-readable
  name), `entity` (class-string of the indexed model), and `schedule` (nullable
  cron expression for automated execution).
- **Report_Registry**: A boot-time registry that discovers all `#[AsReport]`
  classes via the Discovery facade and stores their configurations for fast
  lookup.
- **Report_Result**: A readonly DTO containing the outcome of a report
  execution: report name, aggregation data (nested associative array), applied
  filters, date range, execution time in milliseconds, and timestamp.
- **Report_Result_Model**: An Eloquent model backed by the PostgreSQL
  `report_results` table that stores historical report execution results for
  scheduled and on-demand reports.
- **Aggregation_Builder**: A service that translates report aggregation
  definitions and ad-hoc aggregation requests into ES aggregation query DSL,
  executed via the search package's `pdphilip/elasticsearch` connection.
- **Report_Scheduler**: A service that reads `schedule` from `#[AsReport]`
  attributes and registers scheduled report executions with Laravel's scheduler
  during the service provider's boot phase.
- **Report_Export_Service**: A service that takes a `Report_Result` and
  delegates to the import-export package's `ExportManager` for CSV/XLSX/JSON/PDF
  file generation.
- **Report_Controller**: The REST API controller exposing endpoints for listing
  reports, executing reports, exporting results, ad-hoc aggregation, and
  historical result retrieval.
- **Report_Service_Provider**: The package's service provider annotated with
  `#[Module]` and `#[LoadsResources]` that registers all bindings, boots
  discovery, and registers scheduled reports.
- **Report_Compiler**: A build-time compiler (`#[AsCompiler]`) that pre-resolves
  all `#[AsReport]` attribute configurations into the `Report_Registry` cache
  during `php artisan di:compile`.
- **Aggregation_Query**: A structured request object containing the target
  entity class, aggregation type(s), field(s), filters, date range, and optional
  sub-aggregations (buckets within buckets).
- **Ad_Hoc_Aggregation**: An aggregation query not tied to a pre-defined report
  class, constructed at runtime from API parameters or AI Gateway requests.
- **Tenant_Context**: The current tenant scope. The reporting package uses the
  search package's tenant-prefixed ES connection (set by `SearchBootstrapper`)
  for tenant-scoped aggregations.
- **ES_Connection**: The `pdphilip/elasticsearch` `Connection` class from the
  search package, used by the reporting package for all ES aggregation queries.
  The reporting package does NOT create its own ES connection.

## Requirements

### Requirement 1: Package Scaffolding and Service Provider

**User Story:** As a developer, I want the reporting package to follow the
standard Pixielity package layout, so that it integrates seamlessly with the
monorepo build system and module discovery.

#### Acceptance Criteria

1. THE Report_Service_Provider SHALL be annotated with
   `#[Module(name: 'Reporting', priority: 65)]` and
   `#[LoadsResources(migrations: true, config: true, routes: true, commands: true, publishables: true)]`.
2. THE Report_Service_Provider SHALL implement `HasBindings` and register
   bindings for `ReportManagerInterface`, `AggregationBuilderInterface`,
   `ReportExportServiceInterface`, and any package-local interfaces.
3. THE Report_Service_Provider SHALL implement `HasScheduledTasks` and register
   all scheduled reports discovered from `#[AsReport]` attributes with cron
   expressions during the boot phase.
4. THE package SHALL use the namespace `Pixielity\Reporting` with PSR-4
   autoloading from `src/`.
5. THE package SHALL declare `pixielity/laravel-framework` (for Indexer
   sub-package: `#[Aggregatable]`, `AggregationType`, `IndexerRegistry`),
   `pixielity/laravel-search` (for ES connection via `pdphilip/elasticsearch`),
   `pixielity/laravel-import-export` (for report export: CSV, XLSX, JSON, PDF),
   `pixielity/laravel-discovery`, and `pixielity/laravel-tenancy` as composer
   dependencies.
6. THE package SHALL NOT depend on `pdphilip/elasticsearch`,
   `elasticsearch/elasticsearch`, or any direct ES client library — all ES
   access goes through the search package's connection.
7. THE package SHALL include `composer.json`, `module.json`,
   `config/reporting.php`, and standard directory structure (`Attributes/`,
   `Contracts/`, `Controllers/`, `Concerns/`, `Enums/`, `Events/`, `Services/`,
   `Providers/`, `Repositories/`, `Commands/`, `Data/`, `Jobs/`, `Models/`,
   `Migrations/`, `Reports/`, `routes/`).

### Requirement 2: AsReport Attribute

**User Story:** As a developer, I want to annotate report classes with
`#[AsReport]` to declare report metadata, so that the reporting engine can
discover and execute reports without manual registration.

#### Acceptance Criteria

1. THE `#[AsReport]` attribute SHALL accept the following parameters: `name`
   (string, unique kebab-case slug identifying the report, e.g.,
   `'daily-sales'`), `label` (string, human-readable report name, e.g.,
   `'Daily Sales Report'`), `entity` (class-string of the indexed model the
   report aggregates against), and `schedule` (nullable string, cron expression
   for automated execution, default `null`).
2. THE `#[AsReport]` attribute SHALL target `Attribute::TARGET_CLASS` and be
   declared as `final readonly`.
3. THE `#[AsReport]` attribute SHALL define `ATTR_*` constants for each
   parameter name following the Pixielity convention (`ATTR_NAME`, `ATTR_LABEL`,
   `ATTR_ENTITY`, `ATTR_SCHEDULE`).
4. WHEN a class is annotated with `#[AsReport]`, THE class SHALL implement
   `ReportInterface`.
5. THE `#[AsReport]` attribute SHALL reside in
   `packages/reporting/src/Attributes/AsReport.php` under the namespace
   `Pixielity\Reporting\Attributes`.

### Requirement 3: ReportInterface Contract

**User Story:** As a developer, I want a contract defining the report class API,
so that all report classes provide a consistent structure for aggregation
definitions, filters, and date ranges.

#### Acceptance Criteria

1. THE `ReportInterface` SHALL define the method `aggregations(): array` that
   returns an array of aggregation definitions, where each definition specifies
   the field name, `AggregationType` (from the framework's
   `Pixielity\Indexer\Enums\AggregationType`), and optional parameters (interval
   for date_histogram, ranges for range aggregation, sub-aggregations).
2. THE `ReportInterface` SHALL define the method `filters(): array` that returns
   an array of available filter parameter definitions, where each definition
   specifies the filter name, field name, type (e.g., `'select'`,
   `'date_range'`, `'text'`), and optional allowed values.
3. THE `ReportInterface` SHALL define the method `defaultDateRange(): array`
   that returns an associative array with `'from'` and `'to'` keys as date
   strings (e.g., `['from' => 'now-30d', 'to' => 'now']`), representing the
   default date range when no explicit range is provided.
4. THE `ReportInterface` SHALL be annotated with `#[Bind]` pointing to a default
   implementation or left unbound (each report class is its own implementation).
5. THE `ReportInterface` SHALL reside in
   `packages/reporting/src/Contracts/ReportInterface.php` under the namespace
   `Pixielity\Reporting\Contracts`.
6. THE `ReportInterface` SHALL include full PHPDoc on each method with `@param`
   and `@return` annotations.

### Requirement 4: ReportManager Service

**User Story:** As a developer, I want a single service that discovers reports,
executes ES aggregation queries, and validates aggregation requests, so that I
have a clean API for all reporting operations.

#### Acceptance Criteria

1. THE `ReportManager` SHALL implement `ReportManagerInterface` (owned by this
   package) and be bound via `#[Bind]` on the interface and registered as
   `#[Scoped]` for Octane safety.
2. THE `ReportManager` SHALL discover all `#[AsReport]` classes via the
   `Report_Registry` and provide a `list(): Collection` method returning all
   available report configurations.
3. THE `ReportManager` SHALL provide an
   `execute(string $reportName, array $filters = [], ?array $dateRange = null): ReportResultDTO`
   method that resolves the report class by name, builds ES aggregation queries
   from the report's `aggregations()` definition, applies the provided filters
   and date range (or defaults), executes the query via the search package's ES
   connection, and returns a `ReportResultDTO`.
4. THE `ReportManager` SHALL provide an
   `aggregate(string $entityClass, array $aggregations, array $filters = [], ?array $dateRange = null): ReportResultDTO`
   method for ad-hoc aggregation queries not tied to a pre-defined report class.
5. THE `ReportManager` SHALL validate that all requested aggregation fields are
   declared in the entity's `#[Aggregatable]` attribute by reading the
   `aggregatableFields` from the framework's
   `IndexerRegistry::get($entityClass)->aggregatableFields`.
6. IF an aggregation request references a field not declared in
   `#[Aggregatable]`, THEN THE `ReportManager` SHALL throw an
   `InvalidAggregationException` listing the field name and the allowed
   aggregatable fields for the entity.
7. IF an aggregation request uses an `AggregationType` not declared for the
   field in `#[Aggregatable]`, THEN THE `ReportManager` SHALL throw an
   `InvalidAggregationException` listing the field, the requested type, and the
   allowed types for that field.
8. WHILE a tenant context is active, THE `ReportManager` SHALL automatically use
   the tenant-prefixed ES connection (set by the search package's
   `SearchBootstrapper`) for tenant-scoped entities and the global connection
   for non-tenant entities.
9. THE `ReportManager` SHALL reside in
   `packages/reporting/src/Services/ReportManager.php` under the namespace
   `Pixielity\Reporting\Services`.

### Requirement 5: AggregationBuilder Service

**User Story:** As a developer, I want a service that translates report
aggregation definitions into ES aggregation query DSL, so that the ReportManager
can execute complex nested aggregations without manual query construction.

#### Acceptance Criteria

1. THE `AggregationBuilder` SHALL implement `AggregationBuilderInterface` (owned
   by this package) and be bound via `#[Bind]` on the interface.
2. THE `AggregationBuilder` SHALL accept an array of aggregation definitions
   (field, type, parameters) and produce a valid ES aggregation query body
   compatible with `pdphilip/elasticsearch`'s query builder.
3. WHEN the aggregation type is `TERMS`, THE `AggregationBuilder` SHALL produce
   a terms aggregation on the specified field with configurable `size` parameter
   (default 10).
4. WHEN the aggregation type is `SUM`, `AVG`, `MIN`, or `MAX`, THE
   `AggregationBuilder` SHALL produce the corresponding metric aggregation on
   the specified field.
5. WHEN the aggregation type is `DATE_HISTOGRAM`, THE `AggregationBuilder` SHALL
   produce a date_histogram aggregation on the specified field with a
   configurable `interval` parameter (e.g., `'day'`, `'week'`, `'month'`,
   `'hour'`).
6. WHEN the aggregation type is `RANGE`, THE `AggregationBuilder` SHALL produce
   a range aggregation on the specified field with configurable `ranges` array
   (each range having optional `from` and `to` values).
7. WHEN the aggregation type is `GEO`, THE `AggregationBuilder` SHALL produce a
   geo_distance aggregation on the specified geo_point field with configurable
   `origin` (lat/lng) and `ranges` (distance bands in meters).
8. WHEN the aggregation type is `CARDINALITY`, THE `AggregationBuilder` SHALL
   produce a cardinality aggregation on the specified field for distinct count
   estimation.
9. WHEN the aggregation type is `PERCENTILES`, THE `AggregationBuilder` SHALL
   produce a percentiles aggregation on the specified field with configurable
   `percents` array (default `[25, 50, 75, 90, 95, 99]`).
10. THE `AggregationBuilder` SHALL support nested sub-aggregations (e.g., terms
    aggregation on `channel` with a sum sub-aggregation on `revenue` within each
    bucket).
11. THE `AggregationBuilder` SHALL apply date range filters as a `range` query
    on the entity's timestamp field (configurable, default `created_at`).
12. THE `AggregationBuilder` SHALL apply additional filters as `bool` query
    `filter` clauses.
13. THE `AggregationBuilder` SHALL reside in
    `packages/reporting/src/Services/AggregationBuilder.php` under the namespace
    `Pixielity\Reporting\Services`.

### Requirement 6: Report Registry and Discovery

**User Story:** As a developer, I want all report classes to be automatically
discovered at boot time, so that the ReportManager can list and execute reports
without manual registration.

#### Acceptance Criteria

1. THE `ReportRegistry` SHALL use `Discovery::attribute(AsReport::class)->get()`
   to discover all report classes at boot time.
2. THE `ReportRegistry` SHALL validate that each discovered class implements
   `ReportInterface` and throw a `ReportConfigurationException` for classes that
   do not.
3. THE `ReportRegistry` SHALL validate that each report `name` is unique across
   all discovered reports and throw a `ReportConfigurationException` for
   duplicate names.
4. THE `ReportRegistry` SHALL validate that each report's `entity` class is
   registered in the framework's `IndexerRegistry` (i.e., the entity is
   `#[Indexed]`) and throw a `ReportConfigurationException` for unindexed
   entities.
5. THE `ReportRegistry` SHALL provide methods:
   `get(string $name): ReportConfigurationDTO` (get config by report name),
   `all(): Collection` (all registered report configs),
   `has(string $name): bool` (check if a report exists), and
   `scheduled(): Collection` (all reports with non-null schedule).
6. THE `ReportRegistry` SHALL be bound as `#[Scoped]` for Octane-safe
   per-request isolation.
7. THE `ReportRegistry` SHALL reside in
   `packages/reporting/src/Registry/ReportRegistry.php` under the namespace
   `Pixielity\Reporting\Registry`.

### Requirement 7: Report Registry Compiler

**User Story:** As a developer, I want the report registry to be pre-resolved at
compile time via `di:compile`, so that runtime boot is fast and avoids repeated
Discovery calls.

#### Acceptance Criteria

1. THE `ReportRegistryCompiler` SHALL be annotated with
   `#[AsCompiler(priority: 30, phase: CompilerPhase::REGISTRY)]`.
2. THE `ReportRegistryCompiler` SHALL implement `CompilerInterface` with
   `compile(CompilerContext $context): CompilerResult` and `name(): string`.
3. WHEN compiled, THE `ReportRegistryCompiler` SHALL discover all `#[AsReport]`
   classes, validate their configurations, and cache the resolved configurations
   to `bootstrap/cache/report_registry.php`.
4. THE `ReportRegistryCompiler` SHALL return a `CompilerResult::success()` with
   the count of discovered report classes.
5. IF no `#[AsReport]` classes are found, THE `ReportRegistryCompiler` SHALL
   return `CompilerResult::skipped('No report classes found')`.
6. THE `ReportRegistryCompiler` SHALL reside in
   `packages/reporting/src/Compiler/ReportRegistryCompiler.php` under the
   namespace `Pixielity\Reporting\Compiler`.

### Requirement 8: Report Scheduling

**User Story:** As a platform operator, I want reports with cron expressions in
`#[AsReport]` to be automatically executed on schedule, so that historical
report data is generated without manual intervention.

#### Acceptance Criteria

1. WHEN the Report_Service_Provider boots, THE `ReportScheduler` SHALL read all
   reports from `ReportRegistry::scheduled()` and register each with Laravel's
   scheduler using the cron expression from the `#[AsReport]` `schedule`
   parameter.
2. WHEN a scheduled report executes, THE `ReportScheduler` SHALL call
   `ReportManager::execute()` with the report name and default filters/date
   range.
3. WHEN a scheduled report execution completes, THE `ReportScheduler` SHALL
   persist the `ReportResultDTO` to the `report_results` PostgreSQL table via
   the `ReportResultRepository`.
4. WHEN a scheduled report has export configuration in
   `reporting.schedule.auto_export_format` config, THE `ReportScheduler` SHALL
   trigger an export of the result via the `ReportExportService`.
5. WHEN a scheduled report execution completes, THE `ReportScheduler` SHALL
   dispatch a `ReportScheduled` event containing the report name, execution
   timestamp, and result summary.
6. IF a scheduled report execution fails, THEN THE `ReportScheduler` SHALL log
   the error with the report name and error message, and dispatch a
   `ReportScheduled` event with a failed status.
7. THE `ReportScheduler` SHALL reside in
   `packages/reporting/src/Services/ReportScheduler.php` under the namespace
   `Pixielity\Reporting\Services`.

### Requirement 9: Report Result Storage

**User Story:** As a platform operator, I want report execution results stored
in PostgreSQL, so that I can access historical report data without re-executing
aggregation queries.

#### Acceptance Criteria

1. THE package SHALL provide a `ReportResult` Eloquent model backed by the
   `report_results` PostgreSQL table with columns: `id` (primary key),
   `report_name` (string, indexed), `tenant_id` (nullable unsigned big integer,
   indexed), `filters` (JSON), `date_range` (JSON), `aggregation_data` (JSON),
   `execution_time_ms` (integer), `status` (string: `'completed'`, `'failed'`),
   `error_message` (nullable text), and `created_at`/`updated_at` timestamps.
2. THE package SHALL provide a migration creating the `report_results` table
   with appropriate indexes on `report_name`, `tenant_id`, and `created_at`.
3. THE package SHALL provide a `ReportResultRepository` implementing
   `ReportResultRepositoryInterface` with methods:
   `store(ReportResultDTO $result): ReportResult`,
   `findByReport(string $reportName, ?int $tenantId = null, int $limit = 10): Collection`,
   and `latest(string $reportName, ?int $tenantId = null): ?ReportResult`.
4. WHILE a tenant context is active, THE `ReportResultRepository` SHALL
   automatically scope queries to the current tenant's ID.
5. THE config file SHALL expose `reporting.results.retention_days` (default: 90)
   for controlling how long historical results are retained.
6. THE package SHALL provide a `reporting:prune` Artisan command that deletes
   report results older than the configured retention period.

### Requirement 10: Report Export Integration

**User Story:** As a platform operator, I want to export report results in CSV,
XLSX, JSON, or PDF format, so that I can share reports with stakeholders who do
not have platform access.

#### Acceptance Criteria

1. THE `ReportExportService` SHALL implement `ReportExportServiceInterface` and
   accept a `ReportResultDTO` and an export format (`ExportFormat` enum from the
   import-export package).
2. THE `ReportExportService` SHALL delegate file generation to the import-export
   package's `ExportManager`, transforming the aggregation data into a tabular
   format suitable for export.
3. WHEN the export format is CSV or XLSX, THE `ReportExportService` SHALL
   flatten nested aggregation buckets into rows with columns for each
   aggregation dimension and metric.
4. WHEN the export format is JSON, THE `ReportExportService` SHALL export the
   raw aggregation data structure as-is.
5. WHEN the export format is PDF, THE `ReportExportService` SHALL generate a
   tabular PDF with the flattened aggregation data.
6. WHEN a report is exported, THE `ReportExportService` SHALL dispatch a
   `ReportExported` event containing the report name, export format, file path,
   and tenant ID.
7. THE `ReportExportService` SHALL reside in
   `packages/reporting/src/Services/ReportExportService.php` under the namespace
   `Pixielity\Reporting\Services`.

### Requirement 11: Report API — List Reports

**User Story:** As a frontend developer, I want an API endpoint to list all
available reports, so that I can build a report selection UI.

#### Acceptance Criteria

1. THE `ReportController` SHALL expose a `GET /api/reports` endpoint that
   returns all registered reports from the `ReportRegistry`.
2. THE response SHALL include for each report: `name`, `label`, `entity`
   (class-string), `schedule` (nullable cron expression), and `filters` (array
   of available filter definitions from the report's `filters()` method).
3. THE `ReportController` SHALL use `#[AsController]` attribute and JsonResource
   for response formatting.
4. THE `ReportController` SHALL reside in
   `packages/reporting/src/Controllers/ReportController.php` under the namespace
   `Pixielity\Reporting\Controllers`.

### Requirement 12: Report API — Execute Report

**User Story:** As a frontend developer, I want an API endpoint to execute a
named report with optional filters and date range, so that I can display report
results in the UI.

#### Acceptance Criteria

1. THE `ReportController` SHALL expose a `GET /api/reports/{name}` endpoint that
   accepts optional query parameters: `filters` (associative array of filter
   values), `from` (date string for range start), `to` (date string for range
   end).
2. WHEN the report name exists in the `ReportRegistry`, THE `ReportController`
   SHALL delegate to `ReportManager::execute()` with the provided parameters.
3. IF the report name does not exist in the `ReportRegistry`, THEN THE
   `ReportController` SHALL return a 404 response with a descriptive error
   message.
4. THE response SHALL include: `report_name`, `label`, `aggregation_data`
   (nested aggregation results), `filters` (applied filters), `date_range`
   (applied date range), `execution_time_ms`, and `generated_at` timestamp.
5. WHEN a report is executed via the API, THE `ReportManager` SHALL dispatch a
   `ReportGenerated` event containing the report name, execution time, and
   tenant ID.
6. WHEN a report is executed via the API, THE `ReportManager` SHALL persist the
   result to the `report_results` table for historical access.

### Requirement 13: Report API — Export Report

**User Story:** As a frontend developer, I want an API endpoint to export report
results in various formats, so that users can download reports.

#### Acceptance Criteria

1. THE `ReportController` SHALL expose a `GET /api/reports/{name}/export`
   endpoint that accepts query parameters: `format` (string: `'csv'`, `'xlsx'`,
   `'json'`, `'pdf'`, default `'xlsx'`), `filters` (associative array), `from`
   (date string), `to` (date string).
2. WHEN an export is requested, THE `ReportController` SHALL first execute the
   report via `ReportManager::execute()`, then delegate to `ReportExportService`
   for file generation.
3. THE response SHALL return the generated file as a download response with the
   appropriate MIME type and filename (e.g., `daily-sales-2025-01-15.xlsx`).
4. WHEN the export completes, THE `ReportExportService` SHALL dispatch a
   `ReportExported` event.

### Requirement 14: Report API — Ad-Hoc Aggregation

**User Story:** As a frontend developer or AI Gateway, I want an API endpoint to
execute ad-hoc aggregation queries on any indexed entity, so that custom
analytics can be built without pre-defining report classes.

#### Acceptance Criteria

1. THE `ReportController` SHALL expose a `POST /api/reports/aggregate` endpoint
   that accepts a JSON body with: `entity` (string, entity identifier or
   class-string), `aggregations` (array of aggregation definitions, each with
   `field`, `type` as AggregationType value, and optional `params`), `filters`
   (optional associative array), `from` (optional date string), `to` (optional
   date string).
2. WHEN an ad-hoc aggregation is requested, THE `ReportController` SHALL
   delegate to `ReportManager::aggregate()` with the provided parameters.
3. THE `ReportManager` SHALL validate that the entity is registered in the
   framework's `IndexerRegistry` and that all requested fields are declared in
   `#[Aggregatable]`.
4. IF the entity is not indexed, THEN THE `ReportController` SHALL return a 422
   response listing the available indexed entities.
5. IF a requested field is not aggregatable, THEN THE `ReportController` SHALL
   return a 422 response listing the allowed aggregatable fields for the entity.
6. THE response SHALL include: `entity`, `aggregation_data`, `filters`,
   `date_range`, and `execution_time_ms`.

### Requirement 15: Report API — Historical Results

**User Story:** As a frontend developer, I want an API endpoint to retrieve
historical report results, so that I can display trend data and compare past
report executions.

#### Acceptance Criteria

1. THE `ReportController` SHALL expose a `GET /api/reports/history/{name}`
   endpoint that accepts optional query parameters: `limit` (integer, default
   10, max 100) and `from`/`to` (date strings to filter by execution date).
2. WHEN historical results are requested, THE `ReportController` SHALL delegate
   to `ReportResultRepository::findByReport()` with the report name and current
   tenant context.
3. THE response SHALL include an array of historical result entries, each
   containing: `id`, `report_name`, `filters`, `date_range`, `aggregation_data`,
   `execution_time_ms`, `status`, and `created_at`.
4. IF no historical results exist for the report, THE response SHALL return an
   empty array with a 200 status.

### Requirement 16: Domain Events

**User Story:** As a developer in another package, I want to listen to reporting
lifecycle events, so that I can trigger side effects like notifications, audit
logging, or cache invalidation.

#### Acceptance Criteria

1. THE package SHALL dispatch a `ReportGenerated` event annotated with
   `#[AsEvent]` after a report is executed, containing: `reportName` (string),
   `entityClass` (class-string), `executionTimeMs` (int), `tenantId` (nullable
   int|string), and `resultId` (int, the stored report result ID).
2. THE package SHALL dispatch a `ReportExported` event annotated with
   `#[AsEvent]` after a report is exported, containing: `reportName` (string),
   `format` (string), `filePath` (string), `tenantId` (nullable int|string), and
   `userId` (nullable int|string).
3. THE package SHALL dispatch a `ReportScheduled` event annotated with
   `#[AsEvent]` when a scheduled report runs, containing: `reportName` (string),
   `status` (string: `'completed'` or `'failed'`), `executionTimeMs` (int),
   `tenantId` (nullable int|string), and `errorMessage` (nullable string).
4. ALL events SHALL be `final readonly` DTOs carrying scalar values (not model
   instances) following the Pixielity event convention.
5. THE event classes SHALL reside in `packages/reporting/src/Events/` under the
   namespace `Pixielity\Reporting\Events`.

### Requirement 17: Data Transfer Objects

**User Story:** As a developer, I want typed DTOs for report configurations and
results, so that all reporting components work with consistent, validated data
structures.

#### Acceptance Criteria

1. THE package SHALL provide a `ReportConfigurationDTO` as a `final readonly`
   class with properties: `name` (string), `label` (string), `entityClass`
   (class-string), `schedule` (nullable string), `reportClass` (class-string of
   the report implementation), `aggregations` (array), `filters` (array),
   `defaultDateRange` (array).
2. THE package SHALL provide a `ReportResultDTO` as a `final readonly` class
   with properties: `reportName` (string), `label` (string), `entityClass`
   (class-string), `aggregationData` (array), `filters` (array), `dateRange`
   (array with `from` and `to`), `executionTimeMs` (int), `generatedAt` (string,
   ISO 8601 timestamp), `tenantId` (nullable int|string).
3. THE package SHALL provide an `AggregationDefinitionDTO` as a `final readonly`
   class with properties: `field` (string), `type` (AggregationType enum),
   `params` (array, optional parameters like interval, ranges, percents), and
   `subAggregations` (nullable array of `AggregationDefinitionDTO`).
4. ALL DTOs SHALL reside in `packages/reporting/src/Data/` under the namespace
   `Pixielity\Reporting\Data`.
5. ALL DTOs SHALL include full PHPDoc on each property.

### Requirement 18: Report Enums

**User Story:** As a developer, I want typed enums for report-specific
constants, so that report status and scope are type-safe and self-documenting.

#### Acceptance Criteria

1. THE package SHALL provide a `ReportStatus` enum as a backed string enum with
   cases: `COMPLETED` (`'completed'`), `FAILED` (`'failed'`), `RUNNING`
   (`'running'`), `PENDING` (`'pending'`) with `use Enum` trait, `#[Label]`, and
   `#[Description]` on each case.
2. THE `ReportStatus` enum SHALL provide `isTerminal(): bool` (returns `true`
   for `COMPLETED` and `FAILED`) and `isActive(): bool` (returns `true` for
   `RUNNING` and `PENDING`) helper methods.
3. THE package SHALL NOT redefine `AggregationType` — that enum is owned by the
   framework Indexer sub-package. The reporting package SHALL use
   `Pixielity\Indexer\Enums\AggregationType` directly.
4. THE enum classes SHALL reside in `packages/reporting/src/Enums/` under the
   namespace `Pixielity\Reporting\Enums`.

### Requirement 19: Multi-Tenant Awareness

**User Story:** As a platform operator, I want all reporting operations to
respect tenant boundaries, so that tenant data isolation is maintained in
aggregation results.

#### Acceptance Criteria

1. WHILE a tenant context is active, THE `ReportManager` SHALL execute all ES
   aggregation queries against the tenant-prefixed ES indexes (set by the search
   package's `SearchBootstrapper`).
2. WHILE a tenant context is active, THE `ReportResultRepository` SHALL scope
   all historical result queries to the current tenant's ID.
3. WHILE a tenant context is active, THE `ReportScheduler` SHALL execute
   scheduled reports within the tenant context and store results with the tenant
   ID.
4. WHEN no tenant context is active, THE `ReportManager` SHALL execute
   aggregation queries against global (non-tenant-prefixed) ES indexes for
   non-tenant-scoped entities.
5. THE `ReportManager` SHALL detect tenant-scoped entities by reading the
   `isTenantScoped` flag from the framework's
   `IndexerRegistry::get($entityClass)`.

### Requirement 20: Artisan Commands

**User Story:** As a developer, I want Artisan commands to manage reports from
the CLI, so that I can execute reports, view status, and prune historical data
during development and maintenance.

#### Acceptance Criteria

1. THE package SHALL provide a `reporting:run` command that executes a named
   report with optional `--filters` (JSON string) and `--from`/`--to` date
   parameters, displaying the result in a table format using Laravel Prompts.
2. THE package SHALL provide a `reporting:list` command that displays all
   registered reports in a table format (name, label, entity, schedule) using
   Laravel Prompts.
3. THE package SHALL provide a `reporting:prune` command that deletes report
   results older than the configured retention period
   (`reporting.results.retention_days`), with a `--days` option to override, and
   displays the count of deleted records using Laravel Prompts.
4. THE package SHALL provide a `reporting:schedule-run` command that manually
   triggers all scheduled reports (or a specific report via `--name` option),
   useful for testing scheduled report execution.
5. ALL commands SHALL use Laravel Prompts for output formatting (tables,
   progress bars, info/warning/error messages) and SHALL NOT use `$this->info()`
   or `$this->error()`.
6. THE command classes SHALL reside in `packages/reporting/src/Commands/` under
   the namespace `Pixielity\Reporting\Commands`.

### Requirement 21: Configuration

**User Story:** As a developer, I want a publishable config file for the
reporting package, so that I can customize reporting behavior per environment.

#### Acceptance Criteria

1. THE config file `config/reporting.php` SHALL expose: `reporting.connection`
   (string, the ES connection name to use from the search package, default
   `'elasticsearch'`).
2. THE config file SHALL expose: `reporting.results.table` (default:
   `'report_results'`), `reporting.results.retention_days` (default: 90).
3. THE config file SHALL expose: `reporting.schedule.enabled` (default: `true`)
   to globally enable or disable scheduled report execution, and
   `reporting.schedule.auto_export_format` (nullable string, default `null`) to
   auto-export scheduled report results in a specific format.
4. THE config file SHALL expose: `reporting.aggregation.default_date_field`
   (default: `'created_at'`) for the timestamp field used in date range
   filtering, and `reporting.aggregation.max_buckets` (default: 10000) for the
   ES max_buckets setting.
5. THE config file SHALL expose: `reporting.export.storage_disk` (default:
   `'local'`) and `reporting.export.storage_path` (default: `'report-exports'`)
   for controlling where exported report files are stored.
6. THE config file SHALL expose: `reporting.queue` (nullable string, default
   `null`) for the queue name used by report execution jobs.

### Requirement 22: MNGO Phase 1 Report Definitions

**User Story:** As a platform operator, I want pre-built report definitions for
all MNGO Phase 1 reporting requirements, so that sales, attendance, POS,
membership, promotion, B2B, and access control reports are available out of the
box.

#### Acceptance Criteria

1. THE package SHALL provide a `SalesRevenueReport` class implementing
   `ReportInterface` and annotated with
   `#[AsReport(name: 'sales-revenue', label: 'Sales & Revenue Report', entity: OrderInterface::class)]`
   that aggregates revenue by channel (POS, B2C, B2B), by date
   (daily/weekly/monthly), and by event, using `TERMS`, `SUM`, and
   `DATE_HISTOGRAM` aggregation types.
2. THE package SHALL provide an `AttendanceCapacityReport` class implementing
   `ReportInterface` and annotated with
   `#[AsReport(name: 'attendance-capacity', label: 'Attendance & Capacity Report', entity: TicketInterface::class)]`
   that aggregates attendance by venue, by time slot, and capacity utilization
   percentages, using `TERMS`, `SUM`, and `DATE_HISTOGRAM` aggregation types.
3. THE package SHALL provide a `PosPerformanceReport` class implementing
   `ReportInterface` and annotated with
   `#[AsReport(name: 'pos-performance', label: 'POS Performance Report', entity: TransactionInterface::class)]`
   that aggregates transactions per hour, average order value per cashier, and
   payment method distribution, using `TERMS`, `AVG`, `SUM`, and
   `DATE_HISTOGRAM` aggregation types.
4. THE package SHALL provide a `MembershipLoyaltyReport` class implementing
   `ReportInterface` and annotated with
   `#[AsReport(name: 'membership-loyalty', label: 'Membership & Loyalty Report', entity: MembershipInterface::class)]`
   that aggregates new members, renewals, loyalty points earned, and loyalty
   points redeemed, using `TERMS`, `SUM`, `CARDINALITY`, and `DATE_HISTOGRAM`
   aggregation types.
5. THE package SHALL provide a `PromotionEffectivenessReport` class implementing
   `ReportInterface` and annotated with
   `#[AsReport(name: 'promotion-effectiveness', label: 'Promotion Effectiveness Report', entity: PromotionInterface::class)]`
   that aggregates promotion usage count, revenue impact, and conversion rate,
   using `TERMS`, `SUM`, `AVG`, and `CARDINALITY` aggregation types.
6. THE package SHALL provide a `B2BPerformanceReport` class implementing
   `ReportInterface` and annotated with
   `#[AsReport(name: 'b2b-performance', label: 'B2B Performance Report', entity: ResellerOrderInterface::class)]`
   that aggregates reseller sales volume, commission amounts, and settlement
   status, using `TERMS`, `SUM`, and `DATE_HISTOGRAM` aggregation types.
7. THE package SHALL provide an `AccessControlReport` class implementing
   `ReportInterface` and annotated with
   `#[AsReport(name: 'access-control', label: 'Access Control Report', entity: AccessLogInterface::class)]`
   that aggregates entries by gate, entries by time period, and anti-passback
   violation counts, using `TERMS`, `SUM`, `CARDINALITY`, and `DATE_HISTOGRAM`
   aggregation types.
8. ALL MNGO report classes SHALL reside in `packages/reporting/src/Reports/`
   under the namespace `Pixielity\Reporting\Reports`.
9. ALL MNGO report classes SHALL define meaningful default date ranges (e.g.,
   last 30 days for sales, last 7 days for POS performance) and relevant filter
   definitions (e.g., channel, venue, cashier, date range).

### Requirement 23: AI Integration Support

**User Story:** As an AI Gateway developer, I want the reporting API to support
natural language-driven report execution, so that the AI reporting assistant can
translate user queries into report API calls.

#### Acceptance Criteria

1. THE `GET /api/reports` endpoint SHALL return sufficient metadata (report
   name, label, available filters with types and allowed values, entity
   information) for the AI Gateway to map natural language queries to specific
   report API calls.
2. THE `POST /api/reports/aggregate` endpoint SHALL accept structured
   aggregation definitions that the AI Gateway can construct from natural
   language analysis, without requiring knowledge of ES query DSL.
3. THE `ReportManager::aggregate()` method SHALL accept entity identifiers by
   both class-string and a human-readable entity name (derived from the
   `#[Indexed]` `label` parameter via the `IndexerRegistry`), so that the AI
   Gateway can reference entities by label.
4. THE ad-hoc aggregation response SHALL include field labels and aggregation
   type descriptions alongside raw data, so that the AI Gateway can format
   human-readable responses.

### Requirement 24: Exceptions

**User Story:** As a developer, I want typed exceptions for reporting errors, so
that error handling is explicit and consistent.

#### Acceptance Criteria

1. THE package SHALL provide an `InvalidAggregationException` extending
   `\InvalidArgumentException` that is thrown when an aggregation request
   references a non-aggregatable field or an unsupported aggregation type for a
   field.
2. THE package SHALL provide a `ReportNotFoundException` extending
   `\RuntimeException` that is thrown when a report name is not found in the
   `ReportRegistry`.
3. THE package SHALL provide a `ReportConfigurationException` extending
   `\RuntimeException` that is thrown during registry compilation when a report
   class is misconfigured (missing interface, duplicate name, unindexed entity).
4. THE package SHALL provide a `ReportExecutionException` extending
   `\RuntimeException` that is thrown when an ES aggregation query fails during
   report execution.
5. ALL exception classes SHALL reside in `packages/reporting/src/Exceptions/`
   under the namespace `Pixielity\Reporting\Exceptions`.
