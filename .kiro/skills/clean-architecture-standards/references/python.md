# Python Standards

## File Naming Convention

Python uses **snake_case** for all file and directory names. Type suffixes are
optional but recommended for clarity in larger projects.

| Entity Type       | Convention                   | Example                           |
| ----------------- | ---------------------------- | --------------------------------- |
| Class             | `snake_case.py`              | `user.py`                         |
| Interface (ABC)   | `_interface.py` or `_abc.py` | `repository_interface.py`         |
| Protocol          | `_protocol.py`               | `serializable_protocol.py`        |
| Enum              | `_enum.py`                   | `user_role_enum.py`               |
| Exception         | `_exception.py`              | `not_found_exception.py`          |
| Service           | `_service.py`                | `auth_service.py`                 |
| Repository        | `_repository.py`             | `user_repository.py`              |
| Model             | `_model.py`                  | `user_model.py`                   |
| Schema (Pydantic) | `_schema.py`                 | `user_schema.py`                  |
| DTO               | `_dto.py`                    | `create_user_dto.py`              |
| Router (FastAPI)  | `_router.py`                 | `user_router.py`                  |
| Controller        | `_controller.py`             | `user_controller.py`              |
| Middleware        | `_middleware.py`             | `auth_middleware.py`              |
| Helper            | `_helper.py`                 | `string_helper.py`                |
| Utility           | `_util.py`                   | `date_util.py`                    |
| Constant          | `_constants.py`              | `app_constants.py`                |
| Config            | `_config.py`                 | `database_config.py`              |
| Factory           | `_factory.py`                | `user_factory.py`                 |
| Command (CLI)     | `_command.py`                | `migrate_command.py`              |
| Task (Celery)     | `_task.py`                   | `send_email_task.py`              |
| Test              | `test_*.py`                  | `test_auth_service.py`            |
| Fixture           | `conftest.py`                | `conftest.py` (pytest convention) |
| Migration         | `versions/` auto-generated   | `001_create_users.py`             |

## Folder Structure

### FastAPI Application

```
app/
├── main.py                         # Application entry point
├── config/
│   ├── __init__.py
│   ├── settings.py                 # Pydantic Settings
│   └── database.py                 # DB connection setup
├── modules/
│   └── user/
│       ├── __init__.py             # Barrel export
│       ├── interfaces/
│       │   ├── __init__.py
│       │   └── user_repository_interface.py
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── create_user_schema.py
│       │   └── user_response_schema.py
│       ├── models/
│       │   ├── __init__.py
│       │   └── user_model.py
│       ├── enums/
│       │   ├── __init__.py
│       │   └── user_role_enum.py
│       ├── exceptions/
│       │   ├── __init__.py
│       │   └── user_not_found_exception.py
│       ├── services/
│       │   ├── __init__.py
│       │   └── user_service.py
│       ├── repositories/
│       │   ├── __init__.py
│       │   └── user_repository.py
│       ├── routers/
│       │   ├── __init__.py
│       │   └── user_router.py
│       └── dependencies/
│           ├── __init__.py
│           └── user_dependencies.py
├── core/
│   ├── __init__.py
│   ├── interfaces/
│   │   ├── __init__.py
│   │   └── base_repository_interface.py
│   ├── exceptions/
│   │   ├── __init__.py
│   │   └── app_exception.py
│   ├── enums/
│   │   ├── __init__.py
│   │   └── environment_enum.py
│   ├── helpers/
│   │   ├── __init__.py
│   │   └── date_helper.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── hash_util.py
│   └── middleware/
│       ├── __init__.py
│       └── auth_middleware.py
├── tasks/
│   ├── __init__.py
│   └── send_email_task.py
└── tests/
    ├── __init__.py
    ├── conftest.py
    └── modules/
        └── user/
            └── test_user_service.py
```

### Python Package (Library)

```
src/
└── package_name/
    ├── __init__.py                 # Public API exports
    ├── interfaces/
    │   ├── __init__.py
    │   └── container_interface.py
    ├── enums/
    │   ├── __init__.py
    │   └── lifetime_enum.py
    ├── exceptions/
    │   ├── __init__.py
    │   ├── not_found_exception.py
    │   └── circular_dependency_exception.py
    ├── container.py
    └── descriptor.py
```

## Barrel Export Pattern (`__init__.py`)

Every package and sub-package MUST have an `__init__.py` that exports the public
API:

```python
# modules/user/__init__.py
"""User module — authentication, profiles, and role management."""

from .services.user_service import UserService
from .models.user_model import User
from .enums.user_role_enum import UserRole
from .exceptions.user_not_found_exception import UserNotFoundException
```

Import from the package, not the internal module:

```python
# CORRECT
from app.modules.user import UserService, User

# WRONG
from app.modules.user.services.user_service import UserService
```

## Docblock Standard (Google Style)

```python
"""User authentication and session management service.

This service handles login, logout, token refresh, and
password reset operations using JWT-based authentication.
"""

from __future__ import annotations

from app.core.interfaces.base_repository_interface import BaseRepository
from app.modules.user.exceptions.auth_exception import AuthException
from app.modules.user.models.user_model import User


class AuthService:
    """Manages user authentication and JWT token lifecycle.

    Attributes:
        _users: Repository for user persistence operations.
        _jwt: Service for JWT token generation and validation.
        _token_ttl: Token time-to-live in minutes.
    """

    def __init__(
        self,
        users: BaseRepository[User],
        jwt: JwtService,
        token_ttl: int = 60,
    ) -> None:
        """Initialize AuthService with required dependencies.

        Args:
            users: The user repository for database operations.
            jwt: The JWT service for token management.
            token_ttl: Token expiry in minutes. Defaults to 60.
        """
        self._users = users
        self._jwt = jwt
        self._token_ttl = token_ttl

    async def login(self, email: str, password: str) -> dict[str, str | User]:
        """Authenticate a user with email and password.

        Validates credentials against stored records and returns
        an authenticated user with a signed JWT token.

        Args:
            email: The user's email address.
            password: The user's plain-text password.

        Returns:
            A dict containing 'user' (User) and 'token' (str).

        Raises:
            AuthException: If the email is not found or password is wrong.
        """
        # Attempt to find the user by their email address.
        user = await self._users.find_by(email=email)

        # Verify the plain-text password against the stored hash.
        if not user or not user.verify_password(password):
            raise AuthException("Invalid credentials.")

        # Generate a signed JWT for the authenticated session.
        token = self._jwt.sign({"sub": str(user.id)}, ttl=self._token_ttl)

        return {"user": user, "token": token}
```
