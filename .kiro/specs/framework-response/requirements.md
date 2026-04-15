# Requirements Document

## Introduction

The Framework Response sub-package provides a unified, fluent API response
system for the Pixielity framework. It lives at
`packages/framework/src/Response/` under namespace `Pixielity\Response` and
modernizes the legacy Response package to follow current Pixielity conventions:
PHP 8.4+ attributes (`#[Scoped]`, `#[Bind]`, `#[Config]`), discovery-based
registration, `declare(strict_types=1)`, comprehensive docblocks, and `ATTR_*`
constants. The package delivers a fluent Response builder, content negotiation
via pluggable renderers, response presets, request-scoped context management,
HATEOAS links, pagination metadata, lazy data resolution, pipeline transformers,
and seamless integration with the existing Routing base Controller and CRUD
attribute system (`#[UseService]`, `#[UseData]`, `#[UseResource]`).

## Glossary

- **Response_Builder**: The fluent builder class
  (`Pixielity\Response\Builders\Response`) that provides chainable methods for
  constructing API responses with status codes, data, meta, links, headers, and
  ETag values.
- **ApiResponse**: The Responsable class (`Pixielity\Response\Http\ApiResponse`)
  that converts builder state into a final Symfony HTTP response via content
  negotiation and pipeline transformations.
- **Renderer**: A pluggable content formatter (JSON, XML, View, Stream) that
  converts response payloads into a specific output format. Renderers implement
  the `Renderer` contract and are discoverable via the `#[AsRenderer]`
  attribute.
- **RendererResolver**: The service that performs content negotiation by parsing
  the HTTP Accept header and resolving the appropriate Renderer for a given
  request.
- **RendererResult**: A value object holding the rendered body string, content
  type, and additional headers produced by a Renderer.
- **Preset**: A configuration object (API, Admin, Mobile) that provides default
  renderer, headers, meta, JSON flags, and debug settings for a specific client
  type. Presets are discoverable via the `#[AsPreset]` attribute.
- **ResponseContextManager**: A request-scoped service that manages
  infrastructure metadata (request ID, trace ID, API version, timestamps)
  automatically merged into every response.
- **ResponseFactory**: A singleton factory providing static-like methods
  (`make()`, `api()`, `admin()`, `mobile()`, `ok()`, `created()`, etc.) for
  creating pre-configured Response_Builder instances.
- **Response_Facade**: A Laravel Facade providing static access to the
  ResponseFactory.
- **HasLinks**: A trait providing HATEOAS link management (add, remove, merge
  links with relation, href, and HTTP method).
- **HasMeta**: A trait providing response metadata management (add, merge,
  conditional meta).
- **HasPagination**: A trait providing automatic pagination metadata and link
  extraction from Laravel paginators.
- **ResolvesLazyData**: A trait providing deferred data resolution via closures
  and automatic conversion of Eloquent models, collections, and JSON resources
  to arrays.
- **Pipeline_Transformer**: A class that post-processes the response payload
  array before rendering, applied via Laravel's Pipeline.
- **InteractsWithResponse**: A controller trait in the Routing package that
  delegates response building to the Response sub-package via the
  Response_Facade.
- **UseData_Attribute**: The `#[UseData]` attribute on controllers that
  specifies a Spatie Data DTO class for automatic input/output transformation in
  CRUD methods.
- **UseResource_Attribute**: The `#[UseResource]` attribute on controllers that
  specifies an API Resource class with method-specific mapping (single,
  collection, paginated) for automatic response transformation.
- **Controller**: The abstract base controller (`Pixielity\Routing\Controller`)
  that composes interaction traits for request, response, auth, pagination,
  resources, bulk operations, and services.
- **AsRenderer**: A PHP attribute (`#[AsRenderer]`) placed on Renderer
  implementations to enable discovery-based registration with the
  RendererResolver.
- **AsPreset**: A PHP attribute (`#[AsPreset]`) placed on Preset implementations
  to enable discovery-based registration.

## Requirements

### Requirement 1: Fluent Response Builder

**User Story:** As a developer, I want a fluent, chainable response builder, so
that I can construct API responses with minimal boilerplate and maximum
readability.

#### Acceptance Criteria

1. THE Response_Builder SHALL provide chainable methods for setting
   success/error state, HTTP status code, data payload, message, metadata,
   HATEOAS links, validation errors, custom headers, and ETag value.
