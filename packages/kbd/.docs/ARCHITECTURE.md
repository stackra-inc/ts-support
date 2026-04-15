# @abdokouta/kbd Architecture

## Package Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    @abdokouta/kbd                           │
│                     (Main Package)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ exports
                            ▼
        ┌───────────────────────────────────────┐
        │         Public API Surface            │
        ├───────────────────────────────────────┤
        │  • RefineKbd (Component)              │
        │  • Kbd (Re-exported from HeroUI)      │
        │  • useKeyboardShortcut (Hook)         │
        │  • Types (KeyValue, Props, etc.)      │
        │  • Utils (keyMappings, helpers)       │
        └───────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  Components  │ │    Hooks     │ │    Utils     │
    └──────────────┘ └──────────────┘ └──────────────┘
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  RefineKbd   │ │useKeyboard   │ │ keyMappings  │
    │              │ │  Shortcut    │ │              │
    │  - Display   │ │              │ │  - Symbols   │
    │  - Variants  │ │  - Register  │ │  - Titles    │
    │  - Keys      │ │  - Detect    │ │  - Guards    │
    └──────────────┘ └──────────────┘ └──────────────┘
            │               │               │
            └───────────────┼───────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   HeroUI     │
                    │   Kbd Base   │
                    └──────────────┘
```

## Component Hierarchy

```
RefineKbd (Wrapper Component)
    │
    ├─> Processes keys array
    ├─> Maps keys to symbols
    ├─> Applies variant
    └─> Renders multiple Kbd components
            │
            └─> Kbd (HeroUI Base)
                    │
                    ├─> Kbd.Abbr (Modifier keys)
                    │       └─> Symbol + Title
                    │
                    └─> Kbd.Content (Regular keys)
                            └─> Text content
```

## Data Flow

### Display Flow

```
User Props
    │
    ├─> keys: ["command", "K"]
    ├─> variant: "default"
    └─> separator: "+"
            │
            ▼
    RefineKbd Component
            │
            ├─> For each key:
            │       │
            │       ├─> getKeyMapping(key)
            │       │       │
            │       │       └─> Returns { symbol, title }
            │       │
            │       └─> isKeyValue(key)
            │               │
            │               ├─> true  → Render Kbd.Abbr
            │               └─> false → Render Kbd.Content
            │
            └─> Render with separators
                    │
                    ▼
            Final Output: ⌘ + K
```

### Hook Flow

```
useKeyboardShortcut({
    keys: ["command", "K"],
    callback: handleSearch
})
    │
    ├─> Register keydown listener
    │       │
    │       └─> On keydown event:
    │               │
    │               ├─> Check modifier keys
    │               │   (metaKey, ctrlKey, etc.)
    │               │
    │               ├─> Check regular keys
    │               │   (event.key)
    │               │
    │               └─> All match?
    │                       │
    │                       ├─> Yes → Execute callback
    │                       └─> No  → Ignore
    │
    └─> Cleanup on unmount
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                    External Dependencies                 │
├─────────────────────────────────────────────────────────┤
│  @heroui/react (Kbd component)                          │
│  react (Core library)                                    │
│  react-dom (DOM rendering)                               │
│  @abdokouta/core (Refine integration)                   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    @abdokouta/kbd                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │ Components │  │   Hooks    │  │   Utils    │       │
│  └────────────┘  └────────────┘  └────────────┘       │
│         │               │               │               │
│         └───────────────┼───────────────┘               │
│                         │                               │
│                    ┌────────┐                           │
│                    │ Types  │                           │
│                    └────────┘                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Consumer Application                    │
├─────────────────────────────────────────────────────────┤
│  import { RefineKbd, useKeyboardShortcut } from         │
│          "@abdokouta/kbd"                               │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
packages/kbd/
│
├── src/                          # Source code
│   │
│   ├── components/               # React components
│   │   ├── RefineKbd/
│   │   │   └── index.tsx        # Main component
│   │   └── index.ts             # Barrel export
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useKeyboardShortcut.ts
│   │   └── index.ts
│   │
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── keyMappings.ts
│   │   └── index.ts
│   │
│   └── index.tsx                 # Main entry point
│
├── test/                         # Test files
│   ├── RefineKbd.test.tsx
│   ├── useKeyboardShortcut.test.tsx
│   ├── keyMappings.test.ts
│   └── setup.ts
│
├── examples/                     # Usage examples
│   └── basic-usage.tsx
│
├── dist/                         # Build output (generated)
│   ├── index.cjs                # CommonJS bundle
│   ├── index.mjs                # ESM bundle
│   ├── index.d.ts               # Type declarations
│   ├── index.d.mts              # ESM types
│   └── index.d.cts              # CJS types
│
└── [config files]               # Configuration
```

## Type System

```
┌─────────────────────────────────────────────────────────┐
│                      Type Hierarchy                      │
└─────────────────────────────────────────────────────────┘

