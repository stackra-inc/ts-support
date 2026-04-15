# Implementation Plan: Import/Export Package

## Overview

Incremental implementation of the `pixielity/laravel-import-export` package
following the attribute-driven architecture. Tasks build sequentially: package
scaffolding → enums & value objects → attributes → contracts → registry &
compiler → dynamic Laravel Excel classes → services → jobs & events → controller
& routes → wiring & integration tests.

## Tasks

- [x] 1. Scaffold package structure and configuration
  - [x] 1.1 Create `packages/import-export/composer.json` with package metadata,
        PSR-4 autoload (`Pixielity\\ImportExport\\` → `src/`), dependencies
        (`pixielity/laravel-discovery`, `pixielity/laravel-crud`,
        `pixielity/laravel-database`, `maatwebsite/excel`), and path repository
        entries
    - _Requirements: 1.3, 1.4, 1.5_
  - [x] 1.2 Create `packages/import-export/module.json` with module name
        `ImportExport`, alias, version, and active flag
    - _Requirements: 1.5_
  - [x] 1.3 Create `packages/import-export/config/import-export.php` with all
        documented config keys and defaults: `export.*`, `import.*`, `csv.*`,
        `queue.*`, `broadcasting.*`, `sample_data.*`, `pdf.*`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 13.1, 13.2, 13.3_
  - [x] 1.4 Create
        `packages/import-export/src/Providers/ImportExportServiceProvider.php`
        with `#[Module(name: 'ImportExport', priority: 60)]`,
        `#[LoadsResources(migrations: true, config: true, routes: true, commands: true, publishables: true)]`,
        no manual bindings
    - _Requirements: 1.1, 1.2_

- [x] 2. Implement enums and value objects
  - [x] 2.1 Create `src/Enums/ExportFormat.php` — backed string enum with cases
        `CSV`, `XLSX`, `JSON`, `PDF`, `use Enum` trait,
        `#[Label]`/`#[Description]` on each case, `mimeType()`, `extension()`,
        `laravelExcelType()` methods
    - _Requirements: 16.1, 16.3, 16.4_
  - [x] 2.2 Create `src/Enums/ImportFormat.php` — backed string enum with cases
        `CSV`, `XLSX`, `JSON`, `use Enum` trait, `#[Label]`/`#[Description]` on
        each case, `laravelExcelType()` method
    - _Requirements: 16.2_
  - [ ]\* 2.3 Write property test for ExportFormat enum methods
    - **Property 8: ExportFormat enum methods return valid values**
    - **Validates: Requirements 16.3, 16.4**
  - [x] 2.4 Create `src/Data/CsvSettings.php` — final readonly value object with
        `fieldSeparator`, `multiValueSeparator`, `enclosure` properties,
        `fromConfig()` and `fromRequest()` static factory methods
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [x] 3. Implement attributes
  - [x] 3.1 Create `src/Attributes/Exportable.php` —
        `#[Attribute(Attribute::TARGET_CLASS)]`, `final readonly`, with
        `fields`, `formats`, `label`, `chunkSize`, `formatters` parameters and
        `ATTR_*` constants
    - _Requirements: 2.1, 2.2, 2.5_
  - [x] 3.2 Create `src/Attributes/Importable.php` —
        `#[Attribute(Attribute::TARGET_CLASS)]`, `final readonly`, with
        `fields`, `rules`, `uniqueBy`, `label`, `chunkSize`, `transformers`,
        `formats` parameters and `ATTR_*` constants
    - _Requirements: 3.1, 3.2, 3.4, 3.5_
  - [x] 3.3 Create `src/Attributes/SampleData.php` —
        `#[Attribute(Attribute::TARGET_CLASS)]`, `final readonly`, with
        `factory`, `count`, `label` parameters and `ATTR_*` constants
    - _Requirements: 4.1, 4.2_
  - [ ]\* 3.4 Write property test for attribute construction round-trip
    - **Property 1: Attribute construction round-trip**
    - **Validates: Requirements 2.1, 2.5, 3.1, 3.4, 3.5, 4.1**