2. THE Response_Builder SHALL provide shorthand methods for common HTTP status
   codes: `ok` (200), `created` (201), `accepted` (202), `noContent` (204),
   `badRequest` (400), `unauthorized` (401), `forbidden` (403), `notFound`
   (404), `conflict` (409), `unprocessable` (422), and `serverError` (500).
3. WHEN the `ok` method is called with a data argument, THE Response_Builder
   SHALL set the status to 200, mark the response as success, and assign the
   data payload.
4. WHEN the `paginate` method is called with a LengthAwarePaginator or
   CursorPaginator, THE Response_Builder SHALL extract pagination metadata
   (current_page, last_page, per_page, total) and HATEOAS navigation links
   (first, last, prev, next) automatically.
5. WHEN the `toResponse` method is called, THE Response_Builder SHALL delegate
   to ApiResponse for final HTTP response generation including content
   negotiation and pipeline transformations.
6. THE Response_Builder SHALL implement the `Responsable` contract so that
   Laravel can automatically convert the builder to an HTTP response when
   returned from a controller.
7. THE Response_Builder SHALL use the `#[Scoped]` attribute to ensure
   request-scoped binding for Octane safety.
8. THE Response_Builder SHALL use the `#[Bind]` attribute to bind to the
   `ResponseBuilder` contract interface.

### Requirement 2: ApiResponse (Responsable Output)

**User Story:** As a developer, I want a unified Responsable class that handles
content negotiation and response rendering, so that controllers return
consistent HTTP responses regardless of the requested format.

#### Acceptance Criteria

1. THE ApiResponse SHALL implement Laravel's `Responsable` interface and produce
   a Symfony HTTP Response from the `toResponse` method.
2. WHEN `toResponse` is called, THE ApiResponse SHALL resolve lazy data via the
   ResolvesLazyData trait, build the payload structure, apply pipeline
   transformers, resolve the appropriate Renderer via the RendererResolver, and
   return the rendered HTTP response.
3. THE ApiResponse SHALL include in the payload: `success` flag, `message`,
   `timestamp`, `request_id`, optional `etag`, optional `data`, optional `meta`,
   optional `links`, and optional `errors`.
4. WHEN the response context has debug mode enabled or the `withMetrics` method
   was called, THE ApiResponse SHALL include a `debug` section with execution
   time and memory usage.
5. THE ApiResponse SHALL merge context metadata from the ResponseContextManager
   into the response payload automatically.
6. THE ApiResponse SHALL merge HATEOAS links from both the
   ResponseContextManager and the builder's own links.
7. THE ApiResponse SHALL use the `#[Scoped]` attribute for Octane-safe
   request-scoped binding.
8. THE ApiResponse SHALL use the `#[Bind]` attribute to bind to the
   `ApiResponse` contract interface.

### Requirement 3: Content Negotiation via Pluggable Renderers

**User Story:** As a developer, I want pluggable content renderers with Accept
header-based negotiation, so that the same controller action can serve JSON,
XML, HTML, or stream responses based on client preference.

#### Acceptance Criteria

1. THE Renderer contract SHALL define methods:
   `render(mixed $data, array $meta, array $options): RendererResult`,
   `contentType(): string`, `supports(string $mimeType): bool`, and
   `priority(): int`.
2. THE JsonRenderer SHALL render payloads as JSON with configurable encoding
   flags and support MIME types `application/json`, `text/json`, and `*/*` as
   fallback.
3. THE XmlRenderer SHALL render payloads as XML with proper UTF-8 encoding and
   support MIME types `application/xml` and `text/xml`.
4. THE ViewRenderer SHALL render payloads using Laravel's View system and
   support MIME type `text/html`.
5. THE StreamRenderer SHALL set up appropriate streaming headers
   (X-Accel-Buffering, Cache-Control) and support stream-related MIME types.
6. WHEN a Renderer class is annotated with the `#[AsRenderer]` attribute, THE
   discovery system SHALL automatically register the Renderer with the
   RendererResolver.
7. THE RendererResult SHALL be a value object containing the rendered `body`
   string, `contentType` string, and an array of additional `headers`.

### Requirement 4: Renderer Resolver with Accept Header Parsing

**User Story:** As a developer, I want automatic content negotiation based on
the Accept header, so that clients receive responses in their preferred format
without explicit format selection.

