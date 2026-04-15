# Quick Start Guide - @abdokouta/kbd

Get up and running with @abdokouta/kbd in 5 minutes!

## Installation

```bash
npm install @abdokouta/kbd
```

## Step 1: Import the Component

```tsx
import { RefineKbd } from '@abdokouta/kbd';
```

## Step 2: Display a Keyboard Shortcut

```tsx
function MyComponent() {
  return (
    <p>
      Press <RefineKbd keys={['command', 'K']} /> to search
    </p>
  );
}
```

That's it! You now have a beautiful keyboard shortcut display.

## Common Use Cases

### 1. Multiple Keys

```tsx
<RefineKbd keys={['ctrl', 'shift', 'P']} />
```

### 2. Navigation Keys

```tsx
<RefineKbd keys={["up"]} />
<RefineKbd keys={["down"]} />
```

### 3. Light Variant

```tsx
<RefineKbd keys={['command', 'S']} variant="light" />
```

### 4. Custom Separator

```tsx
<RefineKbd keys={['command', 'K']} separator=" + " />
```

## Bonus: Register Keyboard Shortcuts

```tsx
import { useKeyboardShortcut } from '@abdokouta/kbd';

function MyComponent() {
  useKeyboardShortcut({
    keys: ['command', 'K'],
    callback: () => {
      console.log('Shortcut triggered!');
    },
  });

  return <div>Press Command+K</div>;
}
```

## Next Steps

- Read the [full documentation](./README.md)
- Check out [API reference](./API.md)
- See [integration guide](./INTEGRATION_GUIDE.md)
- View [examples](./examples/basic-usage.tsx)

## Need Help?

- [GitHub Issues](https://github.com/refinedev/refine/issues)
- [Discord Community](https://discord.gg/refine)
- [Documentation](https://refine.dev/docs)

Happy coding! 🚀
