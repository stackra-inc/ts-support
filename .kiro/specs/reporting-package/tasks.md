# Implementation Plan: Reporting Package (`pixielity/laravel-reporting`)

## Overview

Incremental implementation of the reporting package at `packages/reporting/`
under namespace `Pixielity\Reporting`. Each task builds on the previous,
starting with foundational types (DTOs, enums, exceptions, attributes), then
contracts and registry, then services, then API/commands, and finally MNGO
report definitions. All ES access goes through the search package's connection —
no direct ES dependency.

## Tasks

- [x] 1. Scaffold package structure, config, and service provider
  - [x] 1.1 Create `packages/reporting/composer.json` with dependencies on
        `pixielity/laravel-framework`, `pixielity/laravel-search`,
        `pixielity/laravel-import-export`, `pixielity/laravel-discovery`,
        `pixielity/laravel-tenancy`; PSR-4 autoload from `src/` under
        `Pixielity\Reporting`
    - Create `module.json` with name `Reporting`, alias, version, active flag
    - Create directory structure: `Attributes/`, `Compiler/`, `Commands/`,
      `Concerns/`, `Contracts/`, `Controllers/`, `Data/`, `Enums/`, `Events/`,
      `Exceptions/`, `Jobs/`, `Migrations/`, `Models/`, `Providers/`,
      `Registry/`, `Repositories/`, `Reports/`, `Resources/`, `Services/`,
      `routes/`
    - _Requirements: 1.4, 1.5, 1.6, 1.7_

  - [x] 1.2 Create `config/reporting.php` with all documented config keys and
        defaults
    - `reporting.connection`, `reporting.results.table`,
      `reporting.results.retention_days`, `reporting.schedule.enabled`,
      `reporting.schedule.auto_export_format`,
      `reporting.aggregation.default_date_field`,
      `reporting.aggregation.max_buckets`, `reporting.export.storage_disk`,
      `reporting.export.storage_path`, `reporting.queue`
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_

  - [x] 1.3 Create `ReportingServiceProvider` with
        `#[Module(name: 'Reporting', priority: 65)]`, `#[LoadsResources(...)]`,
        `HasBindings`, `HasScheduledTasks`
    - Register scoped bindings for `ReportManagerInterface`,
      `AggregationBuilderInterface`, `ReportExportServiceInterface`,
      `ReportResultRepositoryInterface`
    - Wire `scheduledTasks()` to delegate to
      `ReportScheduler::registerScheduledReports()`
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement enums, exceptions, and DTOs
  - [x] 2.1 Create `ReportStatus` enum with `COMPLETED`, `FAILED`, `RUNNING`,
        `PENDING` cases, `use Enum` trait, `#[Label]`/`#[Description]` on each
        case, `isTerminal()` and `isActive()` helper methods
    - _Requirements: 18.1, 18.2, 18.3_

  - [ ]\* 2.2 Write property test for ReportStatus categorization
    - **Property 7: ReportStatus categorization is mutually exclusive and
      exhaustive**
    - **Validates: Requirements 18.1, 18.2**

  - [x] 2.3 Create exception classes in `Exceptions/`:
        `InvalidAggregationException` (extends `\InvalidArgumentException`),
        `ReportNotFoundException` (extends `\RuntimeException`),
        `ReportConfigurationException` (extends `\RuntimeException`),
        `ReportExecutionException` (extends `\RuntimeException`)
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

  - [x] 2.4 Create `AggregationDefinitionDTO` in `Data/` as `final readonly`
        with `field`, `type` (AggregationType), `params`, `subAggregations`
    - _Requirements: 17.3, 17.4, 17.5_

  - [x] 2.5 Create `ReportConfigurationDTO` in `Data/` as `final readonly` with
        `name`, `label`, `entityClass`, `schedule`, `reportClass`,
        `aggregations`, `filters`, `defaultDateRange`
    - _Requirements: 17.1, 17.4, 17.5_

  - [x] 2.6 Create `ReportResultDTO` in `Data/` as `final readonly` with
        `reportName`, `label`, `entityClass`, `aggregationData`, `filters`,
        `dateRange`, `executionTimeMs`, `generatedAt`, `tenantId`
    - _Requirements: 17.2, 17.4, 17.5_

  - [ ]\* 2.7 Write property test for value object construction round-trip
    - **Property 1: Value object construction round-trip**
    - **Validates: Requirements 2.1, 16.1, 16.2, 16.3, 17.1, 17.2, 17.3**

