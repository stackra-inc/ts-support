# Implementation Plan: Framework Response Sub-Package

## Overview

Implement the `Pixielity\Response` sub-package at
`packages/framework/src/Response/` following a bottom-up approach: scaffold
first, then value objects and contracts, attributes, concern traits, renderers,
resolver, context manager, presets, core builder/response, factory/facade,
service provider, and finally controller integration. Each task builds on the
previous, ensuring no orphaned code.

## Tasks

- [x] 1. Scaffold project structure and configuration
  - [x] 1.1 Create `packages/framework/src/Response/composer.json` with name
        `pixielity/laravel-response`, PSR-4 autoload mapping
        `Pixielity\Response\` to `src/`, and required dependencies
        (illuminate/support, illuminate/http, illuminate/pipeline,
        illuminate/contracts)
    - _Requirements: 14.2_
  - [x] 1.2 Create `packages/framework/src/Response/module.json` with name
        `Response`, alias `response`, and service provider reference
    - _Requirements: 14.3_
  - [x] 1.3 Create `packages/framework/src/Response/config/response.php` with
        default_preset, api_version, debug, json flags, headers,
        request_id_header, renderers, and pipeline settings
    - _Requirements: 14.4, 9.4_
  - [x] 1.4 Create directory structure: `src/Attributes/`, `src/Builders/`,
        `src/Concerns/`, `src/Facades/`, `src/Factories/`, `src/Http/`,
        `src/Presets/`, `src/Providers/`, `src/Renderers/`, `src/Resolvers/`,
        `src/Services/`, `tests/Unit/`, `tests/Feature/`
    - _Requirements: 14.1_

- [x] 2. Implement RendererResult value object and contract interfaces
  - [x] 2.1 Create `RendererResult` final readonly class in
        `Pixielity\Contracts\Framework\Response` with promoted constructor
        properties: `body` (string), `contentType` (string), `headers` (array).
        Include `declare(strict_types=1)` and comprehensive PHPDoc
    - _Requirements: 3.7, 14.6, 14.7_
  - [x] 2.2 Create `Renderer` contract interface in
        `Pixielity\Contracts\Framework\Response` with methods: `render()`,
        `contentType()`, `supports()`, `priority()`
    - _Requirements: 3.1, 14.6, 14.7_
  - [x] 2.3 Create `RendererResolver` contract interface with methods:
        `resolve()`, `register()`, `getRenderers()`, `getDefaultRenderer()`
    - _Requirements: 4.1, 4.2, 4.3, 14.6, 14.7_
  - [x] 2.4 Create `Preset` contract interface with methods: `getName()`,
        `getDefaultRenderer()`, `getDefaultHeaders()`, `getDefaultMeta()`,
        `getApiVersion()`, `isDebug()`, `getJsonFlags()`
    - _Requirements: 5.1, 14.6, 14.7_
  - [x] 2.5 Create `ResponseContext` contract interface with methods:
        `getRequestId()`, `getTraceId()`, `getApiVersion()`, `getTimestamp()`,
        `isDebug()`, `getMeta()`, `getLinks()`, `set()`, `get()`, `merge()`,
        `toArray()`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 14.6, 14.7_
  - [x] 2.6 Create `ResponseBuilder` contract interface extending `Responsable`
        with all fluent methods: `success()`, `error()`, `status()`, `ok()`,
        `created()`, `accepted()`, `noContent()`, `badRequest()`,
        `unauthorized()`, `forbidden()`, `notFound()`, `conflict()`,
        `unprocessable()`, `serverError()`, `data()`, `paginate()`, `message()`,
        `errors()`, `meta()`, `link()`, `links()`, `header()`, `headers()`,
        `etag()`, `preset()`, `renderer()`, `through()`, `metrics()`
    - _Requirements: 1.1, 1.2, 1.6, 14.6, 14.7_
  - [x] 2.7 Create `ApiResponse` contract interface extending `Responsable` with
        methods: `success()`, `error()`, `withStatus()`, `withMessage()`,
        `withData()`, `withMeta()`, `withLink()`, `withErrors()`,
        `withHeader()`, `withHeaders()`, `withETag()`, `withPreset()`,
        `withRenderer()`, `through()`, `withMetrics()`
    - _Requirements: 2.1, 14.6, 14.7_

- [x] 3. Implement discovery attributes
  - [x] 3.1 Create `AsRenderer` PHP attribute in `Pixielity\Response\Attributes`
        targeting classes, with optional `priority` parameter (default: 0), as
        `final readonly` class
    - _Requirements: 13.1, 14.6, 14.7_
  - [x] 3.2 Create `AsPreset` PHP attribute in `Pixielity\Response\Attributes`
        targeting classes, with optional `name` parameter (default: null), as
        `final readonly` class
    - _Requirements: 13.2, 14.6, 14.7_

- [x] 4. Implement concern traits
  - [x] 4.1 Create `HasLinks` trait in `Pixielity\Response\Concerns` with
        methods: `addLink()`, `addSelfLink()`, `addEditLink()`,
        `addDeleteLink()`, `addCreateLink()`, `addCollectionLink()`,
        `mergeLinks()`, `addLinkIf()`, `removeLink()`, `resetLinks()`,
        `getResponseLinks()`, `hasLink()`, `getLink()`
    - _Requirements: 8.1, 8.2, 14.6, 14.7_
  - [ ]\* 4.2 Write property test for HasLinks add/get round-trip
    - **Property 9: HasLinks Add/Get Round-Trip**
    - **Validates: Requirements 8.1**
  - [x] 4.3 Create `HasMeta` trait in `Pixielity\Response\Concerns` with
        methods: `addMeta()`, `mergeMeta()`, `addMetaIf()`, `addTimestamp()`,
        `addExecutionTime()`, `resetMeta()`, `getResponseMeta()`,
        `hasMetaKey()`, `getMetaValue()`
    - _Requirements: 8.3, 8.4, 14.6, 14.7_
  - [ ]\* 4.4 Write property test for HasMeta add/get round-trip
    - **Property 10: HasMeta Add/Get Round-Trip**
    - **Validates: Requirements 8.3**
  - [x] 4.5 Create `HasPagination` trait in `Pixielity\Response\Concerns` with
        methods: `extractPagination()`, `extractPaginationMeta()`,
        `extractPaginationLinks()`, `resetPagination()`, `getPaginationMeta()`,
        `getPaginationLinks()`. Handle both `LengthAwarePaginator` and
        `CursorPaginator`
    - _Requirements: 8.5, 8.6, 8.7, 14.6, 14.7_
  - [ ]\* 4.6 Write property test for pagination meta extraction
    - **Property 11: Pagination Meta Extraction**
    - **Validates: Requirements 8.5, 8.6**
  - [ ]\* 4.7 Write property test for pagination links matching paginator state
    - **Property 12: Pagination Links Match Paginator State**
    - **Validates: Requirements 8.7**
  - [x] 4.8 Create `ResolvesLazyData` trait in `Pixielity\Response\Concerns`
        with methods: `resolveLazyData()`, `convertToOutput()`, `isLazyData()`,
        `lazy()`, `resolveNestedData()`, `resolveDataIf()`. Handle Closure,
        Model, Collection, JsonResource, ResourceCollection, Arrayable
    - _Requirements: 8.8, 8.9, 8.10, 14.6, 14.7_
  - [ ]\* 4.9 Write property test for closure resolution round-trip
    - **Property 13: Closure Resolution Round-Trip**
    - **Validates: Requirements 8.8**
  - [ ]\* 4.10 Write property test for recursive nested lazy data resolution
    - **Property 14: Recursive Nested Lazy Data Resolution**
    - **Validates: Requirements 8.10**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement renderers
  - [x] 6.1 Create `JsonRenderer` in `Pixielity\Response\Renderers` with
        `#[AsRenderer(priority: 50)]`, supporting MIME types `application/json`,
        `text/json`, `*/*`, with configurable JSON encoding flags via options
    - _Requirements: 3.2, 14.6, 14.7_
  - [ ]\* 6.2 Write property test for JSON render round-trip
    - **Property 2: JSON Render Round-Trip**
    - **Validates: Requirements 3.2**
  - [x] 6.3 Create `XmlRenderer` in `Pixielity\Response\Renderers` with
        `#[AsRenderer(priority: 0)]`, supporting MIME types `application/xml`,
        `text/xml`, with proper UTF-8 encoding
    - _Requirements: 3.3, 14.6, 14.7_
  - [ ]\* 6.4 Write property test for XML render well-formedness
    - **Property 3: XML Render Well-Formedness**
    - **Validates: Requirements 3.3**
  - [x] 6.5 Create `ViewRenderer` in `Pixielity\Response\Renderers` with
        `#[AsRenderer(priority: -10)]`, supporting MIME type `text/html`,
        rendering via Laravel's View system
    - _Requirements: 3.4, 14.6, 14.7_
  - [x] 6.6 Create `StreamRenderer` in `Pixielity\Response\Renderers` with
        `#[AsRenderer(priority: -20)]`, setting streaming headers
        (X-Accel-Buffering, Cache-Control), supporting stream-related MIME types
    - _Requirements: 3.5, 14.6, 14.7_
  - [ ]\* 6.7 Write unit tests for all renderers
    - Test JsonRenderer encoding flags, XmlRenderer UTF-8, StreamRenderer
      headers, RendererResult construction
    - _Requirements: 3.2, 3.3, 3.5, 3.7_

