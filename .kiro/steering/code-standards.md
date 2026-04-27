# Code Standards

## Commit Messages

All commits must follow
[Conventional Commits](https://www.conventionalcommits.org/). Enforced by
commitlint via the husky commit-msg hook.

### Format

```
type(scope): description

[optional body]

[optional footer]
```

### Allowed Types

| Type       | When to use                               |
| ---------- | ----------------------------------------- |
| `feat`     | New feature                               |
| `fix`      | Bug fix                                   |
| `docs`     | Documentation changes                     |
| `style`    | Code style (formatting, semicolons, etc.) |
| `refactor` | Code refactoring (no feature/fix)         |
| `perf`     | Performance improvements                  |
| `test`     | Adding or updating tests                  |
| `build`    | Build system changes (tsup, deps, etc.)   |
| `ci`       | CI/CD changes (GitHub Actions, etc.)      |
| `chore`    | Other changes (deps, tooling, etc.)       |
| `revert`   | Revert a previous commit                  |

### Examples

```
feat: add retry logic to HTTP client
fix(redis): handle connection timeout gracefully
docs: update README with new API examples
build(deps): bump @stackra/ts-support to 2.5.7
ci: add duplicate publish guard to prevent E403
```

## TypeScript

- Strict mode enabled
- Use `type` imports: `import type { Foo } from './foo'`
- Prefer `interface` over `type` for object shapes
- Use `@/*` path alias for imports within the package
- Unused variables must be prefixed with `_`
- No `any` unless explicitly justified (DI internals, HTTP generics)

## Documentation

- Every file must have a `@fileoverview` JSDoc block
- Every exported function/class must have a JSDoc block
- Include `@param`, `@returns`, `@throws`, `@example` where applicable
- Config files must document what each option does

## File Naming

- Source files: `kebab-case.ts` (e.g., `redis-manager.service.ts`)
- Test files: `kebab-case.test.ts`
- Interfaces: `kebab-case.interface.ts`
- Constants: `kebab-case.constant.ts`
- Decorators: `kebab-case.decorator.ts`
- Hooks: `use-kebab-case.hook.ts`

## Exports

- Every directory has an `index.ts` barrel export
- The root `src/index.ts` re-exports everything public
- Internal utilities should NOT be exported from the root

## Error Handling

- Use typed errors (extend `Error` with a `code` property)
- Always include context in error messages
- Never swallow errors silently — log or re-throw

## Testing

- Test files go in `__tests__/` mirroring the `src/` structure
- Use `describe` blocks to group related tests
- Use `it` (not `test`) for individual test cases
- Mock external dependencies, don't mock internal logic
- Aim for behavior testing, not implementation testing
