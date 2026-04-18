# Go (Golang) Standards

## File Naming Convention

Go uses **snake_case** for file names. Go does NOT use type suffixes in the same
way as TypeScript, but files are named after the primary entity they contain.

| Entity Type       | Convention                      | Example                                           |
| ----------------- | ------------------------------- | ------------------------------------------------- |
| Package main file | `package_name.go`               | `container.go`                                    |
| Interface         | Dedicated file, named by entity | `repository.go` (contains `Repository` interface) |
| Struct            | Named by entity                 | `user.go`                                         |
| Errors            | `errors.go`                     | `errors.go` (one per package is acceptable in Go) |
| Constants         | `constants.go`                  | `constants.go`                                    |
| Handler           | `_handler.go`                   | `user_handler.go`                                 |
| Service           | `_service.go`                   | `auth_service.go`                                 |
| Repository        | `_repository.go`                | `user_repository.go`                              |
| Middleware        | `_middleware.go`                | `auth_middleware.go`                              |
| Model             | `_model.go`                     | `user_model.go`                                   |
| DTO               | `_dto.go`                       | `create_user_dto.go`                              |
| Helper            | `_helper.go`                    | `string_helper.go`                                |
| Utility           | `_util.go`                      | `date_util.go`                                    |
| Config            | `config.go`                     | `config.go`                                       |
| Test              | `_test.go`                      | `auth_service_test.go`                            |
| Mock              | `mock_*.go`                     | `mock_repository.go`                              |

**Go-specific rule**: In Go, one file may contain a closely related interface +
its error types if they form a single contract. However, prefer separation when
entities are independently reusable.

## Folder Structure

### Go Application (Clean Architecture)

```
cmd/
├── api/
│   └── main.go                     # Application entry point
├── worker/
│   └── main.go                     # Background worker entry
internal/
├── domain/
│   ├── user/
│   │   ├── user.go                 # User entity/struct
│   │   ├── repository.go           # Repository interface
│   │   ├── service.go              # Business logic
│   │   └── errors.go               # Domain-specific errors
│   └── order/
│       ├── order.go
│       ├── repository.go
│       ├── service.go
│       └── errors.go
├── handler/
│   ├── user_handler.go
│   └── order_handler.go
├── repository/
│   ├── postgres/
│   │   ├── user_repository.go      # PostgreSQL implementation
│   │   └── order_repository.go
│   └── redis/
│       └── cache_repository.go
├── middleware/
│   ├── auth_middleware.go
│   └── logging_middleware.go
├── dto/
│   ├── create_user_dto.go
│   └── update_user_dto.go
├── config/
│   └── config.go
└── pkg/
    ├── logger/
    │   └── logger.go
    ├── validator/
    │   └── validator.go
    └── httputil/
        └── response.go
```

### Go Package (Library)

```
container/
├── container.go                    # Main Container struct + methods
├── options.go                      # Functional options
├── errors.go                       # Package-level errors
├── lifetime.go                     # ServiceLifetime type (iota enum)
├── descriptor.go                   # ServiceDescriptor struct
├── container_test.go
└── doc.go                          # Package-level documentation
```

## Go Enum Pattern (iota)

Go has no `enum` keyword. Use `iota` with a custom type in a dedicated file:

```go
// lifetime.go

package container

// ServiceLifetime defines how long a service instance lives.
type ServiceLifetime int

const (
    // Transient creates a new instance on every resolution.
    Transient ServiceLifetime = iota

    // Singleton creates one instance shared across the container.
    Singleton

    // Scoped creates one instance per scope.
    Scoped
)

// String returns the human-readable name of the lifetime.
func (l ServiceLifetime) String() string {
    switch l {
    case Transient:
        return "Transient"
    case Singleton:
        return "Singleton"
    case Scoped:
        return "Scoped"
    default:
        return "Unknown"
    }
}
```

## Docblock Standard

```go
// Package container provides a dependency injection container
// inspired by Laravel's service container.
//
// It supports singleton, transient, and scoped lifetimes
// with automatic constructor injection.
package container

import "fmt"

// Container manages service registration and resolution.
//
// It stores service descriptors and resolves dependencies
// at runtime using reflection or factory functions.
type Container struct {
    // bindings holds all registered service descriptors.
    bindings map[string]*ServiceDescriptor

    // singletons caches resolved singleton instances.
    singletons map[string]interface{}

    // isBooted indicates whether the container has been bootstrapped.
    isBooted bool
}

// New creates and returns an empty Container instance.
//
// The returned container is ready for service registration
// but must be booted before resolving services.
func New() *Container {
    return &Container{
        bindings:   make(map[string]*ServiceDescriptor),
        singletons: make(map[string]interface{}),
    }
}

// Bind registers a factory function for the given service name.
//
// Each call to Resolve will invoke the factory to create a new instance.
// Returns an error if the name is already registered.
//
//   container.Bind("logger", func() (interface{}, error) {
//       return NewLogger(), nil
//   })
func (c *Container) Bind(name string, factory Factory) error {
    // Prevent duplicate registrations.
    if _, exists := c.bindings[name]; exists {
        return fmt.Errorf("service %q is already registered", name)
    }

    // Store the descriptor with transient lifetime.
    c.bindings[name] = &ServiceDescriptor{
        Name:     name,
        Factory:  factory,
        Lifetime: Transient,
    }

    return nil
}
```
