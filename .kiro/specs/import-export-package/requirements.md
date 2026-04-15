# Requirements Document — Import/Export Package

## Introduction

The `pixielity/laravel-import-export` package provides a unified,
attribute-driven import/export engine for the MNGO venue management platform.
Built on top of `maatwebsite/laravel-excel` (Laravel Excel 3.x), the package
enables any entity across the Pixielity monorepo to declare itself as
importable, exportable, or sample-data-capable via PHP attributes
(`#[Exportable]`, `#[Importable]`, `#[SampleData]`). The package complements the
existing `TenantDataExportService` / `TenantDataImportService` in the tenancy
package — those handle bulk tenant-level JSON migration, while this package
handles granular, entity-level import/export with CSV, XLSX, JSON, and PDF
format support.

The package follows the established Pixielity patterns: attribute-driven
configuration, interface-first design with `ATTR_*` constants, Discovery facade
for cross-package model discovery, Controller → Service → Repository → Model
layered architecture, bounded context communication via events and service
interfaces, and Octane-safe stateless design.

## Glossary

- **Import_Export_Engine**: The core orchestration service that coordinates
  import, export, and sample data operations across all registered entities.
- **Export_Manager**: The service responsible for building and executing export
  operations, delegating to Laravel Excel for file generation.
- **Import_Manager**: The service responsible for orchestrating import
  operations including validation, transformation, duplicate detection, and
  persistence.
- **Entity_Registry**: A boot-time registry that discovers and stores all
  `#[Exportable]`, `#[Importable]`, and `#[SampleData]` configurations from
  across the monorepo via the Discovery facade.
- **Export_Format**: An enum representing supported export file formats: CSV,
  XLSX, JSON, PDF.
- **Import_Format**: An enum representing supported import file formats: CSV,
  XLSX, JSON.
- **Field_Map**: A mapping from model attribute names (using `Interface::ATTR_*`
  constants) to human-readable column headers for export/import files.
- **Import_Result**: A DTO containing the outcome of an import operation: rows
  processed, rows created, rows updated, rows skipped, and validation errors.
- **Export_Job**: A queued job that executes a large export operation
  asynchronously with progress tracking.
- **Import_Job**: A queued job that executes a large import operation
  asynchronously with progress tracking, validation, and error reporting.
- **Sample_Data_Generator**: A service that produces sample/seed records for
  entities marked with `#[SampleData]`, used for demo tenants, onboarding, and
  testing.
- **Dry_Run**: An import mode that validates and reports results without
  persisting any data to the database.
- **Chunk_Size**: The configurable number of rows processed per batch during
  import or export operations.
- **Tenant_Context**: The current tenant scope as determined by the tenancy
  package's `BelongsToTenant` trait and `TenancyManager`.
- **Discovery_Facade**: The `Pixielity\Discovery\Facades\Discovery` facade used
  to discover all classes annotated with import/export attributes across the
  monorepo.
- **Import_Export_Controller**: The REST API controller that exposes endpoints
  for triggering imports, exports, downloads, upload, status checks, and sample
  data generation.
- **Import_Export_Service_Provider**: The package's service provider annotated
  with `#[Module]` and `#[LoadsResources]` that registers all bindings and boots
  discovery.
- **Import_Export_Compiler**: A build-time compiler (`#[AsCompiler]`) that
  pre-resolves all `#[Exportable]`, `#[Importable]`, and `#[SampleData]`
  attribute configurations into the Entity_Registry cache.

## Requirements

### Requirement 1: Package Scaffolding and Service Provider

**User Story:** As a developer, I want the import-export package to follow the
standard Pixielity package layout, so that it integrates seamlessly with the
monorepo build system and module discovery.

#### Acceptance Criteria

1. THE Import_Export_Service_Provider SHALL be annotated with
   `#[Module(name: 'ImportExport', priority: 60)]` and
   `#[LoadsResources(migrations: true, config: true, routes: true, commands: true, publishables: true)]`.
2. THE Import_Export_Service_Provider SHALL register all interface bindings
   using `#[Bind]` on interfaces and `HasBindings` hook interface.
3. THE package SHALL use the namespace `Pixielity\ImportExport` with PSR-4
   autoloading from `src/`.
4. THE package SHALL declare `pixielity/laravel-discovery`,
   `pixielity/laravel-crud`, `pixielity/laravel-database`, and
   `maatwebsite/excel` as composer dependencies.
5. THE package SHALL include `composer.json`, `module.json`,
   `config/import-export.php`, and standard directory structure (`Attributes/`,
   `Contracts/`, `Controllers/`, `Enums/`, `Events/`, `Services/`, `Providers/`,
   `Jobs/`, `routes/`).

