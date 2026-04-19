# API Documentation

This document provides comprehensive documentation for all API endpoints and integration patterns.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-app.vercel.app`

## Authentication

No authentication required for the current implementation. Azure AI services are accessed server-side with API keys stored in environment variables.

## Endpoints

### POST /api/analyze

Analyzes a PDF document for form fields using Azure AI Document Intelligence.

#### Request

**Content-Type**: `multipart/form-data`

**Parameters**:
- `file` (required): PDF file to analyze
  - Format: PDF only
  - Max size: 10MB
  - Content validation: Must be valid PDF

**Example Request**:
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('/api/analyze', {
  method: 'POST',
  body: formData
});
```

#### Response

**Success Response** (200):
```typescript
{
  fields: PDFField[];
  totalPages: number;
  confidence: number;
}

interface PDFField {
  id: string;                    // Unique field identifier
  label: string;                 // Field name/label
  value: string;                 // Extracted value
  type: FieldType;               // Inferred field type
  confidence: number;            // AI confidence (0-1)
  page: number;                  // Page number (1-based)
  normalizedRect: NormalizedRect; // Position coordinates
}

interface NormalizedRect {
  left: number;    // 0.0 to 1.0
  top: number;     // 0.0 to 1.0
  width: number;   // 0.0 to 1.0
  height: number;  // 0.0 to 1.0
}

type FieldType = 'text' | 'number' | 'email' | 'date' | 'checkbox';
```

**Example Success Response**:
```json
{
  "fields": [
    {
      "id": "field_001",
      "label": "Full Name",
      "value": "John Doe",
      "type": "text",
      "confidence": 0.95,
      "page": 1,
      "normalizedRect": {
        "left": 0.1,
        "top": 0.2,
        "width": 0.3,
        "height": 0.05
      }
    },
    {
      "id": "field_002", 
      "label": "Email Address",
      "value": "john.doe@example.com",
      "type": "email",
      "confidence": 0.98,
      "page": 1,
      "normalizedRect": {
        "left": 0.1,
        "top": 0.3,
        "width": 0.4,
        "height": 0.05
      }
    }
  ],
  "totalPages": 3,
  "confidence": 0.89
}
```

#### Error Responses

**400 Bad Request**:
```json
{
  "error": "Invalid file type. Only PDF files are supported.",
  "code": "INVALID_FILE_TYPE"
}
```

**413 Payload Too Large**:
```json
{
  "error": "File size exceeds 10MB limit.",
  "code": "FILE_TOO_LARGE"
}
```

**408 Request Timeout**:
```json
{
  "error": "Document analysis timed out. Please try again.",
  "code": "ANALYSIS_TIMEOUT"
}
```

**422 Unprocessable Entity**:
```json
{
  "error": "Unable to process PDF. File may be corrupted or password-protected.",
  "code": "INVALID_PDF_CONTENT"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error occurred during analysis.",
  "code": "INTERNAL_ERROR"
}
```

**503 Service Unavailable**:
```json
{
  "error": "Azure AI Document Intelligence service is currently unavailable.",
  "code": "SERVICE_UNAVAILABLE"
}
```

#### Error Codes Reference

| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_FILE_TYPE` | File is not a PDF | Upload a PDF file |
| `FILE_TOO_LARGE` | File exceeds 10MB limit | Compress or split the PDF |
| `EMPTY_FILE` | File has no content | Upload a valid PDF file |
| `ANALYSIS_TIMEOUT` | Processing took too long | Retry with a simpler document |
| `INVALID_PDF_CONTENT` | PDF cannot be processed | Check if PDF is corrupted or encrypted |
| `SERVICE_UNAVAILABLE` | Azure service is down | Wait and retry later |
| `INTERNAL_ERROR` | Server-side error | Contact support if persistent |

## Rate Limits

Currently no rate limiting is implemented. For production deployment, consider:

- **Per IP**: 100 requests per minute
- **File Size**: 10MB maximum per request
- **Concurrent**: 5 simultaneous analyses per IP

## Client Integration Examples

### React Hook

```typescript
import { useState } from 'react';

interface UseAnalysisResult {
  analyze: (file: File) => Promise<void>;
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
}