- [x] 7. Implement DefaultRendererResolver
  - [x] 7.1 Create `DefaultRendererResolver` in `Pixielity\Response\Resolvers`
        with `#[Scoped]` and `#[Bind(RendererResolverContract::class)]`.
        Implement `resolve()` with priority chain: explicit override → preset
        default → Accept header → JSON fallback. Implement `register()`
        maintaining priority-sorted order. Implement Accept header parsing with
        quality factor support
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 14.6, 14.7_
  - [ ]\* 7.2 Write property test for renderer resolution priority
    - **Property 4: Renderer Resolution Priority**
    - **Validates: Requirements 4.1**
  - [ ]\* 7.3 Write property test for Accept header quality factor ordering
    - **Property 5: Accept Header Quality Factor Ordering**
    - **Validates: Requirements 4.2**
  - [ ]\* 7.4 Write property test for renderer registry sorted by priority
    - **Property 6: Renderer Registry Sorted by Priority**
    - **Validates: Requirements 4.3**

- [x] 8. Implement ResponseContextManager
  - [x] 8.1 Create `ResponseContextManager` in `Pixielity\Response\Services`
        with `#[Scoped]`, `#[Bind(ResponseContextContract::class)]`, and
        `#[Config('app.debug', false)]` on the debug parameter. Implement
        request ID resolution (X-Request-ID → X-Amzn-RequestId →
        X-Correlation-ID → UUID), trace ID capture, API version capture, ISO
        8601 timestamp, and get/set/merge methods
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 14.6, 14.7_
  - [ ]\* 8.2 Write property test for request ID resolution priority
    - **Property 7: Request ID Resolution Priority**
    - **Validates: Requirements 6.1**
  - [ ]\* 8.3 Write property test for context set/get round-trip
    - **Property 8: ResponseContext Set/Get Round-Trip**
    - **Validates: Requirements 6.4**

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement presets
  - [x] 10.1 Create `ApiPreset` in `Pixielity\Response\Presets` with
        `#[Singleton]` and `#[AsPreset(name: 'api')]`. Configure JSON rendering,
        strict security headers (X-Content-Type-Options, X-Frame-Options,
        X-XSS-Protection, Referrer-Policy), API versioning from config, compact
        JSON with debug-mode pretty printing
    - _Requirements: 5.2, 15.6, 14.6, 14.7_
  - [x] 10.2 Create `AdminPreset` in `Pixielity\Response\Presets` with
        `#[Singleton]` and `#[AsPreset(name: 'admin')]`. Configure JSON
        rendering, relaxed security headers (SAMEORIGIN), debug enabled in
        non-production, always-pretty-printed JSON
    - _Requirements: 5.3, 15.6, 14.6, 14.7_
  - [x] 10.3 Create `MobilePreset` in `Pixielity\Response\Presets` with
        `#[Singleton]` and `#[AsPreset(name: 'mobile')]`. Configure compact
        JSON, minimal headers, 5-minute client cache, debug disabled
    - _Requirements: 5.4, 15.6, 14.6, 14.7_
  - [ ]\* 10.4 Write unit tests for preset configurations
    - Test each preset returns expected headers, JSON flags, debug settings,
      renderer class, and API version
    - _Requirements: 5.2, 5.3, 5.4_

