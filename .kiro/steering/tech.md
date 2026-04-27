# Tech Stack

## Language & Runtime

- TypeScript 6.x (strict mode, experimentalDecorators + emitDecoratorMetadata)
- Node.js >= 22 (LTS)
- ESM-first (`"type": "module"`)
- Target: ES2022

## Build

- **Bundler**: tsup (via `@stackra/tsup-config` base preset)
- **Output**: ESM (`.js`) + CJS (`.cjs`) + `.d.ts` declarations
- **Banner**: copyright + license injected into every output file
- **Package manager**: pnpm 10.x (pinned via `packageManager` field)

## Testing

- **Runner**: Vitest 4.x with `globals: true`
- **Environment**: jsdom
- **Coverage**: v8 provider (text + json + html reports)
- **Test location**: `__tests__/**/*.{test,spec}.{ts,tsx}`
- **Setup file**: `__tests__/vitest.setup.ts`

## Linting & Formatting

- **ESLint**: 9.x (pinned — `@stackra/eslint-config` requires ESLint 9, not 10)
- **ESLint config**: `@stackra/eslint-config` with typescript-eslint flat config
- **Prettier**: extends `@stackra/prettier-config`
- **lint-staged**: runs eslint + prettier on staged files during pre-commit

## Git Hooks (Husky)

- **pre-commit**: runs `lint-staged` (eslint --fix + prettier --write on staged
  files)
- **commit-msg**: runs `commitlint` (enforces conventional commit format)

## Path Aliases

- `@/*` → `./src/*` (configured in tsconfig.json and vitest.config.ts)

## pnpm Overrides

All packages pin these transitive deps to prevent breaking major bumps:

| Package | Pinned To | Reason                                           |
| ------- | --------- | ------------------------------------------------ |
| eslint  | ^9.28.0   | v10 breaks eslint-plugin-react and other plugins |
| vite    | ^7.2.6    | v8 breaks vitest path resolution with @ aliases  |

## Commands

| Command              | Purpose                            |
| -------------------- | ---------------------------------- |
| `pnpm build`         | Production build (tsup)            |
| `pnpm dev`           | Watch mode build                   |
| `pnpm test`          | Run tests once                     |
| `pnpm test:watch`    | Run tests in watch mode            |
| `pnpm test:coverage` | Run tests with coverage            |
| `pnpm typecheck`     | Type-check (`tsc --noEmit`)        |
| `pnpm lint`          | Lint (`eslint . --max-warnings 0`) |
| `pnpm lint:fix`      | Lint and auto-fix                  |
| `pnpm format`        | Format all files                   |
| `pnpm format:check`  | Check formatting (CI)              |
| `pnpm clean`         | Remove dist/ and caches            |
| `pnpm release`       | Publish to npm                     |

## Shared Config Packages

| Package                      | Purpose                                                           |
| ---------------------------- | ----------------------------------------------------------------- |
| `@stackra/typescript-config` | tsconfig presets (base, bundler, next, react-lib, nest-lib, etc.) |
| `@stackra/tsup-config`       | tsup build presets (base, react-lib, nest-lib, cli-lib)           |
| `@stackra/eslint-config`     | ESLint flat config with TypeScript, React, NestJS presets         |
| `@stackra/prettier-config`   | Prettier formatting rules                                         |