- [x] 4. Implement contracts (interfaces)
  - [x] 4.1 Create `src/Contracts/Data/ImportResultInterface.php` with
        `totalRows()`, `created()`, `updated()`, `skipped()`, `errors()` method
        signatures
    - _Requirements: 7.7_
  - [x] 4.2 Create `src/Contracts/ExportManagerInterface.php` with
        `#[Bind(ExportManager::class)]`, `#[Scoped]`, methods: `export()`,
        `template()`, `downloadCompleted()`
    - _Requirements: 6.1_
  - [x] 4.3 Create `src/Contracts/ImportManagerInterface.php` with
        `#[Bind(ImportManager::class)]`, `#[Scoped]`, methods: `import()`,
        `dryRun()`
    - _Requirements: 7.1, 7.6_
  - [x] 4.4 Create `src/Contracts/EntityRegistryInterface.php` with
        `#[Bind(EntityRegistry::class)]`, `#[Scoped]`, methods: `exportable()`,
        `importable()`, `sampleData()`, `getExportConfig()`,
        `getImportConfig()`, `getSampleDataConfig()`, `getModelClass()`,
        `register()`
    - _Requirements: 5.4, 5.5_
  - [x] 4.5 Create `src/Contracts/SampleDataGeneratorInterface.php` with
        `#[Bind(SampleDataGenerator::class)]`, `#[Scoped]`, method: `generate()`
    - _Requirements: 4.1_

- [x] 5. Implement DTOs (Spatie Data)
  - [x] 5.1 Create `src/Data/ExportRequestData.php` extending `Data` with
        `entity`, `format`, `columns`, `filters`, `fieldSeparator`,
        `multiValueSeparator`, `enclosure` properties
    - _Requirements: 6.1, 13.4_
  - [x] 5.2 Create `src/Data/ImportRequestData.php` extending `Data` with
        `entity`, `file`, `dryRun`, `fieldSeparator`, `multiValueSeparator`,
        `enclosure` properties
    - _Requirements: 7.1, 7.6, 13.4_
  - [x] 5.3 Create `src/Data/ImportResultData.php` extending `Data`,
        implementing `ImportResultInterface`, with `totalRows`, `created`,
        `updated`, `skipped`, `errors` properties
    - _Requirements: 7.7_

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement EntityRegistry and Compiler
  - [x] 7.1 Create `src/Registry/EntityRegistry.php` implementing
        `EntityRegistryInterface` — stores discovered entity configs keyed by
        entity key, provides `exportable()`, `importable()`, `sampleData()`,
        `getExportConfig()`, `getImportConfig()`, `getSampleDataConfig()`,
        `getModelClass()`, `register()` methods, detects `BelongsToTenant` trait
        via `class_uses_recursive()`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 11.5_
  - [ ]\* 7.2 Write property test for EntityRegistry listing correctness
    - **Property 2: EntityRegistry listing correctness**
    - **Validates: Requirements 5.4**
  - [ ]\* 7.3 Write property test for BelongsToTenant detection
    - **Property 5: BelongsToTenant detection**
    - **Validates: Requirements 11.5**
  - [x] 7.4 Create `src/Compiler/ImportExportCompiler.php` with
        `#[AsCompiler(priority: 25, phase: CompilerPhase::REGISTRY)]`,
        implementing `CompilerInterface`, uses `Discovery::attribute()` for
        `Exportable`, `Importable`, `SampleData` to populate EntityRegistry
        cache
    - _Requirements: 5.6_