### Requirement 2: Exportable Attribute and Export Configuration

**User Story:** As a package developer, I want to annotate my models with
`#[Exportable]` to declare export configuration, so that the import-export
engine can generate exports without manual wiring.

#### Acceptance Criteria

1. THE `#[Exportable]` attribute SHALL accept the following parameters: `fields`
   (array of `ATTR_*` constant references mapping to column headers), `formats`
   (array of Export_Format values, defaulting to all), `label` (human-readable
   entity name), and `chunkSize` (integer, default 1000).
2. THE `#[Exportable]` attribute SHALL target `Attribute::TARGET_CLASS` and be
   placed on model classes.
3. WHEN a model class is annotated with `#[Exportable]`, THE Entity_Registry
   SHALL discover and store the export configuration at boot time via the
   Discovery facade.
4. WHEN the `fields` parameter is empty, THE Export_Manager SHALL export all
   model attributes using the model's `$fillable` or `toArray()` output.
5. THE `#[Exportable]` attribute SHALL support a `formatters` parameter that
   maps field names to callable formatter class references for value
   transformation during export.

### Requirement 3: Importable Attribute and Import Configuration

**User Story:** As a package developer, I want to annotate my models with
`#[Importable]` to declare import configuration, so that the import-export
engine can validate and import data without manual wiring.

#### Acceptance Criteria

1. THE `#[Importable]` attribute SHALL accept the following parameters: `fields`
   (array mapping column headers to `ATTR_*` constants), `rules` (array of
   Laravel validation rules per field), `uniqueBy` (array of fields for
   duplicate detection), `label` (human-readable entity name), and `chunkSize`
   (integer, default 500).
2. THE `#[Importable]` attribute SHALL target `Attribute::TARGET_CLASS` and be
   placed on model classes.
3. WHEN a model class is annotated with `#[Importable]`, THE Entity_Registry
   SHALL discover and store the import configuration at boot time via the
   Discovery facade.
4. THE `#[Importable]` attribute SHALL support a `transformers` parameter that
   maps field names to callable transformer class references for value
   transformation during import.
5. THE `#[Importable]` attribute SHALL support a `formats` parameter (array of
   Import_Format values, defaulting to all) to restrict accepted file formats.

### Requirement 4: SampleData Attribute and Sample Data Generation

**User Story:** As a platform operator, I want entities to declare sample data
definitions via `#[SampleData]`, so that demo tenants and onboarding flows can
be populated with realistic test data.

#### Acceptance Criteria

1. THE `#[SampleData]` attribute SHALL accept the following parameters:
   `factory` (class reference to a Laravel model factory or custom generator
   class), `count` (default number of records to generate, default 10), and
   `label` (human-readable entity name).
2. THE `#[SampleData]` attribute SHALL target `Attribute::TARGET_CLASS` and be
   placed on model classes.
3. WHEN a model class is annotated with `#[SampleData]`, THE Entity_Registry
   SHALL discover and store the sample data configuration at boot time via the
   Discovery facade.
4. WHEN sample data generation is triggered for a tenant-scoped entity, THE
   Sample_Data_Generator SHALL auto-fill the tenant_id column with the current
   Tenant_Context value.
5. WHEN sample data generation is triggered for a non-tenant entity, THE
   Sample_Data_Generator SHALL generate records without tenant scoping.

### Requirement 5: Entity Registry and Cross-Package Discovery

**User Story:** As an admin, I want the system to dynamically discover all
importable, exportable, and sample-data-capable entities across the monorepo, so
that I can see what operations are available without hardcoded configuration.

#### Acceptance Criteria

1. THE Entity_Registry SHALL use
   `Discovery::attribute(Exportable::class)->get()` to discover all exportable
   models at boot time.
2. THE Entity_Registry SHALL use
   `Discovery::attribute(Importable::class)->get()` to discover all importable
   models at boot time.
3. THE Entity_Registry SHALL use
   `Discovery::attribute(SampleData::class)->get()` to discover all
   sample-data-capable models at boot time.
4. THE Entity_Registry SHALL provide methods to list all registered exportable
   entities, importable entities, and sample-data entities as collections of
   configuration DTOs.
5. THE Entity_Registry SHALL be bound as `#[Scoped]` to ensure Octane-safe
   per-request isolation.
6. THE Import_Export_Compiler SHALL be annotated with
   `#[AsCompiler(priority: 25, phase: CompilerPhase::REGISTRY)]` and SHALL
   pre-resolve all attribute configurations into a cached registry file during
   `php artisan di:compile`.

### Requirement 6: Export Operations