- [x] 3. Implement `#[AsReport]` attribute and events
  - [x] 3.1 Create `#[AsReport]` attribute in `Attributes/AsReport.php`
        targeting `Attribute::TARGET_CLASS`, `final readonly`, with `name`,
        `label`, `entity`, `schedule` parameters and `ATTR_*` constants
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 3.2 Create event classes in `Events/`: `ReportGenerated`,
        `ReportExported`, `ReportScheduled` — all `final readonly` with
        `#[AsEvent]`, scalar properties only
    - `ReportGenerated`: `reportName`, `entityClass`, `executionTimeMs`,
      `tenantId`, `resultId`
    - `ReportExported`: `reportName`, `format`, `filePath`, `tenantId`, `userId`
    - `ReportScheduled`: `reportName`, `status`, `executionTimeMs`, `tenantId`,
      `errorMessage`
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [x] 4. Implement contracts (interfaces)
  - [x] 4.1 Create `ReportInterface` in `Contracts/` with
        `aggregations(): array`, `filters(): array`, `defaultDateRange(): array`
        — full PHPDoc on each method
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

  - [x] 4.2 Create `ReportManagerInterface` in `Contracts/` with
        `#[Bind(ReportManager::class)]`, methods: `list()`, `execute()`,
        `aggregate()`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 4.3 Create `AggregationBuilderInterface` in `Contracts/` with
        `#[Bind(AggregationBuilder::class)]`, method: `build()`
    - _Requirements: 5.1, 5.13_

  - [x] 4.4 Create `ReportExportServiceInterface` in `Contracts/` with
        `#[Bind(ReportExportService::class)]`, method: `export()`
    - _Requirements: 10.1, 10.7_

  - [x] 4.5 Create `ReportResultRepositoryInterface` in `Contracts/` with
        `#[Bind(ReportResultRepository::class)]`, methods: `store()`,
        `findByReport()`, `latest()`
    - _Requirements: 9.3_

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement ReportRegistry and ReportRegistryCompiler
  - [x] 6.1 Create `ReportRegistry` in `Registry/` as `#[Scoped]` with `get()`,
        `all()`, `has()`, `scheduled()`, `register()`, `loadFromCache()` methods
    - `get()` throws `ReportNotFoundException` for unknown names
    - `scheduled()` filters for non-null schedule
    - _Requirements: 6.1, 6.5, 6.6, 6.7_

  - [ ]\* 6.2 Write property test for ReportRegistry CRUD consistency
    - **Property 4: ReportRegistry CRUD consistency**
    - **Validates: Requirements 4.2, 6.5**

  - [x] 6.3 Create `ReportRegistryCompiler` in `Compiler/` with
        `#[AsCompiler(priority: 30, phase: CompilerPhase::REGISTRY)]`,
        implements `CompilerInterface`
    - Discover `#[AsReport]` classes via Discovery, validate `ReportInterface`
      implementation, unique names, indexed entities
    - Cache to `bootstrap/cache/report_registry.php`
    - Return `CompilerResult::skipped()` when no reports found
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 6.2, 6.3, 6.4_

- [x] 7. Implement AggregationBuilder service
  - [x] 7.1 Create `AggregationBuilder` in `Services/` as `#[Scoped]`,
        implements `AggregationBuilderInterface`
    - `build()` produces ES query body with `size: 0`, `query.bool.filter`,
      `aggs`
    - Support all 10 `AggregationType` cases: TERMS, SUM, AVG, MIN, MAX,
      DATE_HISTOGRAM, RANGE, GEO, CARDINALITY, PERCENTILES
    - Support nested sub-aggregations
    - Apply date range as `range` filter on configurable date field
    - Apply additional filters as `term`/`terms` clauses
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11,
      5.12, 5.13_

  - [ ]\* 7.2 Write property test for AggregationBuilder ES DSL output
    - **Property 3: AggregationBuilder produces structurally valid ES DSL**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10,
      5.11, 5.12**