- [x] 8. Implement dynamic Laravel Excel classes
  - [x] 8.1 Create `src/Concerns/DynamicEntityExport.php` implementing
        `FromQuery`, `WithHeadings`, `WithMapping`, `ShouldAutoSize`,
        `WithCustomChunkSize`, `WithCustomCsvSettings` — constructor accepts
        `Builder`, `fieldMap`, `formatters`, `chunkSize`, `CsvSettings`;
        implements `query()`, `headings()`, `map()`, `chunkSize()`,
        `getCsvSettings()`
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 13.5, 13.6_
  - [x] 8.2 Create `src/Concerns/DynamicEntityImport.php` implementing
        `ToModel`, `WithValidation`, `WithUpserts`, `WithBatchInserts`,
        `WithChunkReading`, `WithHeadingRow`, `SkipsOnFailure`,
        `WithCustomCsvSettings`, using `SkipsFailures` trait — constructor
        accepts `modelClass`, `fieldMap`, `rules`, `uniqueBy`, `transformers`,
        `chunkSize`, `tenantId`, `CsvSettings`; implements `model()`, `rules()`,
        `uniqueBy()`, `batchSize()`, `chunkSize()`, `getCsvSettings()`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.8, 13.5, 13.6_
  - [ ]\* 8.3 Write property test for import validation error collection
    - **Property 3: Import validation collects all errors without aborting**
    - **Validates: Requirements 7.1, 7.2, 7.7**
  - [ ]\* 8.4 Write property test for transformer application
    - **Property 4: Transformer application preserves mapping**
    - **Validates: Requirements 7.8**
  - [ ]\* 8.5 Write property test for template headers matching field map
    - **Property 7: Template headers match field map**
    - **Validates: Requirements 15.2, 15.3**

- [x] 9. Implement domain events
  - [x] 9.1 Create all 9 event classes in `src/Events/`: `ExportStarted`,
        `ExportProgress`, `ExportCompleted`, `ExportFailed`, `ImportStarted`,
        `ImportProgress`, `ImportCompleted`, `ImportFailed`,
        `SampleDataGenerated` — each `final readonly` with `#[AsEvent]`,
        scalar-only constructor parameters, job lifecycle events implement
        `ShouldBroadcast` with `broadcastOn()` returning
        `PrivateChannel("user.{userId}.import-export")` and `broadcastAs()`
        returning the event name
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 14.1, 14.2, 14.3, 14.4, 14.5_
  - [ ]\* 9.2 Write property test for events being readonly DTOs with scalar IDs
    - **Property 6: Events are readonly DTOs with scalar IDs**
    - **Validates: Requirements 14.4**

- [x] 10. Implement service layer
  - [x] 10.1 Create `src/Services/ExportManager.php` implementing
        `ExportManagerInterface` — `export()` queries EntityRegistry, builds
        `DynamicEntityExport`, dispatches `ExportEntityJob`, returns jobId;
        `template()` generates empty file with headers from `#[Importable]`
        field map (sync); `downloadCompleted()` returns file for completed job;
        handles JSON export outside Laravel Excel; respects tenant scoping via
        `BelongsToTenant` global scope; builds `CsvSettings` from request
        overrides or config defaults
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 8.1, 11.1, 11.4, 13.5,
      13.6, 15.1, 15.2, 15.3_
  - [x] 10.2 Create `src/Services/ImportManager.php` implementing
        `ImportManagerInterface` — `import()` stores uploaded file, queries
        EntityRegistry, dispatches `ImportEntityJob`, returns jobId; `dryRun()`
        wraps import in `DB::transaction()` with rollback, runs synchronously,
        returns `ImportResultData`; respects tenant scoping; builds
        `CsvSettings` from request overrides or config defaults
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 8.2, 8.12, 11.2,
      11.4, 13.5, 13.6_
  - [x] 10.3 Create `src/Services/SampleDataGenerator.php` implementing
        `SampleDataGeneratorInterface` — `generate()` queries EntityRegistry for
        `#[SampleData]` config, uses factory to create records, auto-fills
        `tenant_id` for tenant-scoped entities, dispatches `SampleDataGenerated`
        event
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 11.3, 14.3_