**User Story:** As an API consumer, I want to export entity data with column
selection, filtering, and format choice, so that I can generate reports and data
extracts.

#### Acceptance Criteria

1. WHEN an export is requested for a registered entity, THE Export_Manager SHALL
   accept parameters for: entity identifier, format (Export_Format), column
   selection (subset of declared fields), and filter criteria (compatible with
   CRUD package filter operators).
2. WHEN the requested format is CSV, THE Export_Manager SHALL generate a CSV
   file using Laravel Excel with the configured Field_Map as column headers.
3. WHEN the requested format is XLSX, THE Export_Manager SHALL generate an XLSX
   file using Laravel Excel with the configured Field_Map as column headers.
4. WHEN the requested format is JSON, THE Export_Manager SHALL generate a JSON
   file containing an array of objects keyed by the Field_Map column headers.
5. WHEN the requested format is PDF, THE Export_Manager SHALL generate a PDF
   file using Laravel Excel's PDF export capability with the configured
   Field_Map as column headers.
6. WHILE a tenant context is active, THE Export_Manager SHALL automatically
   scope all export queries to the current tenant using the `BelongsToTenant`
   trait's global scope.
7. WHEN no tenant context is active, THE Export_Manager SHALL export data
   without tenant scoping for central (non-tenant) entities.

### Requirement 7: Import Operations

**User Story:** As an API consumer, I want to import entity data from uploaded
files with validation, duplicate detection, and error reporting, so that I can
bulk-load data into the system.

#### Acceptance Criteria

1. WHEN an import file is uploaded for a registered entity, THE Import_Manager
   SHALL validate each row against the `rules` defined in the `#[Importable]`
   attribute.
2. WHEN validation fails for one or more rows, THE Import_Manager SHALL collect
   all validation errors and include them in the Import_Result without aborting
   the entire import.
3. WHEN the `uniqueBy` fields match an existing record, THE Import_Manager SHALL
   update the existing record instead of creating a duplicate.
4. WHEN the `uniqueBy` fields do not match any existing record, THE
   Import_Manager SHALL create a new record.
5. WHILE a tenant context is active, THE Import_Manager SHALL auto-fill the
   tenant_id column on all imported records with the current Tenant_Context
   value.
6. WHEN a dry-run import is requested, THE Import_Manager SHALL validate all
   rows and return the Import_Result without persisting any data to the
   database.
7. THE Import_Manager SHALL return an Import_Result DTO containing: total rows
   processed, rows created, rows updated, rows skipped, and an array of
   row-level validation errors.
8. WHEN the `transformers` parameter is configured, THE Import_Manager SHALL
   apply each transformer to the corresponding field value before validation and
   persistence.

### Requirement 8: Async-First API with Queue Support

**User Story:** As a platform operator, I want all imports and exports to run as
queued jobs with real-time progress feedback via broadcasting, so that the
system remains responsive and the frontend can show live status updates.

#### Acceptance Criteria

1. WHEN an export is requested, THE Export_Manager SHALL always dispatch an
   Export_Job to the queue and return a job ID — never process synchronously.
2. WHEN an import is requested (non-dry-run), THE Import_Manager SHALL always
   dispatch an Import_Job to the queue and return a job ID — never process
   synchronously.
3. WHEN an Export_Job begins processing, THE Export_Job SHALL dispatch an
   `ExportStarted` event containing the job ID, user ID, entity identifier, and
   requested format.
4. WHILE an Export_Job is processing chunks, THE Export_Job SHALL dispatch
   `ExportProgress` events containing the job ID, user ID, rows processed, and
   total rows.
5. WHEN an Export_Job completes, THE Export_Job SHALL dispatch an
   `ExportCompleted` event containing the job ID, user ID, file path, and total
   rows exported.
6. IF an Export_Job fails, THEN THE Export_Job SHALL dispatch an `ExportFailed`
   event containing the job ID, user ID, and error message.
7. WHEN an Import_Job begins processing, THE Import_Job SHALL dispatch an
   `ImportStarted` event containing the job ID, user ID, entity identifier, and
   file name.
8. WHILE an Import_Job is processing chunks, THE Import_Job SHALL dispatch
   `ImportProgress` events containing the job ID, user ID, rows processed, and
   total rows.
9. WHEN an Import_Job completes, THE Import_Job SHALL dispatch an
   `ImportCompleted` event containing the job ID, user ID, and the
   Import_Result.
10. IF an Import_Job fails, THEN THE Import_Job SHALL dispatch an `ImportFailed`
    event containing the job ID, user ID, and error message.
11. THE config file SHALL expose `import-export.queue.connection`,
    `import-export.queue.queue_name`, `import-export.export.chunk_size`, and
    `import-export.import.chunk_size` as configurable values.
