import { z } from "zod";
import type { PDFField } from "@/lib/types";

/**
 * Build dynamic Zod schema based on extracted PDF fields
 * This creates runtime validation that adapts to the specific fields found in each PDF
 */
export function buildFormSchema(fields: PDFField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  
  for (const field of fields) {
    switch (field.type) {
      case "text": {
        // Text fields are required and must have at least 1 character
        shape[field.id] = z
          .string()
          .min(1, `${field.label} is required`)
          .max(1000, `${field.label} must not exceed 1000 characters`);
        break;
      }
      case "number": {
        // Number fields with proper validation and conversion
        shape[field.id] = z
          .union([z.string(), z.number()])
          .transform((val) => {
            if (typeof val === 'string') {
              // Handle empty strings
              if (val.trim() === '') return 0;
              
              // Remove currency symbols and commas for parsing
              const cleaned = val.replace(/[$,]/g, '');
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
        break;
      }
      case "checkbox": {
        // Boolean fields for checkboxes
        shape[field.id] = z.boolean({
          message: `${field.label} must be checked or unchecked`,
        });
        break;
      }
      default: {
        // Fallback for unknown field types
        shape[field.id] = z.string().optional();
        break;
      }
    }
  }
  
  return z.object(shape);
}

/**
 * Extract default values from PDF fields for react-hook-form initialization
 * This preserves the AI-extracted values as form defaults
 */
export function extractDefaultValues(fields: PDFField[]): Record<string, any> {
  const defaults: Record<string, any> = {};
  
  for (const field of fields) {
    // Use the AI-extracted value as the default
    defaults[field.id] = field.value;
  }
  
  return defaults;
}

/**
 * Validate a single field value against its type
 * Used for real-time validation during user input
 */
export function validateFieldValue(
  value: any, 
  field: PDFField
): { isValid: boolean; error?: string } {
  try {
    const schema = buildFormSchema([field]);
    schema.parse({ [field.id]: value });
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.issues.find(issue => issue.path[0] === field.id);
      return { 
        isValid: false, 
        error: fieldError?.message || 'Invalid value' 
      };
    }
    return { 
      isValid: false, 
      error: 'Validation error' 
    };
  }
}