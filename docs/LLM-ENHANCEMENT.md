# LLM Enhancement Implementation Guide

## Overview

This document describes the implementation of the dual-AI processing pipeline that combines Azure Document Intelligence with Google Gemini for enhanced field extraction accuracy.

## Architecture

### Processing Flow
```
PDF Upload → Azure AI Analysis → Gemini LLM Enhancement → Enhanced Field Array → UI Rendering
```

### Key Components

#### 1. Azure Document Intelligence (Primary)
- **Purpose**: Extract field coordinates and basic structure
- **Output**: `keyValuePairs` + `markdown` content
- **Features**: Precise bounding boxes, multi-page support
- **Configuration**: `outputContentFormat: "markdown"` + `features: ["keyValuePairs"]`

#### 2. Google Gemini LLM (Enhancement Layer)
- **Purpose**: Semantic understanding and field grouping
- **Model**: `gemini-2.5-flash` (fast and cost-effective)
- **Input**: Markdown content from Azure
- **Output**: Enhanced field array with proper grouping

## Implementation Details

### Core Function: `enhanceFieldsWithLLM()`

Located in `/lib/azure/document-intelligence.ts`

```typescript
async function enhanceFieldsWithLLM(
  fields: PDFField[], 
  markdown: string
): Promise<PDFField[]>
```

**Key Features:**
- Graceful fallback to Azure-only processing if Gemini API key not configured
- Comprehensive prompt engineering for bank form understanding
- Coordinate mapping between LLM results and Azure bounding boxes
- Fuzzy matching for field correlation

### Prompt Engineering

The LLM prompt is designed to work with **any banking document** (account opening, service requests, loan applications):

```typescript
const prompt = `You are an expert bank form parser that analyzes various banking documents.

Extract form fields focusing on:

**Common Banking Fields:**
- Personal Information: Names, addresses, phone numbers, email, dates of birth
- Account Details: Account numbers, CIF IDs, IBAN, routing numbers  
- Financial Information: Income, employment, requested amounts
- Service Selections: Account types, services requested, preferences
- Identification: PAN, SSN, passport numbers, driver's license

**Checkbox Grouping Rules:**
- When you see related checkboxes like "(a) Option1", "(b) Option2", "(c) Option3", group them
- Create ONE field with the parent question as label and selected option as value
- Look for patterns: numbered/lettered options, radio button groups, service selections

**Quality Standards:**
- Use confidence 0.9+ for clearly visible/complete fields
- Use confidence 0.7+ for partially visible/unclear fields
- Extract clean values without extra formatting
- Use descriptive field names that match form labels
`;
```

### Focused Field Grouping Strategy

The LLM enhancement addresses **Azure AI's specific limitation** with field grouping:

**Problem**: Azure AI extracts individual checkbox options like "(a) Self", "(b) Joint", "(c) Not Needed" as separate fields instead of understanding they're options under "ATM Card required for".

**Solution**: 
1. **Targeted Grouping**: LLM identifies related checkbox/option patterns using markdown context
2. **Preserve Regular Fields**: Keep all non-grouped fields exactly as Azure extracted them
3. **Smart Coordinate Inheritance**: Use coordinates from the selected/checked option for grouped fields
4. **Reduce Field Count**: Replace multiple option fields with one grouped field

```typescript
// Enhanced LLM prompt with both inputs
const prompt = `You have two inputs:
1. **Original fields** with coordinates from Azure AI  
2. **Markdown content** from the document

Your task: Create enhanced fields with intelligent coordinate mapping.

**Original Fields:**
${JSON.stringify(fields, null, 2)}

**Document Markdown:**
${markdown}

**Coordinate Mapping Rules:**
- For grouped checkboxes: Use coordinates from the selected option's original field
- For enhanced regular fields: Use exact coordinates from original field  
- For new fields: Use coordinates from nearest related original field
`;
```

## Configuration

### Environment Variables

```env
# Required for basic functionality
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=your-32-character-key-here

# Optional for enhanced processing
GEMINI_API_KEY=your-gemini-api-key-here
```

### Processing Modes

1. **Azure Standard** (GEMINI_API_KEY not set)
   - Uses only Azure Document Intelligence
   - Basic field extraction with individual checkboxes

2. **Azure + LLM Enhanced** (GEMINI_API_KEY configured)
   - Full dual-AI processing pipeline
   - Checkbox grouping and semantic understanding

## Benefits

### Checkbox Grouping Example

**Before (Azure Only):**
```json
[
  {"label": "(a) Self", "value": true, "type": "checkbox"},
  {"label": "(b) Joint B Account Holder", "value": false, "type": "checkbox"},
  {"label": "(c) Not Needed", "value": false, "type": "checkbox"}
]
```

**After (Azure + LLM):**
```json
[
  {"label": "ATM Card required for", "value": "Self", "type": "text"}
]
```

### Additional Improvements

- **Better Field Names**: "Mobile Number" instead of "Mobile No"
- **Type Inference**: Proper detection of numbers vs text
- **Value Cleaning**: Remove formatting artifacts
- **Confidence Scoring**: Higher accuracy assessment

## Error Handling

### Graceful Degradation
- LLM API failures fall back to Azure-only processing
- Invalid JSON responses are caught and logged
- Missing coordinate matches use default positioning

### Logging Strategy
```typescript
console.log("Gemini LLM response:", responseText);
console.log(`Enhanced ${fields.length} fields to ${enhancedFields.length} using LLM`);
console.log("LLM enhancement failed, falling back to original fields");
```

## Testing Strategy

### Development Testing
1. Set `GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE` → Azure-only mode
2. Set valid Gemini API key → Enhanced mode
3. Compare field extraction results

### Production Monitoring
- Track enhancement success rates
- Monitor LLM response times
- Log field count improvements

## Future Enhancements

### Model Upgrades
- Switch to newer Gemini models as available
- Fine-tune prompts based on production data
- Add support for additional document types

### Advanced Features
- Multi-language support
- Custom field type definitions
- Confidence-based processing decisions
- Batch processing optimization

## Cost Considerations

### Gemini API Usage
- Model: `gemini-2.5-flash` (cost-optimized)
- Input: Markdown content (typically < 2KB per document)
- Frequency: Once per document upload
- Estimated cost: $0.001-0.005 per document

### Optimization Strategies
- Cache LLM results for identical documents
- Skip LLM for documents with high Azure confidence
- Batch multiple documents in single LLM call