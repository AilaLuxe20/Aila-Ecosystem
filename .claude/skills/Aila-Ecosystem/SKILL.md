---
name: aila-ecosystem-conventions
description: Development conventions and patterns for Aila-Ecosystem. TypeScript Next.js project with mixed commits.
---

# Aila Ecosystem Conventions

> Generated from [AilaLuxe20/Aila-Ecosystem](https://github.com/AilaLuxe20/Aila-Ecosystem) on 2026-08-30

## Overview

This skill teaches Claude the development patterns and conventions used in Aila-Ecosystem.

## Tech Stack

- **Primary Language**: TypeScript
- **Framework**: Next.js
- **Architecture**: type-based module organization
- **Test Location**: colocated

## When to Use This Skill

Activate this skill when:
- Making changes to this repository
- Adding new features following established patterns
- Writing tests that match project conventions
- Creating commits with proper message format

## Commit Conventions

Follow these commit message conventions based on 53 analyzed commits.

### Commit Style: Mixed Style

### Prefixes Used

- `feat`
- `chore`
- `fix`
- `refactor`
- `test`
- `docs`

### Message Guidelines

- Average message length: ~56 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
fix(auth): add Clerk JWT type augmentation
```

*Commit message example*

```text
refactor(auth): migrate middleware to Next.js proxy
```

*Commit message example*

```text
feat(ai): local chat input foundation
```

*Commit message example*

```text
test: add end-to-end production verification
```

*Commit message example*

```text
chore: remove duplicate middleware.ts, keep proxy.ts
```

*Commit message example*

```text
Add analytics speed insights and launch SEO
```

*Commit message example*

```text
Continue Aila Ecosystem migration: consolidate AI modules, create product pages
```

*Commit message example*

```text
fix(css): resolve Tailwind v4 utility nesting and restore successful production build
```

## Architecture

### Project Structure: Single Package

This project uses **type-based** module organization.

### Source Layout

```
src/
├── app/
├── components/
├── core/
├── generated/
├── lib/
├── server/
├── types/
├── hooks/
├── providers/
├── styles/
```

### Configuration Files

- `.github/workflows/ci.yml`
- `next.config.ts`
- `package.json`
- `src/generated/prisma/package.json`
- `vercel.json`
- `.agents/skills/clerk-nextjs-patterns/templates/nextjs-basic-auth/package.json`
- `.agents/skills/clerk-nextjs-patterns/templates/nextjs-basic-auth/tsconfig.json`
- `clerk-nextjs/next.config.ts`
- `clerk-nextjs/package.json`
- `clerk-nextjs/tsconfig.json`
- `my-app/aila/next.config.ts`
- `my-app/aila/package.json`
- `my-app/aila/tsconfig.json`
- `my-app/next.config.ts`
- `my-app/package.json`
- `my-app/tsconfig.json`

### Guidelines

- Group code by type (components, services, utils)
- Keep related functionality in the same type folder
- Avoid circular dependencies between type folders

## Code Style

### Language: TypeScript

### Naming Conventions

| Element | Convention |
|---------|------------|
| Files | camelCase |
| Functions | camelCase |
| Classes | PascalCase |
| Constants | SCREAMING_SNAKE_CASE |

### Import Style: Path Aliases (@/, ~/)

### Export Style: Default Exports


*Preferred import style*

```typescript
// Use path aliases for imports
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
```

*Preferred export style*

```typescript
// Use default exports for main component/function
export default function UserProfile() { ... }
```

## Testing

### Test Framework

No specific test framework detected — use the repository's existing test patterns.

### File Pattern: `*.test.ts`

### Test Types

- **Unit tests**: Test individual functions and components in isolation


## Common Workflows

These workflows were detected from analyzing commit patterns.

### Database Migration

Database schema changes with migration files

**Frequency**: ~4 times per month

**Steps**:
1. Create migration file
2. Update schema definitions
3. Generate/update types

**Files typically involved**:
- `**/schema.*`
- `**/types.ts`
- `migrations/*`

**Example commit sequence**:
```
Continue Aila Ecosystem migration: consolidate AI modules, create product pages
fix(auth): add Clerk JWT type augmentation
refactor(auth): migrate middleware to Next.js proxy
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~13 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `src/app/*`
- `src/app/(shell)/products/ads/*`
- `src/app/(shell)/products/apps/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
Add analytics speed insights and launch SEO
Continue Aila Ecosystem migration: consolidate AI modules, create product pages
fix(auth): add Clerk JWT type augmentation
```

### Test Driven Development

Test-first development workflow (TDD)

**Frequency**: ~3 times per month

**Steps**:
1. Write failing test
2. Implement code to pass test
3. Refactor if needed

**Files typically involved**:
- `**/*.test.*`
- `**/*.spec.*`
- `src/**/*`

**Example commit sequence**:
```
test: add tests for user validation
feat: implement user validation
```

### Refactoring

Code refactoring and cleanup workflow

**Frequency**: ~2 times per month

**Steps**:
1. Ensure tests pass before refactor
2. Refactor code structure
3. Verify tests still pass

**Files typically involved**:
- `src/**/*`

**Example commit sequence**:
```
Continue Aila Ecosystem migration: consolidate AI modules, create product pages
fix(auth): add Clerk JWT type augmentation
refactor(auth): migrate middleware to Next.js proxy
```


## Best Practices

Based on analysis of the codebase, follow these practices:

### Do

- Follow *.test.ts naming pattern
- Use camelCase for file names
- Prefer default exports

### Don't

- Don't use long relative imports (use aliases)
- Don't skip tests for new features
- Don't deviate from established patterns without discussion

---

*This skill was auto-generated by [ECC Tools](https://ecc.tools). Review and customize as needed for your team.*
