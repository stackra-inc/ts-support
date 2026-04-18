---
name: clean-architecture-standards
description:
  'Enforces strict clean architecture, file naming, and code organization
  standards across all programming languages. Use for creating new projects,
  refactoring code, or generating files to ensure one-export-per-file, proper
  folder structures, and comprehensive documentation.'
---

# Clean Architecture & Coding Standards

This skill defines the strict coding standards, file naming conventions, and
architectural patterns that MUST be followed when writing or refactoring code in
any language.

## Core Universal Principles

Regardless of the programming language, the following rules are absolute and
MUST be followed:

1. **One Entity Per File (Strict)**
   - NEVER place multiple exports, classes, interfaces, enums, or types in a
     single file.
   - Each distinct entity MUST have its own dedicated file.
   - Example: If you have `User` and `Admin` interfaces, they must be in
     `user.interface.ts` and `admin.interface.ts`, NOT combined in
     `interfaces.ts`.

2. **Comprehensive Documentation**
   - EVERY file, class, interface, enum, method (public and private), property,
     and complex logic block MUST have detailed docblocks/comments.
   - Keep descriptions, parameters, and return values concise but highly
     informative.

3. **Dedicated Folders by Type & Domain**
   - Group files by their type into dedicated folders (e.g., `interfaces/`,
     `enums/`, `exceptions/`, `types/`, `constants/`).
   - For larger projects, categorize these folders further by package domain or
     feature module.

4. **Component Isolation**
   - Every UI component or major feature module MUST reside in its own folder
     bearing its name.
   - The folder MUST contain the main implementation file and an `index` (or
     equivalent barrel file) to export it cleanly.

## Language-Specific Guidelines

For specific file naming conventions and structural patterns, refer to the
language-specific reference guides:

- **TypeScript / JavaScript (React, Node.js, etc.)**: Read
  `references/typescript.md`
- **Dart / Flutter**: Read `references/dart_flutter.md`
- **PHP (Laravel, Symfony, etc.)**: Read `references/php.md`
- **Go (Golang)**: Read `references/go.md`
- **Python**: Read `references/python.md`

## Workflow for AI Agents

When tasked with creating or modifying code:

1. **Analyze**: Determine the language and read the corresponding reference
   file.
2. **Plan**: Break down the requested entities into separate files. Do not group
   them.
3. **Structure**: Create the necessary folder hierarchy (`interfaces/`,
   `enums/`, `components/ComponentName/`).
4. **Implement**: Write the code with comprehensive docblocks for every entity
   and method.
5. **Export**: Create barrel files (`index.ts`, `barrel.dart`, etc.) to cleanly
   export the isolated files.
