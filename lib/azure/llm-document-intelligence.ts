import "server-only";

import { generateFieldId } from "@/lib/utils";
import { analysisResultSchema } from "@/lib/validations";
import type { AnalysisResult, PDFField } from "@/lib/types";

/**
 * Pure LLM-based document intelligence using Google Gemini
 * This is a POC to test LLM-only approach vs Azure AI + LLM hybrid
 */
export async function analyzeLLMDocument(fileBuffer: ArrayBuffer): Promise<AnalysisResult> {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error("Gemini API key not configured for LLM document intelligence");
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use Gemini 2.5 Flash for PDF analysis (supports direct PDF processing)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    // Convert ArrayBuffer to base64 for Gemini
    const uint8Array = new Uint8Array(fileBuffer);
    const base64String = Buffer.from(uint8Array).toString('base64');

    // Create a generic prompt for any bank form analysis
    const prompt = `You are an expert document intelligence system. Analyze this scanned banking document and extract every form field with precise coordinates.

**EXTRACT ALL FORM FIELDS:**
- Text input fields (names, addresses, descriptions, IDs)
- Numeric input fields (account numbers, phone numbers, amounts)
- Checkbox selections (individual checkboxes and grouped options)

**KEY INSTRUCTION - CHECKBOX HANDLING:**
Any field that involves user selection or tick marks should use type "checkbox":

1. **Individual checkboxes**: Single yes/no options
   - type: "checkbox", value: true/false

2. **Grouped selections**: Multiple choice questions with options like (a), (b), (c) or 1, 2, 3
   - Find the parent question (the instruction text above the options)
   - Create ONE field with parent question as label
   - type: "checkbox", value: "Selected Option Name" (the chosen option)
   - Use coordinates from whichever option is selected/checked

**FIELD TYPE RULES:**
- "checkbox": ANY field involving selections, tick marks, or user choices (including grouped options)
- "number": Pure numeric values only
- "text": Names, addresses, descriptions, alphanumeric codes

**COORDINATE SYSTEM:**
Use normalized coordinates (0.0 to 1.0 scale):
- top: distance from top (0.0 = top edge, 1.0 = bottom edge)
- left: distance from left (0.0 = left edge, 1.0 = right edge) 
- width: field width as fraction of page width
- height: field height as fraction of page height

**REQUIRED JSON OUTPUT:**
{
  "fields": [
    {
      "id": "field-1",
      "label": "Field Name",
      "value": "extracted value",
      "type": "text|number|checkbox",
      "page": 1,
      "confidence": 0.95,
      "normalizedRect": {
        "top": 0.123,
        "left": 0.456,
        "width": 0.200,
        "height": 0.025
      }
    }
  ],
  "pageCount": 1,
  "pageWidth": 8.5,
  "pageHeight": 11.0
}

**CRITICAL REMINDERS:**
✅ Extract actual values written/filled in the form, not blank field labels
✅ For selections: Use type "checkbox" and set value to selected option
✅ For individual checkboxes: Use type "checkbox" and value true/false
✅ Provide precise coordinates for accurate PDF highlighting
✅ Use confidence 0.9+ for clear fields, 0.7+ for unclear fields
✅ Generate sequential IDs

ANALYZE THIS BANK FORM AND RETURN ONLY THE JSON:`;

    console.log("Sending PDF to Gemini LLM for direct analysis...");
    console.log("PDF size:", fileBuffer.byteLength, "bytes");

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64String,
          mimeType: "application/pdf"
        }
      }
    ]);

    const responseText = result.response.text();
    console.log("Gemini LLM response:", responseText);

    // Parse the JSON response
    const llmResult = JSON.parse(responseText);
    
    // Validate and transform to our expected format
    const fields: PDFField[] = [];
    
    for (const field of llmResult.fields || []) {
      // Normalize field type to match our schema (text, number, checkbox only)
      const originalType = field.type;
      const normalizedType = normalizeFieldType(originalType, field.label);
      
      // Log type conversion for debugging
      if (originalType !== normalizedType) {
        console.log(`Field "${field.label}": type "${originalType}" → "${normalizedType}"`);
      }
      
      const enhancedField: PDFField = {
        id: field.id || generateFieldId(),
        label: field.label || "Unknown Field",
        value: convertValueByType(field.value, normalizedType),
        type: normalizedType,
        page: field.page || 1,
        confidence: field.confidence || 0.8,
        normalizedRect: field.normalizedRect || {
          top: 0.5, left: 0.1, width: 0.3, height: 0.03
        }
      };
      
      fields.push(enhancedField);
    }

    // Create the result object
    const analysisResult: AnalysisResult = {
      fields,
      pageCount: llmResult.pageCount || 1,
      pageWidth: llmResult.pageWidth || 8.5,
      pageHeight: llmResult.pageHeight || 11.0,
    };

    console.log(`✅ LLM-only analysis completed: ${fields.length} fields extracted`);
    
    // Validate the result with Zod
    const validatedResult = analysisResultSchema.parse(analysisResult);
    
    return validatedResult;

  } catch (error) {
    console.error("LLM document intelligence analysis failed:", error);
    
    if (error instanceof Error) {
      throw new Error(`LLM document analysis failed: ${error.message}`);
    }
    
    throw new Error("LLM document analysis failed with unknown error");
  }
}

/**
 * Normalize LLM field types to our expected schema types
 * Also detect selection-related fields that should be checkboxes
 */
function normalizeFieldType(llmType: string, fieldLabel?: string): "text" | "number" | "checkbox" {
  if (!llmType) return "text";
  
  const normalizedType = llmType.toLowerCase().trim();
  const normalizedLabel = (fieldLabel || "").toLowerCase();
  
  // Map various LLM type names to our schema
  switch (normalizedType) {
    case "number":
    case "numeric":
    case "integer":
    case "float":
      return "number";
      
    case "checkbox":
    case "boolean":
    case "bool":
    case "check":
    case "selection":
    case "option":
      return "checkbox";
      
    case "text":
    case "string":
    case "email":
    case "phone":
    case "date":
    case "name":
    default:
      // Detect fields that should be checkboxes based on label content
      if (normalizedLabel.includes("required for") || 
          normalizedLabel.includes("select") ||
          normalizedLabel.includes("choose") ||
          normalizedLabel.includes("tick") ||
          normalizedLabel.includes("request:") ||
          normalizedLabel.includes("option") ||
          normalizedLabel.includes("type of")) {
        return "checkbox";
      }
      return "text";
  }
}

/**
 * Convert value to appropriate type
 */
function convertValueByType(value: any, type: string): string | number | boolean {
  switch (type) {
    case "number":
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    case "checkbox":
      return Boolean(value);
    default:
      return String(value || "");
  }
}