---
inclusion: manual
---

# Publishing & CI/CD

Standard process for publishing `@stackra/*` npm packages from GitHub.

## Repository Layout

Every `@stackra/*` package lives in its own repo under `stackra-inc/`:

```
github.com/stackra-inc/<package-name>
```

### Required CI Files

```
.github/
├── actions/setup/action.yml   — Composite: pnpm + Node.js + install
├── assets/
│   ├── banner.svg             — Package banner (source)
│   └── banner.png             — Generated from SVG (for Slack)
├── dependabot.yml             — Daily npm checks, weekly GH Actions
└── workflows/
    ├── ci.yml                 — Push to main + PRs
    ├── publish.yml            — Semver tag push (v1.2.3)
    └── dependabot-auto-merge.yml — Auto-merge @stackra/* dep PRs
```

## CI Workflow

Triggers: push to `main`, PRs targeting `main`.

| Job           | Command             | Notes                     |
| ------------- | ------------------- | ------------------------- |
| 🔷 Type Check | `pnpm typecheck`    | `tsc --noEmit`            |
| 🔨 Build      | `pnpm build`        | tsup dual ESM/CJS output  |
| 🧪 Test       | `pnpm test`         | vitest                    |
| 🎨 Format     | `pnpm format:check` | Prettier                  |
| 🔍 Lint       | `pnpm lint`         | ESLint `--max-warnings 0` |

## Publish Workflow

Triggers: pushing a semver tag (`v1.2.3` or `v1.2.3-beta.0`).

### Flow

```
validate → quality → publish → release → notify
```

1. **Validate** — confirms tag matches `package.json` version
2. **Quality Gate** — typecheck + build + format (uploads dist artifact)
3. **Publish** — checks if version exists on npm first, then publishes with provenance
4. **GitHub Release** — extracts notes from `CHANGELOG.md`
5. **Slack Notification** — optional, requires `STACKRA_SLACK_WEBHOOK_URL`

### Duplicate Publish Guard

The publish step checks `npm view` before publishing. If the version already
exists on npm, it skips gracefully instead of failing with E403. This prevents
failures from workflow re-runs or duplicate tag pushes.

### Required Secrets

| Secret                      | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| `STACKRA_NPM_TOKEN`         | npm automation token (read+write packages) |
| `STACKRA_SLACK_WEBHOOK_URL` | Slack webhook (optional)                   |

## Dependabot

### Configuration

- **npm**: daily checks, groups `@stackra/*` deps together
- **GitHub Actions**: weekly checks, all grouped into one PR

### Auto-merge

Dependabot PRs for `@stackra/*` internal packages are automatically approved
and squash-merged after CI passes. External dependency updates require manual
review. This is handled by the `dependabot-auto-merge.yml` workflow.

Requires `allow_auto_merge: true` on the GitHub repo settings.

## Release Process

```bash
# 1. Verify locally
pnpm typecheck && pnpm build && pnpm test && pnpm lint && pnpm format:check

# 2. Bump version in package.json

# 3. Update CHANGELOG.md with a new ## X.Y.Z section

# 4. Commit and push
git add -A
git commit -m "release: vX.Y.Z"
git push origin main

# 5. Wait for CI to pass, then tag
git tag vX.Y.Z
git push origin vX.Y.Z

# 6. Verify the publish workflow
gh run list --repo stackra-inc/<package> --limit 3
```

### Version Conventions

- `0.x.y` — pre-stable, breaking changes allowed in minor
- `1.0.0+` — stable, follow semver strictly
- Tags with hyphens (`v1.0.0-beta.1`) are marked as pre-release

## CHANGELOG Format

```markdown
## X.Y.Z

### Added

- New features

### Changed

- Changes to existing features

### Fixed

- Bug fixes
```