#### Acceptance Criteria

1. THE RendererResolver SHALL resolve the appropriate Renderer using the
   following priority: explicit renderer override, preset default renderer,
   Accept header content negotiation, fallback to JsonRenderer.
2. WHEN the Accept header contains multiple MIME types with quality factors, THE
   RendererResolver SHALL parse quality values and match renderers in descending
   quality order.
3. THE RendererResolver SHALL provide a `register` method for adding custom
   renderers and maintain renderers sorted by priority.
4. THE RendererResolver SHALL use the `#[Scoped]` attribute for Octane-safe
   request-scoped binding.
5. THE RendererResolver SHALL use the `#[Bind]` attribute to bind to the
   `RendererResolver` contract interface.

### Requirement 5: Response Presets

**User Story:** As a developer, I want pre-configured response presets for
different client types (API, Admin, Mobile), so that I can apply consistent
defaults without repeating configuration.

#### Acceptance Criteria

1. THE Preset contract SHALL define methods: `getName(): string`,
   `getDefaultRenderer(): string`, `getDefaultHeaders(): array`,
   `getDefaultMeta(): array`, `getApiVersion(): ?string`, `isDebug(): bool`, and
   `getJsonFlags(): int`.
2. THE ApiPreset SHALL configure JSON rendering, strict security headers
   (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy),
   API versioning from config, and compact JSON output with debug-mode pretty
   printing.
3. THE AdminPreset SHALL configure JSON rendering, relaxed security headers
   (SAMEORIGIN frame options), debug enabled in non-production environments, and
   always-pretty-printed JSON.
4. THE MobilePreset SHALL configure compact JSON rendering, minimal headers for
   bandwidth optimization, 5-minute client cache, and debug disabled.
5. WHEN a Preset class is annotated with the `#[AsPreset]` attribute, THE
   discovery system SHALL automatically register the Preset.
6. THE ResponseFactory SHALL provide `api()`, `admin()`, and `mobile()` methods
   that create Response_Builder instances pre-configured with the corresponding
   Preset.

### Requirement 6: ResponseContextManager

**User Story:** As a developer, I want request-scoped response context that
automatically injects infrastructure metadata into every response, so that
request tracking, tracing, and debugging work without manual intervention.

#### Acceptance Criteria

1. THE ResponseContextManager SHALL generate a unique request ID per request,
   preferring the `X-Request-ID`, `X-Amzn-RequestId`, or `X-Correlation-ID`
   header if present, falling back to a UUID.
2. THE ResponseContextManager SHALL capture the trace ID from the `X-Trace-ID`
   header and the API version from the `X-API-Version` header when present.
3. THE ResponseContextManager SHALL record an ISO 8601 timestamp at construction
   time.
4. THE ResponseContextManager SHALL provide methods to get/set arbitrary context
   data, merge metadata, and add global HATEOAS links.
5. THE ResponseContextManager SHALL read the debug flag from the `app.debug`
   config using the `#[Config]` attribute.
6. THE ResponseContextManager SHALL use the `#[Scoped]` attribute for
   Octane-safe request-scoped binding.
7. THE ResponseContextManager SHALL use the `#[Bind]` attribute to bind to the
   `ResponseContext` contract interface.

### Requirement 7: ResponseFactory and Facade

**User Story:** As a developer, I want a factory and facade for creating
responses, so that I can build responses from controllers, services, or
middleware with a clean static-like API.

#### Acceptance Criteria

1. THE ResponseFactory SHALL provide a `make()` method that creates a blank
   Response_Builder instance.
2. THE ResponseFactory SHALL provide shorthand methods (`ok`, `created`,
   `noContent`, `badRequest`, `unauthorized`, `forbidden`, `notFound`,
   `unprocessable`, `serverError`) that delegate to the Response_Builder.
3. THE ResponseFactory SHALL use the `#[Singleton]` attribute to ensure a single
   factory instance per application lifecycle.
4. THE Response_Facade SHALL extend Laravel's Facade class and resolve the
   ResponseFactory as its accessor.
5. THE Response_Facade SHALL declare `@method static` annotations for all
   factory methods to enable IDE autocompletion.

### Requirement 8: Response Concerns (Traits)

**User Story:** As a developer, I want reusable traits for links, meta,
pagination, and lazy data, so that response builders and API responses share
consistent behavior without code duplication.

