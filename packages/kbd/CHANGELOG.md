# @abdokouta/kbd

## 2.0.0

### Breaking Changes — DI Refactor

- 🏗️ Refactored to `KbdModule.forRoot()` / `forFeature()` DynamicModule pattern
- 💉 `ShortcutRegistry` is now the @Injectable service (replaces `KbdModule`
  static methods)
- 🏷️ Added DI tokens: `KBD_CONFIG`, `SHORTCUT_REGISTRY`
- 📁 Added `constants/` folder with `tokens.constant.ts`
- 🔄 `KbdModule.register()` / `.get()` / `.getAll()` / `.query()` replaced by
  `ShortcutRegistry` methods
- 🌐 Global singleton `shortcutRegistry` export preserved for non-DI usage

## 1.0.0

### Initial Release

- 🎉 Initial release of @abdokouta/kbd
- ⌨️ HeroUI Kbd component integration
- 🗂️ Keyboard shortcut registry with categories and contexts
- 🔧 Platform-specific key resolution (macOS, Windows, Linux)
- 🎭 Priority system for conflict resolution
- 🔄 Alternative key combinations support
- 📦 Built-in shortcuts: navigation, editing, search, view, help, modals
- 🪝 React hooks: `useShortcut`, `useShortcuts`, `useShortcutRegistry`,
  `useKeyboardShortcut`
- 🧩 Components: `RefineKbd`, `ShortcutList`, `ShortcutHelp`, `ShortcutHint`
- ♿ ARIA-compliant keyboard shortcut displays
