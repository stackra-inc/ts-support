# TypeScript / JavaScript Standards

## File Naming Convention

All files use **kebab-case** with a **type suffix** before the extension:

| Entity Type       | File Suffix             | Example                          |
| ----------------- | ----------------------- | -------------------------------- |
| Interface         | `.interface.ts`         | `user.interface.ts`              |
| Type              | `.type.ts`              | `api-response.type.ts`           |
| Enum              | `.enum.ts`              | `user-role.enum.ts`              |
| Constant          | `.constant.ts`          | `api-endpoints.constant.ts`      |
| Class             | `.ts` (no suffix)       | `user.ts`                        |
| Service           | `.service.ts`           | `auth.service.ts`                |
| Controller        | `.controller.ts`        | `user.controller.ts`             |
| Middleware        | `.middleware.ts`        | `auth.middleware.ts`             |
| Guard             | `.guard.ts`             | `roles.guard.ts`                 |
| Pipe / Validator  | `.pipe.ts`              | `validation.pipe.ts`             |
| Decorator         | `.decorator.ts`         | `roles.decorator.ts`             |
| Helper            | `.helper.ts`            | `string.helper.ts`               |
| Utility           | `.util.ts`              | `date.util.ts`                   |
| Hook (React)      | `.hook.ts`              | `use-auth.hook.ts`               |
| Component (React) | `.component.tsx`        | `user-card.component.tsx`        |
| Test              | `.spec.ts` / `.test.ts` | `auth.service.spec.ts`           |
| DTO               | `.dto.ts`               | `create-user.dto.ts`             |
| Schema            | `.schema.ts`            | `user.schema.ts`                 |
| Config            | `.config.ts`            | `database.config.ts`             |
| Module            | `.module.ts`            | `auth.module.ts`                 |
| Factory           | `.factory.ts`           | `user.factory.ts`                |
| Repository        | `.repository.ts`        | `user.repository.ts`             |
| Mapper            | `.mapper.ts`            | `user.mapper.ts`                 |
| Exception/Error   | `.exception.ts`         | `not-found.exception.ts`         |
| Event             | `.event.ts`             | `user-created.event.ts`          |
| Listener          | `.listener.ts`          | `send-welcome-email.listener.ts` |
| Subscriber        | `.subscriber.ts`        | `user.subscriber.ts`             |
| Provider          | `.provider.ts`          | `database.provider.ts`           |
| Strategy          | `.strategy.ts`          | `jwt.strategy.ts`                |
| Adapter           | `.adapter.ts`           | `stripe.adapter.ts`              |

## Folder Structure

### NestJS / Backend Application

```
src/
├── modules/
│   └── user/
│       ├── controllers/
│       │   └── user.controller.ts
│       ├── services/
│       │   └── user.service.ts
│       ├── repositories/
│       │   └── user.repository.ts
│       ├── interfaces/
│       │   ├── user.interface.ts
│       │   └── user-response.interface.ts
│       ├── dtos/
│       │   ├── create-user.dto.ts
│       │   └── update-user.dto.ts
│       ├── enums/
│       │   └── user-role.enum.ts
│       ├── types/
│       │   └── user-payload.type.ts
│       ├── constants/
│       │   └── user-defaults.constant.ts
│       ├── exceptions/
│       │   └── user-not-found.exception.ts
│       ├── events/
│       │   └── user-created.event.ts
│       ├── guards/
│       │   └── roles.guard.ts
│       ├── decorators/
│       │   └── roles.decorator.ts
│       ├── pipes/
│       │   └── validation.pipe.ts
│       ├── mappers/
│       │   └── user.mapper.ts
│       ├── user.module.ts
│       └── index.ts               # Barrel export
├── common/
│   ├── interfaces/
│   │   └── paginated-response.interface.ts
│   ├── helpers/
│   │   └── string.helper.ts
│   ├── utils/
│   │   └── date.util.ts
│   ├── constants/
│   │   └── app.constant.ts
│   ├── exceptions/
│   │   └── base.exception.ts
│   └── index.ts
├── config/
│   ├── database.config.ts
│   ├── app.config.ts
│   └── index.ts
├── app.module.ts
└── main.ts
```

### React / Next.js Frontend Application

```
src/
├── components/
│   └── UserCard/
│       ├── UserCard.component.tsx
│       ├── UserCard.styles.ts      # or .module.css
│       ├── UserCard.hook.ts        # component-specific hook
│       ├── UserCard.type.ts        # component-specific types
│       └── index.ts                # export { UserCard } from './UserCard.component'
├── hooks/
│   ├── use-auth.hook.ts
│   ├── use-debounce.hook.ts
│   └── index.ts
├── interfaces/
│   ├── user.interface.ts
│   └── api-response.interface.ts
├── types/
│   ├── route-params.type.ts
│   └── theme.type.ts
├── enums/
│   ├── user-role.enum.ts
│   └── api-status.enum.ts
├── constants/
│   ├── routes.constant.ts
│   └── api-endpoints.constant.ts
├── services/
│   ├── auth.service.ts
│   └── api.service.ts
├── utils/
│   ├── format-date.util.ts
│   └── validate-email.util.ts
├── helpers/
│   ├── storage.helper.ts
│   └── token.helper.ts
└── contexts/
    └── AuthContext/
        ├── AuthContext.context.ts
        ├── AuthContext.provider.tsx
        └── index.ts
```

## Barrel Export Pattern

Every folder that contains multiple files MUST have an `index.ts` that
re-exports:

```typescript
// interfaces/index.ts
export { User } from './user.interface';
export { ApiResponse } from './api-response.interface';
```

Import from the barrel, not the individual file:

```typescript
// CORRECT
import { User, ApiResponse } from '@/interfaces';

// WRONG
import { User } from '@/interfaces/user.interface';
```

## Docblock Standard

```typescript
/**
 * Handles user authentication and session management.
 *
 * @remarks
 * This service depends on JwtService for token operations
 * and UserRepository for persistence.
 */
export class AuthService {
  /**
The JWT service used for token generation and validation. */
  private readonly _jwtService: JwtService;

  /**
   * Authenticates a user with the provided credentials.
   *
   * @param credentials - The login credentials (email + password).
   * @returns The authenticated user with an access token.
   * @throws UnauthorizedException if credentials are invalid.
   */
  async login(credentials: LoginDto): Promise<AuthResponse> {
    // Validate the provided credentials against stored records.
    const user = await this._validateCredentials(credentials);

    // Generate a signed JWT token for the authenticated session.
    const token = this._jwtService.sign({ sub: user.id });

    return { user, token };
  }
}
```
