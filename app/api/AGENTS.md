# API Routes Guidelines

## Next.js 16 Conventions
- All route handlers use Web Request/Response APIs
- Export async functions named after HTTP methods (GET, POST, etc.)
- Use NextRequest type for request parameter
- Return Response.json() for JSON responses

## Azure Integration
- Azure SDK calls happen ONLY in API routes (server-side)
- Environment variables accessed via process.env
- Proper error handling with HTTP status codes

## File Handling
- Validate file types and sizes before processing
- Use FormData for file uploads
- Convert to ArrayBuffer for Azure API calls

## Security
- Never expose Azure keys to client
- Validate all inputs
- Use proper CORS headers if needed