export function useDocumentAnalysis(): UseAnalysisResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      const analysisResult = await response.json();
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { analyze, loading, error, result };
}
```

### Progress Tracking

```typescript
async function analyzeWithProgress(
  file: File, 
  onProgress: (progress: number) => void
): Promise<AnalysisResult> {
  
  const formData = new FormData();
  formData.append('file', file);

  // Simulate progress during upload
  onProgress(10);
  
  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
  });

  onProgress(50); // Upload complete
  
  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }

  onProgress(90); // Processing complete
  
  const result = await response.json();
  onProgress(100); // Done
  
  return result;
}
```

### Error Handling

```typescript
async function robustAnalysis(file: File): Promise<AnalysisResult> {
  const maxRetries = 3;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 408) {
        // Timeout - retry
        console.log(`Attempt ${attempt}: Analysis timeout, retrying...`);
        continue;
      }

      if (response.status === 503) {
        // Service unavailable - wait and retry
        console.log(`Attempt ${attempt}: Service unavailable, waiting...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      return await response.json();
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw lastError!;
}
```

## Field Type Detection Logic

The API automatically infers field types from extracted content:

```typescript
function inferFieldType(value: string, label: string): FieldType {
  const cleanValue = value.trim().toLowerCase();
  const cleanLabel = label.toLowerCase();

  // Email detection
  if (cleanLabel.includes('email') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'email';
  }

  // Number detection  
  if (cleanLabel.includes('amount') || cleanLabel.includes('number') || 
      /^\d+(\.\d+)?$/.test(cleanValue)) {
    return 'number';
  }

  // Date detection
  if (cleanLabel.includes('date') || /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(cleanValue)) {
    return 'date';
  }

  // Checkbox detection
  if (/^(✓|✗|true|false|yes|no|check|uncheck)$/i.test(cleanValue)) {
    return 'checkbox';
  }

  // Default to text
  return 'text';
}
```

## Confidence Scoring

Confidence scores from Azure AI are interpreted as follows:

- **0.9 - 1.0**: High confidence (green badge) - Ready to use
- **0.75 - 0.89**: Medium confidence (yellow badge) - Review recommended  
- **0.0 - 0.74**: Low confidence (red badge) - Manual verification required

## Testing the API

### Using curl

```bash
# Test with a PDF file
curl -X POST http://localhost:3000/api/analyze \
  -F "file=@/path/to/your/form.pdf" \
  -H "Accept: application/json"
```

### Using Postman

1. Set method to POST
2. URL: `http://localhost:3000/api/analyze`
3. Body → form-data
4. Key: `file`, Type: File, Value: Select PDF file
5. Send request

## WebSocket Support (Future Enhancement)

For real-time analysis updates:

```typescript
// Proposed WebSocket endpoint for live progress
const ws = new WebSocket('ws://localhost:3000/api/analyze/stream');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  switch (update.type) {
    case 'progress':
      console.log(`Analysis progress: ${update.progress}%`);
      break;
    case 'field_detected':
      console.log(`Field detected: ${update.field.label}`);
      break;
    case 'complete':
      console.log('Analysis complete:', update.result);
      break;
    case 'error':
      console.error('Analysis error:', update.error);
      break;
  }
};
```

## Performance Considerations

### Request Optimization

- **File Compression**: Compress PDFs before upload when possible
- **Batch Processing**: For multiple files, consider sequential processing to avoid overwhelming the service
- **Caching**: Cache results client-side to avoid re-analysis

### Response Optimization

- **Pagination**: For documents with many fields, consider paginated responses
- **Selective Fields**: Allow clients to request specific field types only
- **Compression**: Enable gzip compression for large responses

## Security Considerations

### Input Validation

- File type validation (PDF only)
- File size limits (10MB maximum)
- Content validation (valid PDF structure)
- Filename sanitization

### Data Privacy

- Files are processed in memory only (not stored)
- No persistent storage of uploaded documents
- Azure AI service processes data according to Azure privacy policies
- Consider implementing request logging for debugging (without file content)

## Troubleshooting

### Common Issues

1. **"Invalid file type" error**: Ensure file has `.pdf` extension and valid PDF MIME type
2. **"File too large" error**: Compress PDF or split into smaller files  
3. **Analysis timeout**: Try with a simpler document or retry later
4. **No fields detected**: Ensure PDF contains actual form fields, not just images
5. **Service unavailable**: Check Azure service status and API key configuration

### Debug Mode

Set `NODE_ENV=development` for additional error details:

```typescript
// In development, detailed errors are returned
{
  "error": "Analysis failed",
  "details": {
    "azureError": "InvalidRequest", 
    "message": "Document format not supported",
    "requestId": "12345-67890"
  }
}
```