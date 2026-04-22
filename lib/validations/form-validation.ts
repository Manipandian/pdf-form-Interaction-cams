import { z } from "zod";
import type { PDFField } from "@/lib/types";


// Cache for single-field schemas to avoid recreation
// Cache is cleared when new PDF is uploaded to prevent stale validation rules
const fieldSchemaCache = new Map<string, z.ZodSchema>();

/**
 * Create a Zod schema for a single field based on its type
 * This is the single source of truth for field validation logic
 */
function createFieldSchema(field: PDFField): z.ZodTypeAny {
  switch (field.type) {
    case "text":
      return z
        .string()
        .min(1, `${field.label} is required`)
        .max(1000, `${field.label} must not exceed 1000 characters`);
    
    case "number":
      return z
        .union([z.string(), z.number()])
        .transform((val) => {
          if (typeof val === 'string') {
            // Handle empty strings
            if (val.trim() === '') return 0;
            
            // Remove currency symbols and commas for parsing
            const cleaned = val.replace(/[$,€£¥]/g, ''); // Extended currency support
            const parsed = parseFloat(cleaned);
            
            if (isNaN(parsed)) {
              throw new Error(`Invalid number format for ${field.label}`);
            }
            
            return parsed;
          }
          return val;
        })
        .pipe(
          z.number({
            message: `${field.label} must be a valid number`,
          })
          .min(-999999999, `${field.label} is too small`)
          .max(999999999, `${field.label} is too large`)
        );
    
    case "checkbox":
      return z.boolean({
        message: `${field.label} must be checked or unchecked`,
      });
    
    default:
      return z.string().optional();
  }
}

/**
 * Build dynamic Zod schema based on extracted PDF fields
 * This creates runtime validation that adapts to the specific fields found in each PDF
 */
export function buildFormSchema(fields: PDFField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  
  for (const field of fields) {
    shape[field.id] = createFieldSchema(field);
  }
  
  return z.object(shape);
}

/**
 * Extract default values from PDF fields for react-hook-form initialization
 * This preserves the AI-extracted values as form defaults
 */
export function extractDefaultValues(fields: PDFField[]): Record<string, string | number | boolean> {
  const defaults: Record<string, string | number | boolean> = {};
  
  for (const field of fields) {
    // Use the AI-extracted value as the default
    defaults[field.id] = field.value;
  }
  
  return defaults;
}

/**
 * Clear the schema cache when switching to a new PDF
 * This prevents validation conflicts between different documents
 */
export function clearFieldSchemaCache(): void {
  fieldSchemaCache.clear();
}

/**
 * Get or create a schema for a single field type
 * Cached for performance optimization within the same document
 */
function getSingleFieldSchema(field: PDFField): z.ZodSchema {
  // Create a more specific cache key that includes validation constraints
  // This prevents conflicts between fields with same name but different rules
  const cacheKey = `${field.type}_${field.label}_${field.id}`;
  
  if (fieldSchemaCache.has(cacheKey)) {
    return fieldSchemaCache.get(cacheKey)!;
  }
  
  // Use the same validation logic as buildFormSchema
  const schema = createFieldSchema(field);
  
  fieldSchemaCache.set(cacheKey, schema);
  return schema;
}

/**
 * Validate a single field value against its type
 * Used for real-time validation during user input
 * Performance optimized with schema caching
 */
export function validateFieldValue(
  value: string | number | boolean, 
  field: PDFField
): { isValid: boolean; error?: string } {
  try {
    const schema = getSingleFieldSchema(field);
    schema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        error: error.issues[0]?.message || `Invalid value for ${field.label}` 
      };
    }
    return { 
      isValid: false, 
      error: `Validation failed for ${field.label}: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}