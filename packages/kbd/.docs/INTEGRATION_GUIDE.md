# Integration Guide for @abdokouta/kbd

This guide shows how to integrate @abdokouta/kbd into your refine application.

## Installation

```bash
npm install @abdokouta/kbd
# or
yarn add @abdokouta/kbd
# or
pnpm add @abdokouta/kbd
```

## Prerequisites

Make sure you have the following peer dependencies installed:

```bash
npm install @heroui/react @abdokouta/core react react-dom
```

## Basic Setup

### 1. Import the Component

```tsx
import { RefineKbd } from '@abdokouta/kbd';
```

### 2. Use in Your Components

```tsx
function MyComponent() {
  return (
    <div>
      <p>
        Press <RefineKbd keys={['command', 'K']} /> to open search
      </p>
    </div>
  );
}
```

## Integration with Refine

### Example: Adding Keyboard Shortcuts to a List Page

```tsx
import { useList } from '@abdokouta/core';
import { RefineKbd, useKeyboardShortcut } from '@abdokouta/kbd';

export const ProductList = () => {
  const { data, isLoading } = useList({ resource: 'products' });

  // Register keyboard shortcut for creating new product
  useKeyboardShortcut({
    keys: ['command', 'N'],
    callback: () => {
      // Navigate to create page
      window.location.href = '/products/create';
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Products</h1>
        <div className="text-sm text-gray-600">
          Press <RefineKbd keys={['command', 'N']} /> to create new product
        </div>
      </div>
      {/* Rest of your list component */}
    </div>
  );
};
```

### Example: Keyboard Shortcuts Panel

Create a reusable shortcuts panel component:

```tsx
import { RefineKbd } from '@abdokouta/kbd';
import { Modal } from '@heroui/react';

interface Shortcut {
  description: string;
  keys: string[];
}

const shortcuts: Shortcut[] = [
  { description: 'Open search', keys: ['command', 'K'] },
  { description: 'Create new', keys: ['command', 'N'] },
  { description: 'Save', keys: ['command', 'S'] },
  { description: 'Close', keys: ['escape'] },
];

export const ShortcutsPanel = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Content>
        <Modal.Header>
          <h2>Keyboard Shortcuts</h2>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{shortcut.description}</span>
                <RefineKbd keys={shortcut.keys} />
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};
```

### Example: Form with Save Shortcut

```tsx
import { useForm } from '@abdokouta/core';
import { RefineKbd, useKeyboardShortcut } from '@abdokouta/kbd';

export const ProductEdit = () => {
  const { onFinish, formLoading } = useForm();

  // Register save shortcut
  useKeyboardShortcut({
    keys: ['command', 'S'],
    callback: () => {
      if (!formLoading) {
        onFinish();
      }
    },
  });

  return (
    <form onSubmit={onFinish}>
      <div className="mb-4 text-sm text-gray-600">
        Press <RefineKbd keys={['command', 'S']} /> to save
      </div>
      {/* Form fields */}
    </form>
  );
};
```

## Integration with HeroUI Theme

The Kbd component automatically inherits your HeroUI theme settings.

```tsx
import { HeroUIProvider } from '@heroui/react';
import { RefineKbd } from '@abdokouta/kbd';

function App() {
  return (
    <HeroUIProvider>
      <RefineKbd keys={['command', 'K']} />
    </HeroUIProvider>
  );
}
```

## Styling and Customization

### Using Tailwind CSS

```tsx
<RefineKbd keys={['command', 'K']} className="text-sm font-medium" />
```

### Custom Variants

```tsx
// Default variant (solid background)
<RefineKbd keys={["command", "K"]} variant="default" />

// Light variant (transparent background)
<RefineKbd keys={["command", "K"]} variant="light" />
```

### Custom Separators

```tsx
// Plus sign
<RefineKbd keys={["ctrl", "shift", "P"]} separator=" + " />

// Arrow
<RefineKbd keys={["ctrl", "shift", "P"]} separator=" → " />

// Dot
<RefineKbd keys={["ctrl", "shift", "P"]} separator=" · " />
```