12. WHEN a dry-run import is requested, THE Import_Manager SHALL process
    synchronously (not queued) since it is a validation-only operation, and
    return the Import_Result directly.

### Requirement 9: Broadcasting and Real-Time Notifications

**User Story:** As a frontend developer, I want to receive real-time
notifications when import/export jobs complete or fail, so that I can update the
UI without polling.

#### Acceptance Criteria

1. ALL job lifecycle events (`ExportStarted`, `ExportProgress`,
   `ExportCompleted`, `ExportFailed`, `ImportStarted`, `ImportProgress`,
   `ImportCompleted`, `ImportFailed`) SHALL implement `ShouldBroadcast`.
2. ALL broadcastable events SHALL broadcast on a private channel named
   `private-user.{userId}.import-export` where `userId` is the authenticated
   user who initiated the job.
3. THE `userId` SHALL be captured from `auth()->id()` at the time the job is
   dispatched and stored on the job instance.
4. THE broadcasting channel SHALL be per-user (not per-job and not per-entity)
   to avoid channel proliferation.
5. THE config file SHALL expose `import-export.broadcasting.enabled` (default:
   `true`) and `import-export.broadcasting.channel_prefix` (default: `user`).
6. WHEN broadcasting is disabled via config, THE events SHALL still be
   dispatched as regular Laravel events but SHALL NOT implement
   `ShouldBroadcast`.

### Requirement 10: REST API Endpoints

**User Story:** As a frontend developer, I want REST API endpoints for
triggering imports, exports, downloads, and checking job status, so that I can
build UI for data management.

#### Acceptance Criteria

1. THE Import_Export_Controller SHALL expose a `POST /api/import-export/export`
   endpoint that accepts entity identifier, format, column selection, filter
   criteria, and optional CSV separator overrides, and SHALL return
   `202 Accepted` with a job ID.
2. THE Import_Export_Controller SHALL expose a `POST /api/import-export/import`
   endpoint that accepts a file upload, entity identifier, and optional CSV
   separator overrides, and SHALL return `202 Accepted` with a job ID.
3. THE Import_Export_Controller SHALL expose a
   `POST /api/import-export/import/dry-run` endpoint that accepts a file upload
   and entity identifier, and returns an Import_Result without persisting data
   (synchronous).
4. THE Import_Export_Controller SHALL expose a
   `GET /api/import-export/status/{jobId}` endpoint that returns the current
   progress and status of an async import or export job.
5. THE Import_Export_Controller SHALL expose a
   `GET /api/import-export/download/{jobId}` endpoint that returns the generated
   export file for a completed async export job.
6. THE Import_Export_Controller SHALL expose a `GET /api/import-export/entities`
   endpoint that returns all registered exportable, importable, and sample-data
   entities with their configurations.
7. THE Import_Export_Controller SHALL expose a
   `POST /api/import-export/sample-data` endpoint that accepts an entity
   identifier and optional count, and triggers sample data generation.
8. THE Import_Export_Controller SHALL use `#[AsController]` attribute, Spatie
   Data DTOs for request validation, and JsonResource for response formatting.
9. THE Import_Export_Controller SHALL expose a
   `GET /api/import-export/template/{entity}` endpoint that returns an empty
   file with column headers matching the entity's `#[Importable]` Field_Map.

### Requirement 11: Multi-Tenant Awareness

**User Story:** As a platform operator, I want all import/export operations to
respect tenant boundaries, so that tenant data isolation is maintained.

#### Acceptance Criteria

1. WHILE a tenant context is active, THE Export_Manager SHALL scope all export
   queries to the current tenant without requiring explicit tenant filtering
   from the caller.
2. WHILE a tenant context is active, THE Import_Manager SHALL set the tenant_id
   column on all imported records to the current tenant's key.
3. WHILE a tenant context is active, THE Sample_Data_Generator SHALL generate
   all sample records within the current tenant's scope.
4. WHEN no tenant context is active, THE Import_Export_Engine SHALL operate on
   central (non-tenant-scoped) entities without applying tenant filtering.
5. THE Import_Export_Engine SHALL detect tenant-scoped entities by checking for
   the `BelongsToTenant` trait on the model class.

### Requirement 12: Configuration

**User Story:** As a developer, I want a publishable config file for the
import-export package, so that I can customize default behavior per environment.

#### Acceptance Criteria

1. THE config file `config/import-export.php` SHALL expose the following
   settings: `export.default_format` (default: `xlsx`), `export.chunk_size`
   (default: 1000), `export.storage_disk` (default: `local`),
   `export.storage_path` (default: `exports`).