- [x] 11. Implement ApiResponse and Response Builder
  - [x] 11.1 Create `ApiResponse` in `Pixielity\Response\Http` with `#[Scoped]`
        and `#[Bind(ApiResponseContract::class)]`. Inject `ResponseContext`,
        `Pipeline`, and `RendererResolver`. Implement `toResponse()` pipeline:
        resolve lazy data → build payload → merge context → apply pipeline
        transformers → resolve renderer → render → build HTTP response with
        headers and ETag
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 9.1, 9.2, 9.3,
      15.1, 14.6, 14.7_
  - [ ]\* 11.2 Write property test for payload required fields invariant
    - **Property 16: Payload Required Fields Invariant**
    - **Validates: Requirements 2.3**
  - [ ]\* 11.3 Write property test for debug section presence
    - **Property 17: Debug Section Presence**
    - **Validates: Requirements 2.4**
  - [ ]\* 11.4 Write property test for context data merged into payload
    - **Property 18: Context Data Merged Into Payload**
    - **Validates: Requirements 2.5, 2.6**
  - [ ]\* 11.5 Write property test for ETag correctness
    - **Property 19: ETag Correctness**
    - **Validates: Requirements 16.1, 16.2, 16.3**
  - [x] 11.6 Create `Response` fluent builder in `Pixielity\Response\Builders`
        with `#[Scoped]` and `#[Bind(ResponseBuilderContract::class)]`. Use
        traits `HasLinks`, `HasMeta`, `HasPagination`, `ResolvesLazyData`,
        `Conditionable`, `Macroable`. Implement all chainable methods, shorthand
        status methods, `paginate()` with auto-extraction, and `toResponse()`
        delegating to `ApiResponse`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 15.4, 14.6, 14.7_
  - [ ]\* 11.7 Write property test for fluent builder returns self
    - **Property 1: Fluent Builder Returns Self**
    - **Validates: Requirements 1.1**
  - [ ]\* 11.8 Write unit tests for builder shorthand methods
    - Test each shorthand method sets correct HTTP status code and success/error
      flag
    - _Requirements: 1.2, 1.3_

