# Requirements Document

## Introduction

Split the monolithic `@abdokouta/kbd` package into three focused micro-packages
(`@kbd/core`, `@kbd/react`, `@kbd/refine`) following the same conventions
established by `@cart/*` and `@nav/*`. The goal is clean separation of concerns:
pure logic with zero framework dependencies in core, React hooks and components
in react, and Refine.dev integration in refine. The original `@abdokouta/kbd`
package is retained as a compatibility wrapper that re-exports from the new
packages.

## Glossary

- **Core_Package**: The `@kbd/core` micro-package containing pure logic — types,
  interfaces, constants, utilities, ShortcutRegistry, KbdModule, and built-in
  shortcuts. Zero React or DOM runtime dependencies.
- **React_Package**: The `@kbd/react` micro-package containing React hooks
  (useKeyboardShortcut, useShortcut, useShortcuts, useShortcutRegistry) and
  presentational components (RefineKbd, ShortcutList, ShortcutHelp). Depends on
  Core_Package and React.
- **Refine_Package**: The `@kbd/refine` micro-package containing
  Refine.dev-specific integration (Refine-aware RefineKbd, any Refine-specific
  hooks). Depends on Core_Package, React_Package, and @refinedev/core.
- **Compatibility_Wrapper**: The original `@abdokouta/kbd` package updated to
  re-export all public API from Core_Package, React_Package, and Refine_Package
  so existing consumers continue to work without changes.
- **Workspace**: The pnpm monorepo managed by Turborepo, with packages under
  `packages/`.
- **Micro_Package**: A scoped sub-package under `packages/kbd/` (e.g.,
  `packages/kbd/core/`) following the same structure as `@cart/*` and `@nav/*`.
- **ShortcutRegistry**: The central registry class that manages keyboard
  shortcut registration, lookup, conflict detection, and platform-specific key
  resolution. Extends BaseRegistry from `@abdokouta/react-support`.
- **KbdModule**: The static module class providing a high-level API for
  configuring and managing keyboard shortcuts, including built-in shortcut
  registration.
- **Built_In_Shortcuts**: Predefined keyboard shortcut definitions (navigation,
  search, editing, view, help, modal) with associated icon references.

## Requirements

### Requirement 1: Core Package Creation

**User Story:** As a package consumer, I want a standalone `@kbd/core` package
with zero React/DOM runtime dependencies, so that I can use keyboard shortcut
logic in any JavaScript/TypeScript environment.

#### Acceptance Criteria

1. THE Core_Package SHALL export all interfaces: KeyboardShortcut, PlatformKeys,
   ShortcutConflict, ShortcutGroup, ShortcutQueryOptions,
   ShortcutRegistrationOptions.
2. THE Core_Package SHALL export all types: KeyValue, KbdVariant,
   RefineKbdProps, KbdProps, KbdAbbrProps, KbdContentProps.
3. THE Core_Package SHALL export all constants: platforms, priorities,
   shortcut-categories, shortcut-contexts.
4. THE Core_Package SHALL export the utility functions: keyMappings, isKeyValue,
   getKeyMapping.
5. THE Core_Package SHALL export the ShortcutRegistry class and the singleton
   shortcutRegistry instance.
6. THE Core_Package SHALL export the KbdModule class and KbdModuleOptions
   interface.
7. THE Core_Package SHALL export Built_In_Shortcuts: BUILT_IN_SHORTCUTS,
   BUILT_IN_GROUPS, NAVIGATION_SHORTCUTS, SEARCH_SHORTCUTS, EDITING_SHORTCUTS,
   VIEW_SHORTCUTS, HELP_SHORTCUTS, MODAL_SHORTCUTS.
8. THE Core_Package SHALL declare `@abdokouta/react-support` as a runtime
   dependency for the BaseRegistry base class.
9. THE Core_Package SHALL have zero React, ReactDOM, or browser-DOM runtime
   dependencies in its package.json dependencies field.
