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

## /api/analyze Route Implementation

### Request Format
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with "file" field containing PDF

### Validation
- File type: application/pdf only
- File size: Max 10MB (10,485,760 bytes)
- File not empty

### Response Formats
- Success (200): AnalysisResult JSON with fields array
- Client Error (400): Invalid file type/size/missing file
- Server Error (500): Azure API failures, configuration issues
- Service Unavailable (503): Missing Azure configuration
- Request Timeout (408): Analysis timeout (60s limit)
- Unprocessable Entity (422): Invalid analysis results

### Error Handling
- Specific error messages for common issues
- Generic fallback for unknown errors
- No sensitive information exposed to client
- Proper HTTP status codes for different error types

### Performance
- No caching (Cache-Control: no-store)
- 60-second timeout for Azure analysis
- 2-second polling intervals
- Early validation to fail fast