# Testing Guide for @abdokouta/kbd

## Overview

The `@abdokouta/kbd` package includes comprehensive test coverage using Vitest
and React Testing Library.

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test key-mappings.util.test.ts
```

## Test Structure

### Unit Tests

Located alongside source files with `.test.ts` or `.test.tsx` extension:

```
src/
  utils/
    key-mappings.util.ts
    key-mappings.util.test.ts
  registries/
    shortcut.registry.ts
    shortcut.registry.test.ts
  components/
    refine-kbd/
      refine-kbd.component.tsx
      refine-kbd.test.tsx
```

### Test Categories

1. **Utility Tests** (`*.util.test.ts`)
   - Key mapping functions
   - Helper utilities
   - Pure functions

2. **Registry Tests** (`*.registry.test.ts`)
   - Shortcut registration
   - Conflict detection
   - Platform detection
   - Event system

3. **Module Tests** (`*.module.test.ts`)
   - KbdModule API
   - Configuration
   - Built-in shortcuts

4. **Component Tests** (`*.test.tsx`)
   - Component rendering
   - Props handling
   - User interactions

## Writing Tests

### Example: Testing a Utility Function

```typescript
import { describe, it, expect } from 'vitest';
import { isKeyValue } from './key-mappings.util';

describe('isKeyValue', () => {
  it('should return true for valid key values', () => {
    expect(isKeyValue('command')).toBe(true);
    expect(isKeyValue('ctrl')).toBe(true);
  });

  it('should return false for invalid key values', () => {
    expect(isKeyValue('invalid')).toBe(false);
  });
});
```

### Example: Testing a Component

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RefineKbd } from "./refine-kbd.component";

describe("RefineKbd", () => {
  it("should render keyboard keys", () => {
    render(<RefineKbd keys={["command", "K"]} />);

    expect(screen.getByText("⌘")).toBeInTheDocument();
    expect(screen.getByText("K")).toBeInTheDocument();
  });
});
```

### Example: Testing with Mocks

```typescript
import { describe, it, expect, vi } from 'vitest';
import { KbdModule } from './kbd.module';

describe('KbdModule', () => {
  it('should register a shortcut with callback', () => {
    const callback = vi.fn();

    KbdModule.register({
      id: 'test',
      name: 'Test',
      keys: ['ctrl', 'T'],
      callback,
    });

    // Trigger the shortcut somehow
    // ...

    expect(callback).toHaveBeenCalled();
  });
});
```

## Test Coverage Goals

- **Utilities**: 100% coverage
- **Registry**: 95%+ coverage
- **Module**: 90%+ coverage
- **Components**: 85%+ coverage
- **Hooks**: 85%+ coverage

## Current Test Files

1. `key-mappings.util.test.ts` - Key mapping utilities
2. `shortcut.registry.test.ts` - Shortcut registry
3. `kbd.module.test.ts` - KBD module
4. `refine-kbd.test.tsx` - RefineKbd component

## TODO: Additional Tests Needed

- [ ] Hook tests (`useShortcut`, `useShortcuts`, `useShortcutRegistry`)
- [ ] Component tests (`ShortcutList`, `ShortcutHelp`)
- [ ] Integration tests (registry + hooks + components)
- [ ] E2E tests (keyboard event handling)
- [ ] Platform detection tests
- [ ] Conflict resolution tests
- [ ] Event system tests

## CI/CD Integration

Tests run automatically on:

- Pull requests
- Commits to main branch
- Pre-publish checks

## Debugging Tests

```bash
# Run tests with verbose output
pnpm test --reporter=verbose

# Run tests with UI
pnpm test --ui

# Debug specific test
pnpm test --inspect-brk key-mappings.util.test.ts
```

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **One assertion per test**: Keep tests focused
3. **Descriptive names**: Use clear test descriptions
4. **Mock external dependencies**: Isolate units
5. **Clean up**: Reset state between tests
6. **Test edge cases**: Cover error conditions
7. **Use TypeScript**: Leverage type safety

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
