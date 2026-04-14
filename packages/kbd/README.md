# @abdokouta/kbd

Keyboard shortcut management with DI integration, registry pattern, platform-specific keys, and React components.

## Installation

```bash
pnpm add @abdokouta/kbd
```

## Features

- ⌨️ `KbdModule.forRoot()` / `forFeature()` with DI integration
- 🗂️ `ShortcutRegistry` as the central @Injectable service
- 🏷️ DI tokens: `KBD_CONFIG`, `SHORTCUT_REGISTRY`
- 🔧 Platform-specific key resolution (macOS, Windows, Linux)
- 🎯 Context-aware shortcuts (global, editor, modal, form)
- 🎭 Priority system for conflict resolution
- 🔄 Alternative key combinations per shortcut
- 📦 Built-in shortcuts for navigation, editing, search, view, help, modals
- 🪝 React hooks: `useShortcut`, `useShortcuts`, `useShortcutRegistry`, `useKeyboardShortcut`
- 🧩 Components: `RefineKbd`, `ShortcutList`, `ShortcutHelp`, `ShortcutHint`
- ♿ ARIA-compliant keyboard shortcut displays

## Usage

### Module Registration

```typescript
/**
 * |-------------------------------------------------------------------
 * | Register KbdModule in your root AppModule.
 * |-------------------------------------------------------------------
 */
import { Module } from "@abdokouta/ts-container";
import { KbdModule } from "@abdokouta/kbd";

@Module({
  imports: [KbdModule.forRoot({ registerBuiltIn: true, debug: false })],
})
export class AppModule {}
```

### Feature Module Shortcuts

```typescript
/**
 * |-------------------------------------------------------------------
 * | Register feature-specific shortcuts via forFeature().
 * |-------------------------------------------------------------------
 */
@Module({
  imports: [
    KbdModule.forFeature([
      {
        id: "pos:scan",
        name: "Scan Barcode",
        category: "custom",
        context: "global",
        keys: { mac: ["F2"], windows: ["F2"], linux: ["F2"] },
        callback: () => scanBarcode(),
      },
    ]),
  ],
})
export class PosModule {}
```

### Injecting ShortcutRegistry

```typescript
/**
 * |-------------------------------------------------------------------
 * | Inject ShortcutRegistry via DI to register/query shortcuts.
 * |-------------------------------------------------------------------
 */
import { Injectable, Inject } from "@abdokouta/ts-container";
import { ShortcutRegistry, SHORTCUT_REGISTRY } from "@abdokouta/kbd";

@Injectable()
export class EditorService {
  constructor(@Inject(SHORTCUT_REGISTRY) private shortcuts: ShortcutRegistry) {}

  init() {
    this.shortcuts.register({
      id: "editor.save",
      name: "Save",
      category: "editing",
      context: "editor",
      keys: { mac: ["command", "S"], windows: ["ctrl", "S"] },
      callback: () => this.save(),
    });
  }
}
```

### React Hooks

```tsx
/**
 * |-------------------------------------------------------------------
 * | useShortcut registers a shortcut with automatic cleanup.
 * |-------------------------------------------------------------------
 */
import { useShortcut, useShortcutRegistry, RefineKbd } from "@abdokouta/kbd";

function SaveButton() {
  useShortcut({ id: "editor.save", callback: () => handleSave() });
  const registry = useShortcutRegistry();

  return (
    <button onClick={handleSave}>
      Save <RefineKbd keys={["command", "S"]} />
    </button>
  );
}
```

## API Reference

| Export                      | Type      | Description                                   |
| --------------------------- | --------- | --------------------------------------------- |
| `KbdModule`                 | Module    | DI module with `forRoot()` and `forFeature()` |
| `ShortcutRegistry`          | Service   | Central registry for all keyboard shortcuts   |
| `KBD_CONFIG`                | Token     | DI token for module configuration             |
| `SHORTCUT_REGISTRY`         | Token     | DI token for ShortcutRegistry singleton       |
| `RefineKbd`                 | Component | Display keyboard shortcut keys                |
| `ShortcutList`              | Component | Filterable list of registered shortcuts       |
| `ShortcutHelp`              | Component | Help modal showing all shortcuts              |
| `ShortcutHint`              | Component | Inline shortcut hint display                  |
| `useShortcut(opts)`         | Hook      | Register a single shortcut with cleanup       |
| `useShortcuts(opts)`        | Hook      | Register multiple shortcuts at once           |
| `useShortcutRegistry()`     | Hook      | Access the ShortcutRegistry in components     |
| `useKeyboardShortcut(opts)` | Hook      | Low-level hook for custom key combos          |
| `useKbdVisibility()`        | Hook      | Control kbd visibility context                |

## License

MIT
