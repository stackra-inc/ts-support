---
inclusion: manual
---

# Standardize Tool

The `@stackra/tools-standardize` CLI tool audits and enforces consistency across
all `@stackra/*` packages. It lives at `tools/standardize/` in the workspace
root.

## Commands

| Command   | Script             | Purpose                                     |
| --------- | ------------------ | ------------------------------------------- |
| `fix`     | `pnpm start`       | Apply all standards (default)               |
| `audit`   | `pnpm start audit` | Read-only check — reports issues, no writes |
| `verify`  | `pnpm verify`      | Run build/format/typecheck/lint/test        |
| `install` | `pnpm install-all` | pnpm install + husky init across all repos  |
| `deps`    | `pnpm deps`        | Check and install missing devDependencies   |
| `help`    | `pnpm help`        | Show usage                                  |

### Flags

- `--pkg <name>` — Only process a single package (directory name)
- `--dry-run` — For `deps`: report but don't install

## Configuration

All constants live in `tools/standardize/src/config.ts`:

| Constant              | Current Value            | Purpose                        |
| --------------------- | ------------------------ | ------------------------------ |
| `NPM_SCOPE`           | `@stackra`               | npm scope for all packages     |
| `ORG_NAME`            | `Stackra L.L.C`          | Display name in banners/docs   |
| `ORG_EMAIL`           | `dev@stackra.com`        | Author email                   |
| `ORG_GITHUB`          | `github.com/stackra-inc` | GitHub org URL                 |
| `LICENSE`             | `MIT`                    | License for all packages       |
| `PNPM_VERSION`        | `10.33.2`                | Pinned pnpm version            |
| `NODE_MIN_VERSION`    | `22`                     | Minimum Node.js version        |
| `PNPM_OVERRIDES`      | eslint ^9, vite ^7       | Pinned transitive deps         |
| `DEPENDABOT_ASSIGNEE` | `akouta`                 | GitHub user for Dependabot PRs |

To change any standard, update `config.ts` and re-run `pnpm start`.

## Auto-Discovery

The tool automatically discovers packages by scanning the workspace root for
directories containing a `package.json` with a name starting with `@stackra/`.
No hardcoded package list to maintain.

Packages are sorted in dependency order:

1. `typescript-config` (no internal deps)
2. `*-config` packages (depend on typescript-config)
3. Libraries (depend on config packages)

## What It Standardizes

### package.json

- Scripts (build, test, lint, format, prepare, etc.)
- `engines` (node, pnpm)
- `packageManager` field
- `pnpm.overrides` (eslint, vite pins)

### Config Files

- `.prettierrc.mjs` — extends `@stackra/prettier-config`
- `vitest.config.ts` — standard test setup
- `tsup.config.ts` — uses `@stackra/tsup-config` base preset

### Git Hooks

- `.husky/pre-commit` — runs lint-staged
- `.husky/commit-msg` — runs commitlint

### Commit & Lint

- `commitlint.config.ts` — conventional commit rules
- `.lintstagedrc.mjs` — eslint + prettier on staged files

### Scaffolding

- `.gitignore`
- `.prettierignore`
- `__tests__/vitest.setup.ts`
- `__tests__/setup.d.ts`

### CI

- `.github/dependabot.yml`
- `.github/workflows/dependabot-auto-merge.yml`

## Package Types

The tool classifies packages into three types:

| Type          | Examples                                    | Has lint? | Has vitest? | Has tsup? |
| ------------- | ------------------------------------------- | --------- | ----------- | --------- |
| `library`     | container, http, redis, support             | ✅        | ✅          | ✅        |
| `config`      | eslint-config, prettier-config, tsup-config | ❌        | ✅          | ✅        |
| `json-config` | typescript-config                           | ❌        | ❌          | ❌        |

## Adding a New Package

1. Create the directory with a `package.json` containing
   `"name": "@stackra/..."`
2. Run `pnpm start` from `tools/standardize/` — it auto-discovers and
   standardizes
3. Run `pnpm deps` to install missing devDependencies
4. Run `pnpm install-all` to install everything + init husky
5. Run `pnpm verify` to confirm all checks pass
