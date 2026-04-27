# Dependency Graph

## Package Hierarchy

```
                    ┌─────────────────────┐
                    │ typescript-config    │  ← Foundation (JSON presets)
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │  tsup-config  │  │prettier-config│  │ eslint-config │
     └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
            │                 │                  │
            └────────┬────────┴──────────────────┘
                     ▼
            ┌──────────────┐
            │  container    │  ← DI framework
            └──────┬───────┘
                   │
         ┌─────────┼─────────┐
         ▼         ▼         ▼
   ┌──────────┐ ┌──────┐ ┌──────┐
   │  support  │ │ redis │ │ http │
   └──────────┘ └──────┘ └──────┘
```

## Dependency Table

| Package           | Depends On                                                                         |
| ----------------- | ---------------------------------------------------------------------------------- |
| typescript-config | (none)                                                                             |
| tsup-config       | typescript-config                                                                  |
| prettier-config   | tsup-config, typescript-config                                                     |
| eslint-config     | tsup-config, typescript-config                                                     |
| container         | tsup-config, typescript-config, prettier-config, eslint-config                     |
| support           | container, tsup-config, typescript-config, prettier-config, eslint-config          |
| redis             | container, support, tsup-config, typescript-config, prettier-config, eslint-config |
| http              | container, support, tsup-config, typescript-config, prettier-config, eslint-config |

## Update Propagation

When you publish a new version of a core package, Dependabot detects it
within 24 hours (daily schedule) and opens a grouped PR in each downstream
repo. The auto-merge workflow approves and squash-merges `@stackra/*` PRs
after CI passes.

### Propagation Order

1. Publish `typescript-config` → triggers updates in tsup-config, prettier-config, eslint-config
2. Publish config packages → triggers updates in container
3. Publish `container` → triggers updates in support, redis, http
4. Publish `support` → triggers updates in redis, http

### Manual Propagation

If you need immediate propagation (not waiting for Dependabot):

```bash
# In the downstream package
ncu -u --filter "@stackra/*"
pnpm install
pnpm typecheck && pnpm build && pnpm test
git add -A && git commit -m "build(deps): bump @stackra/* to latest"
git push origin main
```