- [x] 11. Implement queued jobs
  - [x] 11.1 Create `src/Jobs/ExportEntityJob.php` — `ShouldQueue`, stores
        `userId` from auth at dispatch, dispatches `ExportStarted` on handle
        start, `ExportProgress` per chunk, `ExportCompleted` on success (with
        file path), `ExportFailed` on exception via `failed()` method; uses
        configured `queue.connection` and `queue.queue_name`; for CSV/XLSX/PDF
        delegates to `Laravel\Excel::store()`, for JSON executes query directly
    - _Requirements: 8.1, 8.3, 8.4, 8.5, 8.6, 8.11, 9.3_
  - [x] 11.2 Create `src/Jobs/ImportEntityJob.php` — `ShouldQueue`, stores
        `userId` from auth at dispatch, dispatches `ImportStarted` on handle
        start, `ImportProgress` per chunk, `ImportCompleted` on success (with
        `ImportResultData`), `ImportFailed` on exception via `failed()` method;
        uses configured `queue.connection` and `queue.queue_name`; builds
        `DynamicEntityImport`, passes to `Laravel\Excel::import()`, collects
        failures via `SkipsFailures`
    - _Requirements: 8.2, 8.7, 8.8, 8.9, 8.10, 8.11, 9.3_

- [x] 12. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement controller and routes
  - [x] 13.1 Create `src/Controllers/ImportExportController.php` with
        `#[AsController]`, `#[Prefix('api/import-export')]`,
        constructor-injected `ExportManagerInterface`, `ImportManagerInterface`,
        `SampleDataGeneratorInterface`, `EntityRegistryInterface`; implements
        all 8 endpoints:
    - `POST /export` → accepts `ExportRequestData`, calls
      `ExportManager::export()`, returns 202 + jobId
    - `POST /import` → accepts file upload + `ImportRequestData`, calls
      `ImportManager::import()`, returns 202 + jobId
    - `POST /import/dry-run` → accepts file upload + `ImportRequestData`, calls
      `ImportManager::dryRun()`, returns `ImportResultData` (sync)
    - `GET /status/{jobId}` → returns job progress/status
    - `GET /download/{jobId}` → returns completed export file
    - `GET /entities` → returns all registered entities from EntityRegistry
    - `POST /sample-data` → accepts entity + optional count, calls
      `SampleDataGenerator::generate()`
    - `GET /template/{entity}` → calls `ExportManager::template()`, returns sync
      download
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 15.1_
  - [x] 13.2 Create `src/routes/api.php` with route definitions for all
        controller endpoints, applying appropriate middleware
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

- [x] 14. Wire everything together and verify integration
  - [x] 14.1 Update `ImportExportServiceProvider` to ensure config publishing,
        route loading, and all resources are properly loaded via
        `#[LoadsResources]`; verify no manual bindings exist (all use
        `#[Bind]` + `#[Scoped]` on interfaces)
    - _Requirements: 1.1, 1.2_
  - [ ]\* 14.2 Write unit tests for DynamicEntityExport (`headings()`, `map()`
    with formatters, `chunkSize()`, `getCsvSettings()`)
    - _Requirements: 6.1, 6.2, 6.3, 13.5_
  - [ ]\* 14.3 Write unit tests for DynamicEntityImport (`rules()`,
    `uniqueBy()`, `model()` with transformers and tenant_id, `getCsvSettings()`)
    - _Requirements: 7.1, 7.3, 7.5, 7.8, 13.5_
  - [ ]\* 14.4 Write unit tests for ImportResultData DTO construction and
    interface method implementations
    - _Requirements: 7.7_
  - [ ]\* 14.5 Write unit tests for CsvSettings value object (`fromConfig()`,
    `fromRequest()` with overrides and defaults)
    - _Requirements: 13.1, 13.2, 13.3, 13.5, 13.6_

- [x] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document
- Unit tests validate specific examples and edge cases
- All code must follow steering files: `declare(strict_types=1)`, comprehensive
  docblocks, `#[Bind]`/`#[Scoped]` attribute bindings, Discovery facade usage,
  `ATTR_*` constants
- JSON export is handled directly by ExportManager (not via Laravel Excel)
- Broadcasting events use `private-user.{userId}.import-export` channel pattern