- [x] 8. Implement ReportResult model, migration, and repository
  - [x] 8.1 Create migration for `report_results` table with columns: `id`,
        `report_name` (indexed), `tenant_id` (nullable, indexed), `filters`
        (JSON), `date_range` (JSON), `aggregation_data` (JSON),
        `execution_time_ms`, `status`, `error_message` (nullable),
        `created_at`/`updated_at` (indexed)
    - _Requirements: 9.1, 9.2_

  - [x] 8.2 Create `ReportResult` Eloquent model in `Models/` with `#[Table]`,
        `#[Unguarded]`, JSON casts for `filters`, `date_range`,
        `aggregation_data`
    - _Requirements: 9.1_

  - [x] 8.3 Create `ReportResultRepository` in `Repositories/` implementing
        `ReportResultRepositoryInterface` with `store()`, `findByReport()`,
        `latest()` — auto-scope to tenant when tenant context is active
    - _Requirements: 9.3, 9.4_

  - [ ]\* 8.4 Write property test for ReportResult store/retrieve round-trip
    - **Property 5: ReportResult store/retrieve round-trip**
    - **Validates: Requirements 9.1, 9.3**

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement ReportManager service
  - [x] 10.1 Create `ReportManager` in `Services/` as `#[Scoped]`, implements
        `ReportManagerInterface`
    - Inject `ReportRegistry`, `IndexerRegistry`, `AggregationBuilderInterface`,
      ES `Connection`, `ReportResultRepositoryInterface`
    - `list()`: return all report configs from registry
    - `execute()`: resolve report, validate aggregations against
      `#[Aggregatable]`, build ES query, execute, store result, dispatch
      `ReportGenerated` event
    - `aggregate()`: resolve entity by class-string or label, validate
      aggregations, build and execute ES query, return result
    - `validateAggregations()`: check fields exist in `aggregatableFields` and
      types are allowed, throw `InvalidAggregationException` on failure
    - `resolveEntityClass()`: accept class-string or label, search
      `IndexerRegistry::all()` for matching label
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 19.1, 19.4,
      19.5, 23.3_

  - [ ]\* 10.2 Write property test for aggregation field validation
    - **Property 2: Aggregation field validation**
    - **Validates: Requirements 4.5, 4.6, 4.7, 14.3**

  - [ ]\* 10.3 Write property test for entity resolution by class-string or
    label
    - **Property 9: Entity resolution by class-string or label**
    - **Validates: Requirements 23.3**

- [x] 11. Implement ReportExportService
  - [x] 11.1 Create `ReportExportService` in `Services/` as `#[Scoped]`,
        implements `ReportExportServiceInterface`
    - Inject `ExportManagerInterface` from import-export package
    - `export()`: flatten aggregation data for CSV/XLSX/PDF, pass raw for JSON,
      delegate to `ExportManager`, dispatch `ReportExported` event
    - `flattenAggregations()`: walk nested aggregation tree, produce one row per
      leaf bucket
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ]\* 11.2 Write property test for aggregation data flattening
    - **Property 6: Aggregation data flattening preserves leaf values**
    - **Validates: Requirements 10.3**

- [x] 12. Implement ReportScheduler
  - [x] 12.1 Create `ReportScheduler` in `Services/` with
        `registerScheduledReports()` and `runScheduledReport()`
    - Read scheduled reports from `ReportRegistry::scheduled()`
    - Register each with Laravel scheduler using cron expression,
      `withoutOverlapping()`
    - Execute via `ReportManager::execute()`, store result, auto-export if
      configured, dispatch `ReportScheduled` event
    - Handle failures: log error, dispatch event with failed status and error
      message
    - Respect `reporting.schedule.enabled` config toggle
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 19.3_

- [x] 13. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement ReportController and API routes
  - [x] 14.1 Create `ReportController` in `Controllers/` with `#[AsController]`,
        `#[Prefix('api/reports')]`
    - Inject `ReportManagerInterface`, `ReportExportServiceInterface`,
      `ReportResultRepositoryInterface`
    - `index()`: `GET /api/reports` — list all reports with metadata and filter
      definitions
    - `show()`: `GET /api/reports/{name}` — execute report with optional
      filters/date range, return 404 for unknown name
    - `export()`: `GET /api/reports/{name}/export` — execute and export, return
      file download with correct MIME type
    - `aggregate()`: `POST /api/reports/aggregate` — ad-hoc aggregation,
      validate entity and fields, return 422 for invalid
    - `history()`: `GET /api/reports/history/{name}` — historical results,
      return empty array with 200 if none
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6,
      13.1, 13.2, 13.3, 13.4, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 15.1, 15.2,
      15.3, 15.4, 23.1, 23.2, 23.4_

  - [x] 14.2 Create `routes/api.php` with route definitions for all controller
        endpoints
    - _Requirements: 11.1, 12.1, 13.1, 14.1, 15.1_