- [x] 12. Implement ResponseFactory and Response Facade
  - [x] 12.1 Create `ResponseFactory` in `Pixielity\Response\Factories` with
        `#[Singleton]`. Implement `make()` returning a blank `Response` builder,
        `api()`, `admin()`, `mobile()` applying corresponding presets, and
        shorthand methods (`ok`, `created`, `noContent`, `badRequest`,
        `unauthorized`, `forbidden`, `notFound`, `unprocessable`, `serverError`)
        delegating to the builder
    - _Requirements: 7.1, 7.2, 7.3, 5.6, 15.5, 14.6, 14.7_
  - [x] 12.2 Create `Response` Facade in `Pixielity\Response\Facades` extending
        Laravel's `Facade`, resolving `ResponseFactory` as accessor. Include
        `@method static` annotations for all factory methods for IDE
        autocompletion
    - _Requirements: 7.4, 7.5, 14.6, 14.7_
  - [ ]\* 12.3 Write unit tests for ResponseFactory and Facade
    - Test `make()` returns builder, `api()`/`admin()`/`mobile()` apply correct
      presets, facade accessor resolves factory
    - _Requirements: 7.1, 7.2, 7.4_

- [x] 13. Implement ResponseServiceProvider
  - [x] 13.1 Create `ResponseServiceProvider` in `Pixielity\Response\Providers`.
        In `register()`: bind contracts to implementations. In `boot()`: publish
        config, discover `#[AsRenderer]` classes and register with resolver,
        discover `#[AsPreset]` classes and make available for resolution
    - _Requirements: 14.5, 13.3, 13.4, 3.6, 5.5, 14.6, 14.7_
  - [ ]\* 13.2 Write integration tests for service provider
    - Test bindings resolve correctly, renderer discovery registers renderers,
      preset discovery makes presets available
    - _Requirements: 13.3, 13.4, 14.5_

- [x] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement controller integration
  - [x] 15.1 Create or update `InteractsWithResponse` trait in the Routing
        package. Provide `response()` method returning a `Response` builder
        pre-configured with API preset via the Response Facade. Provide
        shorthand methods (`ok`, `created`, `accepted`, `noContent`,
        `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`,
        `unprocessable`, `serverError`) delegating to the builder, with optional
        message parameter support
    - _Requirements: 10.1, 10.2, 10.3_
  - [x] 15.2 Update the abstract base `Controller` class to compose the
        `InteractsWithResponse` trait alongside existing interaction traits
    - _Requirements: 10.4_
  - [ ]\* 15.3 Write unit tests for InteractsWithResponse trait
    - Test `response()` returns builder with API preset, shorthand methods
      delegate correctly, message parameter is set
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 16. Implement UseData and UseResource attribute integration
  - [x] 16.1 Implement `#[UseData]` attribute integration: resolve Spatie Data
        class via reflection, validate/transform input to Data DTO on
        store/update, transform output model to Data DTO via `Data::from()`
    - _Requirements: 11.1, 11.2, 11.3_
  - [x] 16.2 Implement `#[UseResource]` attribute integration: resolve API
        Resource class via reflection, wrap single results for `singleMethods`,
        wrap collection results via `collection()` for `collectionMethods`, wrap
        paginated results for `paginatedMethods`. Support customizable method
        lists with sensible defaults
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  - [ ]\* 16.3 Write property test for UseResource method list membership
    - **Property 15: UseResource Method List Membership**
    - **Validates: Requirements 12.5**
  - [ ]\* 16.4 Write unit tests for UseData and UseResource integration
    - Test DTO resolution, input transformation, output wrapping for
      single/collection/paginated methods
    - _Requirements: 11.1, 11.2, 11.3, 12.1, 12.2, 12.3, 12.4_

- [x] 17. Verify strict_types and PHPDoc compliance
  - [x] 17.1 Verify all PHP files in the Response sub-package have
        `declare(strict_types=1)` and comprehensive PHPDoc blocks on every
        class, method, and property
    - _Requirements: 14.6, 14.7_
  - [ ]\* 17.2 Write property test for strict_types declaration
    - **Property 20: strict_types Declaration**
    - **Validates: Requirements 14.6**

- [x] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design
  document
- Unit tests validate specific examples and edge cases
- The implementation follows bottom-up order: scaffold → contracts → attributes
  → traits → renderers → resolver → context → presets → core → factory/facade →
  provider → controller integration
