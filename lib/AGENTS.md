# Lib Module Guidelines

## Server vs Client Code
- `lib/document-intelligence/` contains server-only code - add `import "server-only"` at top of files
- Never import from `lib/document-intelligence/` in client components
- `lib/store/` and `lib/types/` are shared between server and client
- `lib/utils/` contains utility functions for both environments

## State Management
- Zustand store files should document selector usage patterns
- Always use selective subscriptions to prevent re-renders

## Validation
- All Zod schemas live in `lib/validations/`
- Validate external API responses (especially Azure AI) before using

## TypeScript
- All interfaces and types are defined in `lib/types/`
- Use strict type checking for coordinate transformations
- Export types from index files for clean imports