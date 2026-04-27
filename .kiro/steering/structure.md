# Project Structure

## Library Packages (container, http, redis, support)

```
<package>/
├── .github/
│   ├── actions/setup/action.yml
│   ├── assets/banner.{svg,png}
│   ├── dependabot.yml
│   └── workflows/{ci,publish,dependabot-auto-merge}.yml
├── .husky/
│   ├── pre-commit              — lint-staged
│   └── commit-msg              — commitlint
├── .kiro/steering/             — Kiro steering files
├── __tests__/
│   ├── setup.d.ts              — Vitest type declarations
│   ├── vitest.setup.ts         — Global test setup
│   └── **/*.test.ts            — Test files
├── src/
│   ├── index.ts                — Main entry point (barrel export)
│   ├── constants/              — DI tokens, metadata keys
│   ├── decorators/             — TypeScript decorators
│   ├── enums/                  — Enumerations
│   ├── interfaces/             — TypeScript interfaces
│   ├── services/               — Injectable services
│   └── utils/                  — Utility functions
├── .gitignore
├── .lintstagedrc.mjs
├── .prettierignore
├── .prettierrc.mjs
├── CHANGELOG.md
├── LICENSE
├── README.md
├── commitlint.config.ts
├── eslint.config.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

## Config Packages (eslint-config, prettier-config, tsup-config)

```
<package>/
├── .github/                    — Same CI structure as libraries
├── .husky/                     — Same hooks
├── __tests__/                  — Same test setup
├── src/
│   ├── index.ts                — Main entry point
│   └── presets/                — Config presets
├── .gitignore
├── .lintstagedrc.mjs
├── .prettierignore
├── .prettierrc.mjs
├── commitlint.config.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

## JSON Config Package (typescript-config)

```
typescript-config/
├── .github/                    — Same CI structure
├── .husky/                     — Same hooks
├── src/
│   └── presets/                — JSON tsconfig presets
│       ├── base.json
│       ├── bundler.json
│       ├── next.json
│       ├── react-lib.json
│       ├── nest-lib.json
│       └── ...
├── .gitignore
├── .lintstagedrc.mjs
├── .prettierignore
├── commitlint.config.ts
├── package.json
└── tsconfig.json
```

## Conventions

- Each folder has an `index.ts` barrel export
- Tests mirror source structure: `src/services/foo.ts` → `__tests__/services/foo.test.ts`
- Examples in `.examples/` (excluded from build)
- React hooks follow `src/hooks/use-<name>/use-<name>.hook.ts`
- One interface per file in `src/interfaces/`
- Path alias `@/*` maps to `./src/*`
