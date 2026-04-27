# Azure Services Module Guidelines

## Server-Only Code
- All files in this module have `import "server-only"` at the top
- Never import from `lib/azure/` in client components
- These functions only run in API routes and server components

## Azure AI Document Intelligence Integration
- Uses `@azure-rest/ai-document-intelligence` REST client
- Requires environment variables: AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and AZURE_DOCUMENT_INTELLIGENCE_KEY
- Model: `prebuilt-layout` with `keyValuePairs` feature enabled

## Error Handling
- All Azure API errors are caught and re-thrown with descriptive messages
- Network timeouts handled with 60-second maximum
- Configuration errors detected early
- Invalid responses validated with Zod schemas

## Field Type Inference
- Checkbox detection: "selected", "checked", "☑", "✓" etc.
- Number detection: integers, decimals, currency formats
- Default: text fields for everything else
- Value conversion: strings to boolean/number as appropriate

## Coordinate Processing
- Azure returns 8-point polygons in inches
- Converted to normalized 0-1 rectangles using coordinate utilities
- Invalid polygons are skipped with warning logs
- Page dimensions extracted from first page

## Performance Considerations
- Polling with 2-second intervals for analysis completion
- Maximum 30 attempts (60 seconds total timeout)
- Base64 conversion for file transmission
- Selective field processing (skip empty/invalid fields)