## Advanced Usage

### Context-Aware Shortcuts

```tsx
import { useKeyboardShortcut } from '@abdokouta/kbd';
import { useNavigate } from 'react-router-dom';

export const useGlobalShortcuts = () => {
  const navigate = useNavigate();

  // Search
  useKeyboardShortcut({
    keys: ['command', 'K'],
    callback: () => navigate('/search'),
  });

  // Dashboard
  useKeyboardShortcut({
    keys: ['command', 'H'],
    callback: () => navigate('/'),
  });

  // Settings
  useKeyboardShortcut({
    keys: ['command', ','],
    callback: () => navigate('/settings'),
  });
};
```

### Conditional Shortcuts

```tsx
export const EditableField = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Only active when editing
  useKeyboardShortcut({
    keys: ['escape'],
    callback: () => setIsEditing(false),
    enabled: isEditing,
  });

  // Only active when not editing
  useKeyboardShortcut({
    keys: ['enter'],
    callback: () => setIsEditing(true),
    enabled: !isEditing,
  });

  return (
    <div>
      {isEditing ? (
        <input autoFocus />
      ) : (
        <span>
          Press <RefineKbd keys={['enter']} /> to edit
        </span>
      )}
    </div>
  );
};
```

## Accessibility

The component is built with accessibility in mind:

- Proper ARIA attributes for screen readers
- Semantic HTML structure
- Keyboard navigation support
- High contrast support

## Performance Tips

1. **Memoize callbacks**: Use `useCallback` for keyboard shortcut callbacks
2. **Conditional registration**: Only register shortcuts when needed using the
   `enabled` prop
3. **Cleanup**: The hook automatically cleans up event listeners on unmount

```tsx
const handleSave = useCallback(() => {
  // Save logic
}, [dependencies]);

useKeyboardShortcut({
  keys: ['command', 'S'],
  callback: handleSave,
  enabled: isDirty, // Only active when form is dirty
});
```

## Common Patterns

### Help Modal with Shortcuts

```tsx
export const HelpModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcut({
    keys: ['command', '?'],
    callback: () => setIsOpen(true),
  });

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ShortcutsPanel />
    </Modal>
  );
};
```

### Command Palette Integration

```tsx
import { RefineKbd } from '@abdokouta/kbd';

export const CommandPalette = () => {
  return (
    <div>
      <input placeholder="Type a command..." />
      <div className="shortcuts-hint">
        <RefineKbd keys={['up']} /> <RefineKbd keys={['down']} /> to navigate
      </div>
    </div>
  );
};
```

## Troubleshooting

### Shortcuts Not Working

1. Check if the shortcut conflicts with browser/OS shortcuts
2. Verify the component is mounted when registering shortcuts
3. Ensure `enabled` prop is not set to `false`

### Styling Issues

1. Make sure HeroUI is properly configured
2. Check if custom CSS is overriding component styles
3. Verify Tailwind CSS is processing the component classes

## Migration from Other Libraries

### From react-hotkeys

```tsx
// Before (react-hotkeys)
<HotKeys keyMap={keyMap} handlers={handlers}>
  <div>Content</div>
</HotKeys>;

// After (@abdokouta/kbd)
useKeyboardShortcut({
  keys: ['command', 'K'],
  callback: handlers.SEARCH,
});
```

### From kbar

The @abdokouta/kbd package complements @abdokouta/kbar. Use them together:

```tsx
import { RefineKbarProvider, RefineKbar } from '@abdokouta/kbar';
import { RefineKbd } from '@abdokouta/kbd';

function App() {
  return (
    <RefineKbarProvider>
      <Refine>
        <RefineKbar />
        <div>
          Press <RefineKbd keys={['command', 'K']} /> to open command palette
        </div>
      </Refine>
    </RefineKbarProvider>
  );
}
```

## Resources

- [HeroUI Kbd Documentation](https://heroui.com/docs/react/components/kbd)
- [Refine Documentation](https://refine.dev/docs/)
- [GitHub Repository](https://github.com/refinedev/refine)
- [Discord Community](https://discord.gg/refine)