2. THE config file SHALL expose: `import.chunk_size` (default: 500),
   `import.storage_disk` (default: `local`), `import.storage_path` (default:
   `imports`), `import.max_file_size` (default: `10240` kilobytes),
   `import.allowed_errors` (default: `0` for unlimited), `import.on_error`
   (default: `skip`).
3. THE config file SHALL expose: `csv.field_separator` (default: `,`),
   `csv.multi_value_separator` (default: `|`), `csv.enclosure` (default: `"`).
4. THE config file SHALL expose: `queue.enabled` (default: `true`),
   `queue.connection` (default: `null` for default connection),
   `queue.queue_name` (default: `import-export`).
5. THE config file SHALL expose: `broadcasting.enabled` (default: `true`),
   `broadcasting.channel_prefix` (default: `user`).
6. THE config file SHALL expose: `sample_data.default_count` (default: 10).
7. THE config file SHALL expose: `pdf.paper_size` (default: `a4`),
   `pdf.orientation` (default: `landscape`).

### Requirement 13: CSV Separator Configuration

**User Story:** As an admin, I want to configure CSV field separators,
multi-value separators, and field enclosure characters, so that I can
import/export files that use pipes, semicolons, tabs, or other delimiters.

#### Acceptance Criteria

1. THE config file SHALL support `csv.field_separator` for the column delimiter
   (e.g., `,`, `|`, `;`, `\t`).
2. THE config file SHALL support `csv.multi_value_separator` for separating
   multiple values within a single field (e.g., `|` for tags like
   `tag1|tag2|tag3`).
3. THE config file SHALL support `csv.enclosure` for the field enclosure
   character (e.g., `"`, `'`).
4. THE Export and Import API endpoints SHALL accept optional `fieldSeparator`,
   `multiValueSeparator`, and `enclosure` parameters to override the global
   config per-request.
5. WHEN per-request overrides are provided, THE DynamicEntityExport and
   DynamicEntityImport SHALL use the overrides instead of the global config
   values.
6. WHEN no per-request overrides are provided, THE DynamicEntityExport and
   DynamicEntityImport SHALL use the global config values.

### Requirement 14: Domain Events

**User Story:** As a developer in another package, I want to listen to
import/export lifecycle events, so that I can trigger side effects like
notifications or audit logging.

#### Acceptance Criteria

1. THE package SHALL dispatch the following export events annotated with
   `#[AsEvent]`: `ExportStarted`, `ExportProgress`, `ExportCompleted`,
   `ExportFailed`.
2. THE package SHALL dispatch the following import events annotated with
   `#[AsEvent]`: `ImportStarted`, `ImportProgress`, `ImportCompleted`,
   `ImportFailed`.
3. THE package SHALL dispatch a `SampleDataGenerated` event annotated with
   `#[AsEvent]` when sample data generation completes, containing the entity
   identifier, tenant ID, and record count.
4. ALL events SHALL be readonly DTOs carrying scalar IDs (not model instances)
   so they can be serialized to a queue.
5. ALL job lifecycle events SHALL include `userId` in their payload for
   broadcasting channel routing.

### Requirement 15: Import Template and Sample File Generation

**User Story:** As an API consumer, I want to download an import template file
for any importable entity, so that I know the expected column format before
uploading data.

#### Acceptance Criteria

1. THE Import_Export_Controller SHALL expose a
   `GET /api/import-export/template/{entity}` endpoint that returns an empty
   file (CSV or XLSX) with column headers matching the entity's `#[Importable]`
   Field_Map.
2. WHEN a template is requested in XLSX format, THE Export_Manager SHALL include
   a header row with column names derived from the `#[Importable]` field
   mapping.
3. WHEN a template is requested in CSV format, THE Export_Manager SHALL include
   a header row with column names derived from the `#[Importable]` field
   mapping.

### Requirement 16: Import/Export Enums

**User Story:** As a developer, I want typed enums for export and import
formats, so that format selection is type-safe and self-documenting.

#### Acceptance Criteria

1. THE Export_Format enum SHALL define cases: `CSV`, `XLSX`, `JSON`, `PDF` as a
   backed string enum with `use Enum` trait, `#[Label]`, and `#[Description]` on
   each case.
2. THE Import_Format enum SHALL define cases: `CSV`, `XLSX`, `JSON` as a backed
   string enum with `use Enum` trait, `#[Label]`, and `#[Description]` on each
   case.
3. THE Export_Format enum SHALL provide a `mimeType()` method returning the MIME
   type for each format.
4. THE Export_Format enum SHALL provide an `extension()` method returning the
   file extension for each format.