10. WHEN Built_In_Shortcuts reference icon components, THE Core_Package SHALL
    type icon fields as `string | React.ComponentType<any>` using a type-only
    import so that no React runtime code is bundled.

### Requirement 2: React Package Creation

**User Story:** As a React developer, I want a `@kbd/react` package containing
hooks and presentational components, so that I can integrate keyboard shortcuts
into React applications with a minimal dependency footprint.

#### Acceptance Criteria

1. THE React_Package SHALL export the hooks: useKeyboardShortcut, useShortcut,
   useShortcuts, useShortcutRegistry.
2. THE React_Package SHALL export the hook option types:
   UseKeyboardShortcutOptions, UseShortcutOptions, UseShortcutsOptions,
   UseShortcutRegistryReturn.
3. THE React_Package SHALL export the components: RefineKbd, ShortcutList,
   ShortcutHelp.
4. THE React_Package SHALL export the component prop types: ShortcutListProps,
   ShortcutHelpProps.
5. THE React_Package SHALL declare Core_Package as a workspace runtime
   dependency using `"@kbd/core": "workspace:*"`.
6. THE React_Package SHALL declare `react` and `react-dom` as peer dependencies
   with version range `^18.0.0 || ^19.0.0`.
7. THE React_Package SHALL declare `@heroui/react` as a peer dependency for the
   Kbd base component re-export.
8. THE React_Package SHALL re-export the `Kbd` component from `@heroui/react`
   for consumer convenience.

### Requirement 3: Refine Package Creation

**User Story:** As a Refine.dev developer, I want a `@kbd/refine` package with
Refine-aware keyboard shortcut integration, so that I can use shortcuts that are
context-aware within the Refine framework without pulling in unnecessary
dependencies.

#### Acceptance Criteria

1. THE Refine_Package SHALL export the Refine-aware RefineKbd component and any
   Refine-specific hooks.
2. THE Refine_Package SHALL declare Core_Package as a workspace runtime
   dependency using `"@kbd/core": "workspace:*"`.
3. THE Refine_Package SHALL declare React_Package as a workspace runtime
   dependency using `"@kbd/react": "workspace:*"`.
4. THE Refine_Package SHALL declare `@refinedev/core` as a peer dependency with
   version range `^5.0.0`.
5. THE Refine_Package SHALL declare `react` and `react-dom` as peer dependencies
   with version range `^18.0.0 || ^19.0.0`.

### Requirement 4: Micro-Package Convention Compliance

**User Story:** As a monorepo maintainer, I want the new kbd micro-packages to
follow the exact same conventions as `@cart/*` and `@nav/*`, so that the build,
test, and publish workflows remain consistent across the entire workspace.

#### Acceptance Criteria