#### Acceptance Criteria

1. THE HasLinks trait SHALL provide methods to add, remove, merge, and
   conditionally add HATEOAS links with relation name, href, and HTTP method.
2. THE HasLinks trait SHALL provide convenience methods for common link
   relations: self, edit, delete, create, and collection.
3. THE HasMeta trait SHALL provide methods to add, merge, conditionally add, and
   reset metadata key-value pairs.
4. THE HasMeta trait SHALL provide methods to add timestamp and execution time
   metadata.
5. THE HasPagination trait SHALL extract pagination metadata (current_page,
   last_page, per_page, total, from, to) from LengthAwarePaginator instances.
6. THE HasPagination trait SHALL extract pagination metadata (per_page,
   has_more, next_cursor, prev_cursor) from CursorPaginator instances.
7. THE HasPagination trait SHALL extract HATEOAS navigation links (first, last,
   prev, next) from paginator instances.
8. THE ResolvesLazyData trait SHALL resolve Closure data by invoking the closure
   before output.
9. THE ResolvesLazyData trait SHALL convert Eloquent Models, Eloquent
   Collections, JSON Resources, Resource Collections, and Arrayable instances to
   arrays.
10. THE ResolvesLazyData trait SHALL support recursive resolution of nested lazy
    data.

### Requirement 9: Pipeline Transformers

**User Story:** As a developer, I want to apply post-processing transformations
to response payloads before rendering, so that I can add cross-cutting concerns
like security headers, debug info, or data filtering without modifying
individual controllers.

#### Acceptance Criteria

1. WHEN pipeline transformers are configured on the Response_Builder via the
   `through` method, THE ApiResponse SHALL pass the payload array through
   Laravel's Pipeline before rendering.
2. THE pipeline transformers SHALL receive the payload array and return a
   modified payload array.
3. WHEN no pipeline transformers are configured, THE ApiResponse SHALL skip the
   pipeline step and render the payload directly.
4. THE response configuration file SHALL support a global `pipeline` array for
   transformers applied to all responses.

### Requirement 10: Controller Integration via InteractsWithResponse

**User Story:** As a developer, I want the base Controller's response helpers to
delegate to the Response sub-package, so that calling `$this->ok($data)` in a
controller uses the full Response builder pipeline.

#### Acceptance Criteria

1. THE InteractsWithResponse trait SHALL provide a `response()` method that
   returns a Response_Builder instance pre-configured with the API preset via
   the Response_Facade.
2. THE InteractsWithResponse trait SHALL provide shorthand methods (`ok`,
   `created`, `accepted`, `noContent`, `badRequest`, `unauthorized`,
   `forbidden`, `notFound`, `conflict`, `unprocessable`, `serverError`) that
   delegate to the Response_Builder.
3. WHEN a shorthand method receives a message parameter, THE
   InteractsWithResponse trait SHALL set the message on the Response_Builder.
4. THE Controller base class SHALL compose the InteractsWithResponse trait
   alongside other interaction traits (InteractsWithAuth, InteractsWithRequest,
   InteractsWithResources, InteractsWithServices, InteractsWithPagination,
   InteractsWithBulkOperations).

### Requirement 11: UseData Attribute Integration for CRUD Response Transformation

**User Story:** As a developer, I want the `#[UseData]` attribute on controllers
to auto-resolve the Spatie Data DTO for CRUD methods, so that input validation
and output transformation happen automatically.

#### Acceptance Criteria

1. WHEN a controller class has the `#[UseData]` attribute, THE Controller SHALL
   resolve the specified Spatie Data class via reflection.
2. WHEN a CRUD store or update method receives input data and the controller has
   `#[UseData]`, THE Controller SHALL validate and transform the input array
   into the specified Data DTO before passing to the service layer.
3. WHEN a CRUD method returns a model and the controller has `#[UseData]`, THE
   Controller SHALL transform the output model into the specified Data DTO using
   `Data::from()`.

### Requirement 12: UseResource Attribute Integration for CRUD Response Transformation

**User Story:** As a developer, I want the `#[UseResource]` attribute on
controllers to auto-resolve the API Resource class for response transformation,
so that CRUD methods automatically wrap results in the correct resource format.

#### Acceptance Criteria

1. WHEN a controller class has the `#[UseResource]` attribute, THE Controller
   SHALL resolve the specified API Resource class via reflection.
