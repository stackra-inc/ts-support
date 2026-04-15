# Installation and Verification Guide

## Package Created Successfully ✅

The `@abdokouta/kbd` package has been created at:

```
packages/kbd/
```

## Verification Steps

### 1. Install Dependencies

From the root of the monorepo:

```bash
pnpm install
```

This will install all dependencies for the new package.

### 2. Build the Package

```bash
cd packages/kbd
pnpm build
```

Or from the root:

```bash
pnpm build --scope @abdokouta/kbd
```

Expected output:

- `dist/index.cjs` - CommonJS bundle
- `dist/index.mjs` - ESM bundle
- `dist/index.d.ts` - Type declarations
- `dist/index.d.mts` - ESM type declarations
- `dist/index.d.cts` - CJS type declarations

### 3. Run Tests

```bash
cd packages/kbd
pnpm test
```

Or from the root:

```bash
pnpm test --scope @abdokouta/kbd
```

Expected: All 20 tests should pass ✅

### 4. Check Package Quality

```bash
cd packages/kbd

# Check package exports
pnpm publint

# Check TypeScript types
pnpm attw
```

### 5. Verify in Development Mode

```bash
cd packages/kbd
pnpm dev
```

This will watch for changes and rebuild automatically.

## Integration Test

### Create a Test Application

1. Create a new refine app or use an existing one
2. Add the package as a dependency:

```json
{
  "dependencies": {
    "@abdokouta/kbd": "workspace:*"
  }
}
```

3. Use the component:

```tsx
import { RefineKbd } from '@abdokouta/kbd';

function App() {
  return (
    <div>
      <p>
        Press <RefineKbd keys={['command', 'K']} /> to search
      </p>
    </div>
  );
}
```

## Lerna Commands

The package is automatically detected by Lerna. You can use these commands:

```bash
# Build all packages including kbd
pnpm build:all

# Test all packages including kbd
pnpm test:all

# Run publint on all packages
pnpm publint:all

# Run attw on all packages
pnpm attw:all
```

## Package Structure Verification

Verify these files exist:

```
packages/kbd/
├── src/
│   ├── components/
│   │   ├── RefineKbd/
│   │   │   └── index.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useKeyboardShortcut.ts
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── keyMappings.ts
│   │   └── index.ts
│   └── index.tsx
├── test/
│   ├── RefineKbd.test.tsx
│   ├── useKeyboardShortcut.test.tsx
│   ├── keyMappings.test.ts
│   └── setup.ts
├── examples/
│   └── basic-usage.tsx
├── dist/ (after build)
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.mts
├── README.md
├── API.md
├── INTEGRATION_GUIDE.md
├── QUICK_START.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── PACKAGE_SUMMARY.md
└── LICENSE
```

## Common Issues and Solutions

### Issue: Dependencies not installed

**Solution**: Run `pnpm install` from the root directory

### Issue: Build fails

**Solution**:

1. Check if all peer dependencies are installed
2. Verify TypeScript version (should be 5.8.3)
3. Check for syntax errors in source files

### Issue: Tests fail

**Solution**:

1. Ensure vitest is installed
2. Check if @testing-library packages are installed
3. Verify test setup file exists

### Issue: Import errors

**Solution**:

1. Make sure the package is built (`pnpm build`)
2. Check if consuming app has correct peer dependencies
3. Verify package.json exports field

## Next Steps After Verification

1. ✅ Verify all tests pass
2. ✅ Build the package successfully
3. ✅ Test in a real refine application
4. ✅ Update root CHANGELOG if needed
5. ✅ Create a changeset if using changesets:
   ```bash
   pnpm changeset
   ```
6. ✅ Commit the new package
7. ✅ Create a PR or merge to main

## Publishing Checklist (When Ready)

- [ ] All tests pass
- [ ] Package builds successfully
- [ ] Documentation is complete
- [ ] CHANGELOG is updated
- [ ] Version number is correct
- [ ] publint passes
- [ ] attw passes
- [ ] Tested in real application
- [ ] Peer dependencies are correct
- [ ] License file exists
- [ ] README is comprehensive

## Support

If you encounter any issues:

1. Check the documentation files in `packages/kbd/`
2. Review the examples in `packages/kbd/examples/`
3. Open an issue on GitHub
4. Ask in the refine Discord community

---

**Package Status**: ✅ Ready for Testing and Integration **Created**: 2026-03-29
**Version**: 1.0.0
