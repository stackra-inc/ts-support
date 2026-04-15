# API Reference

Complete API reference for `@abdokouta/kbd`.

## Table of Contents

- [KbdModule](#kbdmodule)
- [Hooks](#hooks)
- [Components](#components)
- [Interfaces](#interfaces)
- [Constants](#constants)
- [Registry](#registry)

## KbdModule

The main module for keyboard shortcut management.

### Methods

#### `configure(config: KbdModuleOptions): void`

Configure the KBD module.

```tsx
KbdModule.configure({
  registerBuiltIn: true,
  debug: false,
  shortcuts: [...],
  groups: [...],
  defaultOptions: {...},
});
```

**Parameters:**

- `config.registerBuiltIn` (boolean): Whether to register built-in shortcuts
  (default: `true`)
- `config.debug` (boolean): Enable debug logging (default: `false`)
- `config.shortcuts` (KeyboardShortcut[]): Initial shortcuts to register
- `config.groups` (ShortcutGroup[]): Initial groups to register
- `config.defaultOptions` (ShortcutRegistrationOptions): Default registration
  options

#### `register(shortcut: KeyboardShortcut, options?: ShortcutRegistrationOptions): KeyboardShortcut`

Register a keyboard shortcut.

```tsx
const shortcut = KbdModule.register({
  id: 'search.open',
  name: 'Open Search',
  keys: ['command', 'K'],
  callback: () => openSearch(),
});
```

**Parameters:**

- `shortcut` (KeyboardShortcut): Shortcut configuration
- `options` (ShortcutRegistrationOptions): Registration options

**Returns:** The registered shortcut

#### `registerMany(shortcuts: KeyboardShortcut[], options?: ShortcutRegistrationOptions): KeyboardShortcut[]`

Register multiple shortcuts at once.

```tsx
KbdModule.registerMany([
  { id: 'save', name: 'Save', keys: ['command', 'S'], callback: save },
  { id: 'undo', name: 'Undo', keys: ['command', 'Z'], callback: undo },
]);
```

#### `unregister(id: string): boolean`

Unregister a keyboard shortcut.

```tsx
KbdModule.unregister('search.open');
```

**Returns:** `true` if shortcut was unregistered

#### `unregisterMany(ids: string[]): number`

Unregister multiple shortcuts.

```tsx
KbdModule.unregisterMany(['save', 'undo', 'redo']);
```

**Returns:** Number of shortcuts unregistered

#### `clear(): void`

Clear all shortcuts from the registry.

```tsx
KbdModule.clear();
```

#### `get(id: string): KeyboardShortcut | undefined`

Get a shortcut by ID.

```tsx
const shortcut = KbdModule.get('search.open');
```

#### `has(id: string): boolean`

Check if a shortcut exists.

```tsx
if (KbdModule.has('search.open')) {
  // Shortcut exists
}
```

#### `getAll(): KeyboardShortcut[]`

Get all registered shortcuts.

```tsx
const allShortcuts = KbdModule.getAll();
```

#### `getByCategory(category: ShortcutCategory): KeyboardShortcut[]`

Get shortcuts by category.

```tsx
const searchShortcuts = KbdModule.getByCategory('search');
```

#### `getByContext(context: ShortcutContext): KeyboardShortcut[]`

Get shortcuts by context.

```tsx
const globalShortcuts = KbdModule.getByContext('global');
```

#### `getByGroup(group: string): KeyboardShortcut[]`

Get shortcuts by group.

```tsx
const navShortcuts = KbdModule.getByGroup('Navigation');
```

#### `query(options: ShortcutQueryOptions): KeyboardShortcut[]`

Query shortcuts with filters.

```tsx
const shortcuts = KbdModule.query({
  category: 'search',
  context: 'global',
  enabled: true,
  tags: ['important'],
});
```

#### `enable(id: string): boolean`

Enable a shortcut.

```tsx
KbdModule.enable('search.open');
```

#### `disable(id: string): boolean`

Disable a shortcut.

```tsx
KbdModule.disable('search.open');
```

#### `toggle(id: string): boolean | undefined`

Toggle a shortcut's enabled state.

```tsx
const newState = KbdModule.toggle('search.open');
```

#### `registerGroup(group: ShortcutGroup): void`

Register a shortcut group.

```tsx
KbdModule.registerGroup({
  id: "navigation",
  name: "Navigation",
  description: "Navigate through the application",
  shortcuts: [...],
});
```

#### `getGroup(id: string): ShortcutGroup | undefined`

Get a group by ID.

```tsx
const group = KbdModule.getGroup('navigation');
```

#### `getAllGroups(): ShortcutGroup[]`

Get all groups.

```tsx
const groups = KbdModule.getAllGroups();
```

#### `getPlatform(): Platform`

Get the current platform.

```tsx
const platform = KbdModule.getPlatform(); // "mac" | "windows" | "linux"
```

#### `setPlatform(platform: Platform): void`

Set the platform manually.

```tsx
KbdModule.setPlatform('mac');
```

#### `resolveKeys(keys: string[] | PlatformKeys): string[]`

Resolve platform-specific keys.

```tsx
const keys = KbdModule.resolveKeys({
  mac: ['command', 'K'],
  windows: ['ctrl', 'K'],
});
```

#### `subscribe(listener: (event: ShortcutRegistryEvent) => void): () => void`

Subscribe to registry events.

```tsx
const unsubscribe = KbdModule.subscribe((event) => {
  console.log('Registry event:', event);
});

// Later...
unsubscribe();
```

## Hooks

### useShortcut

Register a single shortcut with automatic cleanup.

```tsx
function MyComponent() {
  useShortcut({
    id: 'search.open',
    callback: () => openSearch(),
    enabled: true,
    preventDefault: true,
    stopPropagation: false,
  });
}
```

**Parameters:**

- `id` (string): Shortcut ID from registry
- `callback` (function): Callback to execute (overrides registry callback)
- `enabled` (boolean): Whether shortcut is enabled (default: `true`)
- `preventDefault` (boolean): Prevent default browser behavior
- `stopPropagation` (boolean): Stop event propagation

### useShortcuts

Register multiple shortcuts at once.

```tsx
function MyComponent() {
  useShortcuts({
    shortcuts: [
      'search.open',
      { id: 'save', callback: handleSave },
      { id: 'undo', callback: handleUndo, enabled: hasHistory },
    ],
    enabled: true,
  });
}
```

**Parameters:**

- `shortcuts` (Array<string | UseShortcutOptions>): Array of shortcut IDs or
  options
- `enabled` (boolean): Global enabled state (default: `true`)

### useShortcutRegistry

Access the registry in components.

```tsx
function MyComponent() {
  const registry = useShortcutRegistry();

  const shortcuts = registry.getAll();
  const searchShortcuts = registry.getByCategory('search');

  registry.enable('search.open');
  registry.disable('search.open');
}
```

**Returns:**

- `get(id: string)`: Get shortcut by ID
- `has(id: string)`: Check if shortcut exists
- `getAll()`: Get all shortcuts
- `getByCategory(category)`: Get shortcuts by category
- `getByContext(context)`: Get shortcuts by context
- `query(options)`: Query shortcuts
- `register(shortcut)`: Register shortcut
- `unregister(id)`: Unregister shortcut
- `enable(id)`: Enable shortcut
- `disable(id)`: Disable shortcut
- `toggle(id)`: Toggle shortcut
- `subscribe(listener)`: Subscribe to changes

### useKeyboardShortcut

Low-level hook for custom shortcuts.

```tsx
function MyComponent() {
  useKeyboardShortcut({
    keys: ['command', 'K'],
    callback: () => console.log('Pressed!'),
    enabled: true,
    preventDefault: true,
  });
}
```

**Parameters:**

- `keys` (Array<KeyValue | string>): Array of keys
- `callback` (function): Callback to execute
- `enabled` (boolean): Whether shortcut is enabled (default: `true`)
- `preventDefault` (boolean): Prevent default (default: `true`)

## Components

### RefineKbd

Display keyboard shortcuts.

```tsx
<RefineKbd
  keys={['command', 'K']}
  variant="default"
  separator="+"
  className="custom-class"
/>
```

**Props:**

- `keys` (Array<KeyValue | string>): Array of keys to display
- `variant` ("default" | "light"): Visual variant (default: `"default"`)
- `separator` (ReactNode): Separator between keys (default: `"+"`)
- `className` (string): Additional CSS classes

### ShortcutList

Display a list of shortcuts with filtering.

```tsx
<ShortcutList
  category="search"
  context="global"
  tags={['important']}
  showSearch={true}
  groupByCategory={false}
  showDisabled={false}
  renderItem={(shortcut) => <div>{shortcut.name}</div>}
  className="custom-class"
  itemClassName="item-class"
/>
```

**Props:**

- `category` (ShortcutCategory): Filter by category
- `context` (ShortcutContext): Filter by context
- `tags` (string[]): Filter by tags
- `showSearch` (boolean): Show search input (default: `true`)
- `groupByCategory` (boolean): Group by category (default: `false`)
- `showDisabled` (boolean): Show disabled shortcuts (default: `false`)
- `renderItem` (function): Custom render function
- `className` (string): Container CSS classes
- `itemClassName` (string): Item CSS classes

### ShortcutHelp

Display a help modal with shortcuts.

```tsx
<ShortcutHelp
  isOpen={true}
  onClose={() => setOpen(false)}
  registerShortcut={true}
  title="Keyboard Shortcuts"
  groupByCategory={true}
  className="custom-class"
  overlayClassName="overlay-class"
/>
```

**Props:**

- `isOpen` (boolean): Whether modal is open
- `onClose` (function): Callback when modal closes
- `registerShortcut` (boolean): Register help shortcut (default: `true`)
- `title` (string): Modal title (default: `"Keyboard Shortcuts"`)
- `groupByCategory` (boolean): Group shortcuts (default: `true`)
- `className` (string): Modal CSS classes
- `overlayClassName` (string): Overlay CSS classes

## Interfaces

### KeyboardShortcut

Complete shortcut configuration.

```tsx
interface KeyboardShortcut {
  // Required
  id: string;
  name: string;
  category: ShortcutCategory;
  context: ShortcutContext;
  keys: string[] | PlatformKeys;
  callback?: (event?: KeyboardEvent) => void;

  // Optional
  description?: string;
  tags?: string[];
  alternativeKeys?: Array<string[] | PlatformKeys>;
  icon?: React.ComponentType | string;
  group?: string;
  order?: number;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  allowRepeat?: boolean;
  condition?: () => boolean;
  scope?: string;
  allowInInput?: boolean;
  metadata?: Record<string, any>;
}
```

### PlatformKeys

Platform-specific key combinations.

```tsx
interface PlatformKeys {
  mac?: string[];
  windows?: string[];
  linux?: string[];
  default: string[];
}
```

### ShortcutGroup

Group of related shortcuts.

```tsx
interface ShortcutGroup {
  id: string;
  name: string;
  description?: string;
  icon?: React.ComponentType | string;
  order?: number;
  shortcuts: KeyboardShortcut[];
}
```

### ShortcutQueryOptions

Options for querying shortcuts.

```tsx
interface ShortcutQueryOptions {
  category?: ShortcutCategory;
  context?: ShortcutContext;
  tags?: string[];
  enabled?: boolean;
  group?: string;
  search?: string;
}
```

## Constants

### SHORTCUT_CATEGORIES

```tsx
const SHORTCUT_CATEGORIES = {
  NAVIGATION: 'navigation',
  EDITING: 'editing',
  SEARCH: 'search',
  VIEW: 'view',
  FILE: 'file',
  HELP: 'help',
  CUSTOM: 'custom',
};
```

### SHORTCUT_CONTEXTS

```tsx
const SHORTCUT_CONTEXTS = {
  GLOBAL: 'global',
  EDITOR: 'editor',
  LIST: 'list',
  MODAL: 'modal',
  FORM: 'form',
  CUSTOM: 'custom',
};
```

### PLATFORMS

```tsx
const PLATFORMS = {
  MAC: 'mac',
  WINDOWS: 'windows',
  LINUX: 'linux',
  ALL: 'all',
};
```

### SHORTCUT_PRIORITIES

```tsx
const SHORTCUT_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical',
};
```

## Registry

### shortcutRegistry

Global registry instance.

```tsx
import { shortcutRegistry } from "@abdokouta/kbd";

// Use directly (not recommended, use KbdModule instead)
shortcutRegistry.register({...});
shortcutRegistry.get("id");
```

## Types

### KeyValue

Supported keyboard key values.

```tsx
type KeyValue =
  | 'command'
  | 'shift'
  | 'ctrl'
  | 'option'
  | 'alt'
  | 'win'
  | 'enter'
  | 'delete'
  | 'escape'
  | 'tab'
  | 'space'
  | 'capslock'
  | 'help'
  | 'fn'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'pageup'
  | 'pagedown'
  | 'home'
  | 'end';
```

### ShortcutCategory

```tsx
type ShortcutCategory =
  | 'navigation'
  | 'editing'
  | 'search'
  | 'view'
  | 'file'
  | 'help'
  | 'custom';
```

### ShortcutContext

```tsx
type ShortcutContext =
  | 'global'
  | 'editor'
  | 'list'
  | 'modal'
  | 'form'
  | 'custom';
```

### Platform

```tsx
type Platform = 'mac' | 'windows' | 'linux' | 'all';
```
