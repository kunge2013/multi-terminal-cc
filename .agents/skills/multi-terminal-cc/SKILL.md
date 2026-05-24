```markdown
# multi-terminal-cc Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `multi-terminal-cc` repository, a TypeScript React project. You'll learn the project's file organization, code style, commit message conventions, and how to write and run tests. This guide also provides suggested commands for common workflows.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `multiTerminalView.tsx`, `userSessionManager.ts`

### Import Style
- Use **relative imports** for modules within the project.
  - Example:
    ```typescript
    import { Terminal } from './terminal';
    import { useSession } from '../hooks/useSession';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // terminal.ts
    export function createTerminal() { ... }
    export const TERMINAL_TYPE = 'multi';
    ```

### Commit Messages
- Follow the **Conventional Commits** standard.
- Use the `feat` prefix for new features.
- Keep commit messages concise (average 39 characters).
  - Example:  
    ```
    feat: add multi-terminal session support
    ```

## Workflows

### Creating a New Feature
**Trigger:** When adding a new feature to the codebase  
**Command:** `/new-feature`

1. Create a new branch for your feature.
2. Implement your feature using TypeScript and React, following the coding conventions.
3. Use camelCase for new file names.
4. Use relative imports and named exports.
5. Write or update relevant tests (`*.test.*` files).
6. Commit your changes using the `feat` prefix and a concise message.
7. Push your branch and open a pull request.

### Writing and Running Tests
**Trigger:** When adding or updating tests  
**Command:** `/test`

1. Create or update test files using the pattern `*.test.*` (e.g., `terminal.test.ts`).
2. Write tests for your components or utilities.
3. Run the test suite using your project's test runner (framework unknown; check project scripts).
4. Ensure all tests pass before committing.

## Testing Patterns

- Test files follow the `*.test.*` naming convention.
  - Example: `multiTerminalView.test.tsx`
- The specific testing framework is not specified; check the project for details.
- Place tests alongside the files they test or in a dedicated test directory.

## Commands
| Command        | Purpose                                    |
|----------------|--------------------------------------------|
| /new-feature   | Start a new feature workflow               |
| /test          | Run or add tests to the codebase           |
```
