# Contributing to @abdokouta/kbd

Thank you for your interest in contributing to @abdokouta/kbd! This document
provides guidelines and instructions for contributing.

## Development Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the package:

   ```bash
   pnpm build
   ```

4. Run tests:

   ```bash
   pnpm test
   ```

5. Run tests in watch mode:
   ```bash
   pnpm test:watch
   ```

## Project Structure

```
packages/kbd/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── index.tsx       # Main entry point
├── test/               # Test files
├── dist/               # Build output (generated)
└── package.json
```

## Code Style

- We use TypeScript for type safety
- Follow the existing code style and conventions
- Add JSDoc comments for all public APIs
- Include examples in documentation comments

## Testing

- Write tests for all new features
- Ensure all tests pass before submitting a PR
- Aim for high test coverage

## Documentation

- Update README.md if adding new features
- Add JSDoc comments with examples
- Update CHANGELOG.md following semantic versioning

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit a pull request

## Questions?

Feel free to open an issue or reach out to the refine team on
[Discord](https://discord.gg/refine).