2. WHEN a CRUD method listed in `singleMethods` (find, create, update, etc.)
   returns a result and the controller has `#[UseResource]`, THE Controller
   SHALL wrap the result in a single resource instance of the specified class.
3. WHEN a CRUD method listed in `collectionMethods` (all, findBy, etc.) returns
   a result and the controller has `#[UseResource]`, THE Controller SHALL wrap
   the result using the resource class's `collection()` method.
4. WHEN a CRUD method listed in `paginatedMethods` (paginate) returns a result
   and the controller has `#[UseResource]`, THE Controller SHALL wrap the result
   in a paginated resource collection.
5. THE UseResource_Attribute SHALL support customizable method lists for single,
   collection, and paginated mappings with sensible defaults.

### Requirement 13: Discovery Attributes for Renderers and Presets

**User Story:** As a developer, I want renderers and presets to be
auto-discovered via PHP attributes, so that adding a new renderer or preset
requires only creating the class with the appropriate attribute.

#### Acceptance Criteria

1. THE `#[AsRenderer]` attribute SHALL be a PHP attribute targeting classes,
   with an optional `priority` parameter.
2. THE `#[AsPreset]` attribute SHALL be a PHP attribute targeting classes, with
   an optional `name` parameter.
3. WHEN the service provider boots, THE Response sub-package SHALL discover all
   classes annotated with `#[AsRenderer]` and register them with the
   RendererResolver.
4. WHEN the service provider boots, THE Response sub-package SHALL discover all
   classes annotated with `#[AsPreset]` and make them available for resolution.

### Requirement 14: Sub-Package Structure and Configuration

**User Story:** As a framework maintainer, I want the Response sub-package to
follow the established framework sub-package pattern, so that it integrates
consistently with the monorepo build and module system.

#### Acceptance Criteria

1. THE Response sub-package SHALL reside at `packages/framework/src/Response/`
   with source code in `src/` and configuration in `config/`.
2. THE Response sub-package SHALL have a `composer.json` with name
   `pixielity/laravel-response`, PSR-4 autoload mapping `Pixielity\Response\` to
   `src/`, and appropriate dependencies.
3. THE Response sub-package SHALL have a `module.json` with name `Response`,
   alias `response`, and a service provider reference.
4. THE Response sub-package SHALL provide a `config/response.php` configuration
   file with settings for default preset, API version, debug mode, JSON encoding
   options, default headers, request ID header name, renderers list, and global
   pipeline transformers.
5. THE Response sub-package SHALL include a service provider that registers
   bindings, publishes configuration, and boots renderer/preset discovery.
6. THE Response sub-package SHALL declare `strict_types=1` in every PHP file.
7. THE Response sub-package SHALL include comprehensive PHPDoc blocks on every
   class, method, and property.

### Requirement 15: Octane Safety

**User Story:** As a developer deploying on Laravel Octane, I want the Response
sub-package to be free of mutable singleton state leakage, so that concurrent
requests produce isolated, correct responses.

#### Acceptance Criteria

1. THE ApiResponse SHALL use `#[Scoped]` binding to ensure a fresh instance per
   request.
2. THE ResponseContextManager SHALL use `#[Scoped]` binding to ensure a fresh
   context per request.
3. THE RendererResolver SHALL use `#[Scoped]` binding to ensure a fresh resolver
   per request.
4. THE Response_Builder SHALL use `#[Scoped]` binding to ensure a fresh builder
   per request.
5. THE ResponseFactory SHALL use `#[Singleton]` binding because the factory
   itself holds no mutable request state.
6. THE Preset implementations SHALL use `#[Singleton]` binding because presets
   hold no mutable request state.

### Requirement 16: ETag Generation

**User Story:** As a developer, I want automatic ETag generation for response
data, so that clients can use conditional requests for cache validation without
manual ETag management.

#### Acceptance Criteria

1. WHEN the response contains data and no explicit ETag is set, THE ApiResponse
   SHALL generate an ETag by computing an MD5 hash of the JSON-encoded data.
2. WHEN an explicit ETag is set via the `withETag` or `etag` method, THE
   ApiResponse SHALL use the provided ETag value instead of generating one.
3. THE ApiResponse SHALL include the ETag as both a payload field and an HTTP
   `ETag` header wrapped in double quotes.