1. WHEN a Micro_Package is created, THE Micro_Package SHALL contain the files:
   `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, and a
   `src/index.ts` entry point.
2. THE Micro_Package tsup configuration SHALL output dual ESM (`.mjs`) and CJS
   (`.js`) formats with TypeScript declarations, source maps, ES2020 target, and
   `clean: !options.watch`.
3. THE Micro_Package tsconfig SHALL use `moduleResolution: "bundler"`,
   `target: "ES2020"`, strict mode, and path alias `@/*` mapping to `./src/*`.
4. THE Micro_Package vitest configuration SHALL use `globals: true`, include
   `__tests__/**/*.test.ts` and `src/**/*.test.ts` patterns, and configure the
   `@` path alias.
5. THE Core_Package vitest configuration SHALL use `environment: "node"` since
   the core package has no DOM dependencies.
6. THE React_Package and Refine_Package vitest configurations SHALL use
   `environment: "jsdom"` for DOM-dependent tests.
7. WHEN a Micro_Package uses TypeScript version pinning, THE Micro_Package SHALL
   pin TypeScript to version `5.6.3` in devDependencies.
8. THE Micro_Package package.json SHALL use `"type": "module"`,
   `sideEffects: false`, and the same exports map pattern as `@cart/core`.

### Requirement 5: Workspace Configuration

**User Story:** As a monorepo maintainer, I want the pnpm workspace and
Turborepo configurations updated to recognize the new kbd micro-packages, so
that dependency resolution and task orchestration work correctly.

#### Acceptance Criteria

1. WHEN the new Micro_Packages are created, THE Workspace pnpm-workspace.yaml
   SHALL include the glob `packages/kbd/*` in its packages list.
2. THE Workspace Turborepo build task SHALL resolve `@kbd/react` after
   `@kbd/core` and `@kbd/refine` after both `@kbd/core` and `@kbd/react` through
   the existing `dependsOn: ["^build"]` configuration.
3. THE Micro_Package directory structure SHALL place packages at
   `packages/kbd/core/`, `packages/kbd/react/`, and `packages/kbd/refine/`.

### Requirement 6: Compatibility Wrapper

**User Story:** As an existing consumer of `@abdokouta/kbd`, I want the original
package to continue working as a re-export wrapper, so that I do not need to
update my import paths immediately after the split.

#### Acceptance Criteria

1. THE Compatibility_Wrapper SHALL re-export all public API members from
   Core_Package, React_Package, and Refine_Package.
2. WHEN an existing consumer imports from `@abdokouta/kbd`, THE
   Compatibility_Wrapper SHALL resolve the import to the corresponding export
   from the appropriate Micro_Package.
3. THE Compatibility_Wrapper SHALL declare Core_Package, React_Package, and
   Refine_Package as workspace runtime dependencies.
4. THE Compatibility_Wrapper SHALL retain its existing peer dependencies on
   `@heroui/react`, `@refinedev/core`, `react`, and `react-dom`.

### Requirement 7: Dependency Boundary Enforcement

**User Story:** As a package architect, I want strict dependency boundaries
between the three packages, so that the core package remains framework-agnostic
and each layer only depends on the layers below it.

#### Acceptance Criteria

1. THE Core_Package SHALL have zero imports from React_Package or
   Refine_Package.
2. THE React_Package SHALL have zero imports from Refine_Package.
3. THE Refine_Package SHALL import only from Core_Package and React_Package, and
   from its declared peer dependencies.
4. IF a source file in Core_Package contains a runtime import of `react`,
   `react-dom`, `@heroui/react`, or `@refinedev/core`, THEN the build of
   Core_Package SHALL fail or produce a lint error.
5. THE Core_Package SHALL use only `import type` statements for any React type
   references (e.g., `React.ComponentType<any>` in the icon field of
   KeyboardShortcut).

### Requirement 8: Built-In Shortcuts Icon Handling

**User Story:** As a developer using `@kbd/core`, I want built-in shortcuts to
reference icons without introducing a React runtime dependency in the core
package, so that the core remains truly framework-agnostic.

#### Acceptance Criteria

1. THE Core_Package SHALL type the `icon` field on KeyboardShortcut as
   `string | React.ComponentType<any>` using a type-only React import.
2. WHEN Built_In_Shortcuts define icon values, THE Core_Package SHALL store icon
   references as the lucide-react component imports (the actual runtime import
   of lucide-react remains in core since lucide-react icons are plain
   functions).
3. IF a consumer environment does not have `lucide-react` installed, THEN THE
   Core_Package SHALL declare `lucide-react` as a peer dependency or optional
   dependency so the package still installs without error.

### Requirement 9: Public API Preservation

**User Story:** As a library consumer, I want the combined public API of the
three new packages to be identical to the current `@abdokouta/kbd` public API,
so that no functionality is lost during the split.

#### Acceptance Criteria

1. THE combined exports of Core_Package, React_Package, and Refine_Package SHALL
   include every named export currently present in `packages/kbd/src/index.tsx`.
2. THE combined type exports of Core_Package, React_Package, and Refine_Package
   SHALL include every type export currently present in
   `packages/kbd/src/index.tsx`.
3. IF any export is removed or renamed during the split, THEN THE
   Compatibility_Wrapper SHALL provide a re-export alias mapping the old name to
   the new name.
