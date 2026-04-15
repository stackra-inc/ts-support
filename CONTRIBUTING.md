# Contributing — frontend-monorepo

## Prerequisites

| Tool    | Minimum | Install            |
| ------- | ------- | ------------------ |
| Node.js | 18      | https://nodejs.org |
| npm     | 10      | bundled with Node  |

## Getting started

```bash
# 1. Clone
git clone https://github.com/your-org/frontend-monorepo.git
cd frontend-monorepo

# 2. Install (also installs git hooks via `prepare`)
npm install

# 3. Start dev servers
npm run dev
```

## Workflow

1. Branch from `main`: `git checkout -b feat/my-feature`
2. Make changes.
3. `npm run lint`, `npm run check-types`, and `npm run build` must pass.
4. Commit using Conventional Commits: `feat(web): add dark mode`
5. Open a PR against `main`.

## Publishing a package to npm

Remove `"private": true` from the package's `package.json`, then:

```bash
git tag ui-v1.2.3
git push --tags
```

The `release.yml` workflow publishes it automatically.
