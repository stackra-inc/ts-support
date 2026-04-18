# PHP Standards

## File Naming Convention

PHP follows **PSR-4 autoloading**: one class per file, file name matches class
name in **PascalCase**.

| Entity Type    | File Suffix / Convention       | Example                                                     |
| -------------- | ------------------------------ | ----------------------------------------------------------- |
| Class          | `PascalCase.php`               | `User.php`                                                  |
| Interface      | `Interface.php` suffix         | `AuthServiceInterface.php`                                  |
| Enum           | `Enum.php` suffix or plain     | `UserRole.php`                                              |
| Trait          | `Trait.php` suffix             | `HasUuidTrait.php`                                          |
| Abstract Class | `Abstract` prefix              | `AbstractRepository.php`                                    |
| Exception      | `Exception.php` suffix         | `UserNotFoundException.php`                                 |
| Controller     | `Controller.php` suffix        | `UserController.php`                                        |
| Service        | `Service.php` suffix           | `AuthService.php`                                           |
| Repository     | `Repository.php` suffix        | `UserRepository.php`                                        |
| Model          | `PascalCase.php`               | `User.php`                                                  |
| Migration      | `timestamp_description.php`    | `2024_01_15_create_users_table.php`                         |
| Middleware     | `Middleware.php` suffix        | `AuthMiddleware.php`                                        |
| Request (Form) | `Request.php` suffix           | `CreateUserRequest.php`                                     |
| Resource       | `Resource.php` suffix          | `UserResource.php`                                          |
| Event          | `Event.php` suffix or plain    | `UserCreated.php`                                           |
| Listener       | `Listener.php` suffix or plain | `SendWelcomeEmail.php`                                      |
| Job            | `Job.php` suffix or plain      | `ProcessPayment.php`                                        |
| Policy         | `Policy.php` suffix            | `UserPolicy.php`                                            |
| Observer       | `Observer.php` suffix          | `UserObserver.php`                                          |
| Factory        | `Factory.php` suffix           | `UserFactory.php`                                           |
| Seeder         | `Seeder.php` suffix            | `UserSeeder.php`                                            |
| Command        | `Command.php` suffix           | `SendReportsCommand.php`                                    |
| Helper         | `helpers.php` (functions)      | `helpers.php` (only exception: may group related functions) |
| Config         | `snake_case.php`               | `database.php`                                              |
| Test           | `Test.php` suffix              | `AuthServiceTest.php`                                       |
| DTO            | `DTO.php` or `Data.php`        | `CreateUserDTO.php`                                         |
| Action         | `Action.php` suffix            | `CreateUserAction.php`                                      |
| Facade         | `Facade.php` suffix            | `LogFacade.php`                                             |
| Provider       | `ServiceProvider.php` suffix   | `AuthServiceProvider.php`                                   |
| Contract       | same as Interface              | `Authenticatable.php`                                       |

## Folder Structure

### Laravel Application

```
app/
├── Http/
│   ├── Controllers/
│   │   └── UserController.php
│   ├── Middleware/
│   │   └── AuthMiddleware.php
│   └── Requests/
│       ├── CreateUserRequest.php
│       └── UpdateUserRequest.php
├── Models/
│   └── User.php
├── Services/
│   └── AuthService.php
├── Repositories/
│   ├── Contracts/
│   │   └── UserRepositoryInterface.php
│   └── UserRepository.php
├── DTOs/
│   ├── CreateUserDTO.php
│   └── UpdateUserDTO.php
├── Actions/
│   └── CreateUserAction.php
├── Enums/
│   ├── UserRole.php
│   └── UserStatus.php
├── Exceptions/
│   ├── UserNotFoundException.php
│   └── AuthenticationException.php
├── Events/
│   └── UserCreated.php
├── Listeners/
│   └── SendWelcomeEmail.php
├── Jobs/
│   └── ProcessPayment.php
├── Policies/
│   └── UserPolicy.php
├── Observers/
│   └── UserObserver.php
├── Facades/
│   └── LogFacade.php
├── Traits/
│   └── HasUuidTrait.php
├── Contracts/
│   ├── AuthServiceInterface.php
│   └── PaymentGatewayInterface.php
├── Helpers/
│   └── helpers.php
└── Providers/
    └── AuthServiceProvider.php
config/
├── app.php
├── database.php
└── auth.php
database/
├── migrations/
│   └── 2024_01_15_000000_create_users_table.php
├── factories/
│   └── UserFactory.php
└── seeders/
    └── UserSeeder.php
tests/
├── Unit/
│   └── AuthServiceTest.php
└── Feature/
    └── UserControllerTest.php
```

### PHP Package (Composer)

```
src/
├── Contracts/
│   └── ContainerInterface.php
├── Exceptions/
│   ├── ServiceNotFoundException.php
│   └── CircularDependencyException.php
├── Enums/
│   └── ServiceLifetime.php
├── Support/
│   ├── Facade.php
│   └── MultipleInstanceManager.php
├── Container.php
└── ServiceProvider.php
```

## Docblock Standard

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\AuthServiceInterface;
use App\DTOs\CreateUserDTO;
use App\Exceptions\AuthenticationException;
use App\Models\User;

/**
 * Handles user authentication and session management.
 *
 * This service manages login, logout, token refresh,
 * and password reset operations.
 */
class AuthService implements AuthServiceInterface
{
    /**
     * The token time-to-live in minutes.
     *
     * @var int
     */
    private int $tokenTtl;

    /**
     * Create a new AuthService instance.
     *
     * @param UserRepository $users  The user repository for persistence.
     * @param JwtService     $jwt    The JWT service for token operations.
     * @param int            $tokenTtl Token TTL in minutes. Defaults to 60.
     */
    public function __construct(
        private readonly UserRepository $users,
        private readonly JwtService $jwt,
        int $tokenTtl = 60,
    ) {
        $this->tokenTtl = $tokenTtl;
    }

    /**
     * Authenticate a user with the given credentials.
     *
     * @param string $email    The user's email address.
     * @param string $password The user's plain-text password.
     * @return array{user: User, token: string} The authenticated user and JWT.
     *
     * @throws AuthenticationException If credentials are invalid.
     */
    public function login(string $email, string $password): array
    {
        // Attempt to find the user by email.
        $user = $this->users->findByEmail($email);

        // Verify the password against the stored hash.
        if (!$user || !password_verify($password, $user->password)) {
            throw new AuthenticationException('Invalid credentials.');
        }

        // Generate a signed JWT token for the session.
        $token = $this->jwt->sign(['sub' => $user->id], $this->tokenTtl);

        return ['user' => $user, 'token' => $token];
    }
}
```