- [x] 15. Implement Artisan commands
  - [x] 15.1 Create `reporting:run` command accepting report name, `--filters`,
        `--from`, `--to` — display results in table format using Laravel Prompts
    - _Requirements: 20.1, 20.5_

  - [x] 15.2 Create `reporting:list` command displaying all registered reports
        in table format using Laravel Prompts
    - _Requirements: 20.2, 20.5_

  - [x] 15.3 Create `reporting:prune` command deleting results older than
        retention period, with `--days` override, display count using Laravel
        Prompts
    - _Requirements: 9.5, 9.6, 20.3, 20.5_

  - [x] 15.4 Create `reporting:schedule-run` command to manually trigger
        scheduled reports, with `--name` option for specific report
    - _Requirements: 20.4, 20.5, 20.6_

- [x] 16. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Implement MNGO Phase 1 report definitions
  - [x] 17.1 Create `SalesRevenueReport` in `Reports/` implementing
        `ReportInterface`, annotated with
        `#[AsReport(name: 'sales-revenue', ...)]`
    - Aggregations: revenue by channel (TERMS+SUM), by date
      (DATE_HISTOGRAM+SUM), by event (TERMS+SUM)
    - Filters: channel, venue, date_range; default date range: last 30 days
    - _Requirements: 22.1, 22.8, 22.9_

  - [x] 17.2 Create `AttendanceCapacityReport` in `Reports/` implementing
        `ReportInterface`, annotated with
        `#[AsReport(name: 'attendance-capacity', ...)]`
    - Aggregations: by venue (TERMS+CARDINALITY), by time slot
      (TERMS+CARDINALITY), by time (DATE_HISTOGRAM+CARDINALITY)
    - Filters: venue, event, date_range; default date range: last 30 days
    - _Requirements: 22.2, 22.8, 22.9_

  - [x] 17.3 Create `PosPerformanceReport` in `Reports/` implementing
        `ReportInterface`, annotated with
        `#[AsReport(name: 'pos-performance', ...)]`
    - Aggregations: transactions per hour (DATE_HISTOGRAM+SUM), avg order value
      per cashier (TERMS+AVG), payment method distribution (TERMS+SUM)
    - Filters: cashier, terminal, date_range; default date range: last 7 days
    - _Requirements: 22.3, 22.8, 22.9_

  - [x] 17.4 Create `MembershipLoyaltyReport` in `Reports/` implementing
        `ReportInterface`, annotated with
        `#[AsReport(name: 'membership-loyalty', ...)]`
    - Aggregations: by tier (TERMS+CARDINALITY), by month
      (DATE_HISTOGRAM+CARDINALITY), points earned (SUM), points redeemed (SUM)
    - Filters: tier, status, date_range; default date range: last 30 days
    - _Requirements: 22.4, 22.8, 22.9_

  - [x] 17.5 Create `PromotionEffectivenessReport` in `Reports/` implementing
        `ReportInterface`, annotated with
        `#[AsReport(name: 'promotion-effectiveness', ...)]`
    - Aggregations: by promotion code (TERMS) with sub-aggs for usage count
      (CARDINALITY), discount amount (SUM), avg order total (AVG)
    - Filters: channel, date_range; default date range: last 30 days
    - _Requirements: 22.5, 22.8, 22.9_

  - [x] 17.6 Create `B2BPerformanceReport` in `Reports/` implementing
        `ReportInterface`, annotated with
        `#[AsReport(name: 'b2b-performance', ...)]`
    - Aggregations: by reseller (TERMS+SUM for sales and commission), settlement
      status (TERMS), by week (DATE_HISTOGRAM+SUM)
    - Filters: reseller, settlement_status, date_range; default date range: last
      30 days
    - _Requirements: 22.6, 22.8, 22.9_

  - [x] 17.7 Create `AccessControlReport` in `Reports/` implementing
        `ReportInterface`, annotated with
        `#[AsReport(name: 'access-control', ...)]`
    - Aggregations: by gate (TERMS+CARDINALITY), by hour
      (DATE_HISTOGRAM+CARDINALITY), violations (TERMS+CARDINALITY)
    - Filters: gate, venue, date_range; default date range: last 7 days
    - _Requirements: 22.7, 22.8, 22.9_

  - [ ]\* 17.8 Write property test for MNGO report definitions
    - **Property 8: MNGO report definitions return valid structures**
    - **Validates: Requirements 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.9**

- [x] 18. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document
- Unit tests validate specific examples and edge cases
- All code must include comprehensive docblocks and `declare(strict_types=1)`
  per code style steering
- Framework Indexer sub-package and search package must be implemented first —
  this package depends on both
- NO direct ES dependency — all ES access through search package's
  `pdphilip/elasticsearch` Connection