KeyValue (Union Type)
    ├─> "command" | "shift" | "ctrl" | ...
    └─> Used for: Type-safe key values

KbdVariant (Union Type)
    └─> "default" | "light"

RefineKbdProps (Interface)
    ├─> keys: (KeyValue | string)[]
    ├─> variant?: KbdVariant
    ├─> separator?: React.ReactNode
    └─> className?: string

UseKeyboardShortcutOptions (Interface)
    ├─> keys: (KeyValue | string)[]
    ├─> callback: () => void
    ├─> enabled?: boolean
    └─> preventDefault?: boolean
```

## Build Process

```
Source Code (TypeScript)
    │
    ├─> tsup (Build tool)
    │       │
    │       ├─> Transpile TypeScript
    │       ├─> Bundle code
    │       ├─> Generate source maps
    │       └─> Add "use client" directive
    │
    ├─> Output Formats:
    │       ├─> CommonJS (.cjs)
    │       └─> ESM (.mjs)
    │
    └─> TypeScript Compiler
            │
            └─> Generate type declarations
                    ├─> .d.ts (base)
                    ├─> .d.mts (ESM)
                    └─> .d.cts (CJS)
```

## Testing Architecture

```
Test Suite
    │
    ├─> Component Tests
    │       ├─> RefineKbd rendering
    │       ├─> Props handling
    │       ├─> Variants
    │       └─> Edge cases
    │
    ├─> Hook Tests
    │       ├─> Shortcut registration
    │       ├─> Event handling
    │       ├─> Cleanup
    │       └─> Conditional enabling
    │
    └─> Utility Tests
            ├─> Key mappings
            ├─> Type guards
            └─> Helper functions
```

## Integration Points

```
┌─────────────────────────────────────────────────────────┐
│                    Refine Ecosystem                      │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ @abdokouta/  │    │ @abdokouta/  │    │ @abdokouta/  │
│    core      │    │   heroui     │    │    kbar      │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ @abdokouta/  │
                    │     kbd      │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   HeroUI     │
                    │   Theme      │
                    └──────────────┘
```

## Runtime Behavior

### Component Lifecycle

```
Mount
    │
    ├─> Receive props
    ├─> Process keys array
    ├─> Map to symbols
    └─> Render Kbd components
            │
            ▼
    User Interaction
            │
            └─> Visual feedback (HeroUI)

Unmount
    │
    └─> Cleanup (automatic)
```

### Hook Lifecycle

```
Mount
    │
    ├─> Register event listener
    └─> Store callback reference
            │
            ▼
    Keyboard Event
            │
            ├─> Check if enabled
            ├─> Match key combination
            └─> Execute callback
                    │
                    └─> Prevent default (optional)

Unmount
    │
    └─> Remove event listener
```

## Performance Considerations

```
Optimization Strategies
    │
    ├─> Memoization
    │       └─> useCallback for event handlers
    │
    ├─> Conditional Rendering
    │       └─> Early return for empty keys
    │
    ├─> Event Delegation
    │       └─> Single window listener per hook
    │
    └─> Tree Shaking
            └─> ESM exports for optimal bundling
```

## Security Considerations

```
Security Measures
    │
    ├─> Input Validation
    │       └─> Type checking for key values
    │
    ├─> Event Handling
    │       └─> Proper cleanup to prevent leaks
    │
    └─> XSS Prevention
            └─> React's built-in escaping
```

---

This architecture ensures:

- ✅ Clean separation of concerns
- ✅ Type safety throughout
- ✅ Easy testing and maintenance
- ✅ Optimal performance
- ✅ Seamless integration with Refine
