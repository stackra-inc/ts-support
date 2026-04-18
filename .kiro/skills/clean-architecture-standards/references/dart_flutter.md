# Dart / Flutter Standards

## File Naming Convention

All files use **snake_case**. The entity type is embedded as a suffix in the
file name:

| Entity Type          | File Suffix                  | Example                                   |
| -------------------- | ---------------------------- | ----------------------------------------- |
| Class                | `.dart` (no suffix)          | `user.dart`                               |
| Interface (abstract) | `_interface.dart`            | `auth_interface.dart`                     |
| Enum                 | `_enum.dart`                 | `user_role_enum.dart`                     |
| Exception            | `_exception.dart`            | `service_not_found_exception.dart`        |
| Mixin                | `_mixin.dart`                | `validation_mixin.dart`                   |
| Extension            | `_extension.dart`            | `string_extension.dart`                   |
| Typedef              | `_typedef.dart`              | `callback_typedef.dart`                   |
| Service              | `_service.dart`              | `auth_service.dart`                       |
| Repository           | `_repository.dart`           | `user_repository.dart`                    |
| Provider             | `_provider.dart`             | `google_map_provider.dart`                |
| Controller           | `_controller.dart`           | `home_controller.dart`                    |
| Model / DTO          | `_model.dart` / `_dto.dart`  | `user_model.dart`, `create_user_dto.dart` |
| Widget               | `_widget.dart` or `.dart`    | `user_card.dart`                          |
| State                | `_state.dart`                | `counter_state.dart`                      |
| Cubit / Bloc         | `_cubit.dart` / `_bloc.dart` | `auth_cubit.dart`, `auth_bloc.dart`       |
| Event (Bloc)         | `_event.dart`                | `auth_event.dart`                         |
| Helper               | `_helper.dart`               | `date_helper.dart`                        |
| Utility              | `_util.dart`                 | `string_util.dart`                        |
| Constant             | `_constants.dart`            | `app_constants.dart`                      |
| Config               | `_config.dart`               | `database_config.dart`                    |
| Facade               | `_facade.dart`               | `log_facade.dart`                         |
| Factory              | `_factory.dart`              | `widget_factory.dart`                     |
| Adapter              | `_adapter.dart`              | `stripe_adapter.dart`                     |
| Mapper               | `_mapper.dart`               | `user_mapper.dart`                        |
| Test                 | `_test.dart`                 | `auth_service_test.dart`                  |

## Folder Structure

### Flutter Application

```
lib/
├── app/
│   ├── app.dart
│   └── router.dart
├── features/
│   └── auth/
│       ├── controllers/
│       │   └── auth_controller.dart
│       ├── services/
│       │   └── auth_service.dart
│       ├── repositories/
│       │   └── auth_repository.dart
│       ├── interfaces/
│       │   └── auth_interface.dart
│       ├── models/
│       │   ├── user_model.dart
│       │   └── login_request_model.dart
│       ├── enums/
│       │   └── auth_status_enum.dart
│       ├── exceptions/
│       │   └── auth_exception.dart
│       ├── widgets/
│       │   ├── login_form/
│       │   │   ├── login_form.dart
│       │   │   └── login_form.dart  (barrel)
│       │   └── signup_button.dart
│       ├── pages/
│       │   ├── login_page.dart
│       │   └── signup_page.dart
│       └── auth.dart               # Barrel export
├── core/
│   ├── interfaces/
│   │   └── disposable_interface.dart
│   ├── exceptions/
│   │   └── app_exception.dart
│   ├── enums/
│   │   └── environment_enum.dart
│   ├── extensions/
│   │   ├── string_extension.dart
│   │   └── context_extension.dart
│   ├── mixins/
│   │   └── validation_mixin.dart
│   ├── helpers/
│   │   └── date_helper.dart
│   ├── utils/
│   │   └── logger_util.dart
│   ├── constants/
│   │   └── app_constants.dart
│   └── core.dart                   # Barrel export
├── config/
│   ├── app_config.dart
│   ├── theme_config.dart
│   └── config.dart                 # Barrel export
└── main.dart
```

### Dart Package (Pure Dart)

```
lib/
├── src/
│   ├── interfaces/
│   │   └── container_interface.dart
│   ├── enums/
│   │   └── service_lifetime_enum.dart
│   ├── exceptions/
│   │   ├── service_not_found_exception.dart
│   │   └── circular_dependency_exception.dart
│   ├── container.dart              # Main class in src root
│   └── service_descriptor.dart
├── package_name.dart               # Barrel export (public API)
```

### Monorepo Package (Melos)

```
packages/
├── core/
│   ├── lib/
│   │   ├── src/
│   │   │   ├── interfaces/
│   │   │   ├── enums/
│   │   │   ├── exceptions/
│   │   │   └── container.dart
│   │   └── core.dart               # Barrel export
│   └── pubspec.yaml
├── annotations/
│   ├── lib/
│   │   ├── src/
│   │   │   └── service.dart
│   │   └── annotations.dart
│   └── pubspec.yaml
└── melos.yaml
```

## Barrel Export Pattern

Every package or feature module MUST have a barrel file that exports the public
API:

```dart
// lib/core.dart (barrel)
export 'src/interfaces/container_interface.dart';
export 'src/enums/service_lifetime_enum.dart';
export 'src/exceptions/service_not_found_exception.dart';
export 'src/container.dart';
```

Import from the barrel, not individual files:

```dart
// CORRECT
import 'package:core/core.dart';

// WRONG
import 'package:core/src/container.dart';
```

## Docblock Standard

````dart
/// Manages service registration and dependency resolution.
///
/// This container wraps [GetIt] and provides a Laravel-inspired
/// API for binding and resolving services.
///
/// Example:
/// ```dart
/// Container.bind<AuthService>(() => AuthService());
/// final auth = Container.make<AuthService>();
/// ```
class Container {
  /// The underlying service locator instance.
  final GetIt _di;

  /// Whether the container has been initialized.
  bool _isInitialized = false;

  /// Registers a factory binding for [T].
  ///
  /// Each call to [make] will create a new instance.
  ///
  /// - [factory]: A function that returns a new instance of [T].
  /// - Throws [ContainerException] if [T] is already registered.
  void bind<T extends Object>(T Function() factory) {
    // Prevent duplicate registrations to avoid silent overwrites.
    if (_di.isRegistered<T>()) {
      throw ContainerException('$T is already registered.');
    }

    // Register as a factory — new instance on every resolution.
    _di.registerFactory<T>(factory);
  }
}
````
