import { toast } from "sonner";
import type { PDFField } from "@/lib/types";
import type { ProcessingMode } from "@/lib/store";
import { clearFieldSchemaCache } from "@/lib/validations/form-validation";

export interface AnalysisOptions {
  file: File;
  processingMode: ProcessingMode;
  showToasts?: boolean;
  onProgress?: (progress: number) => void;
  onSuccess?: (fields: PDFField[]) => void;
  onError?: (error: string) => void;
}

export interface AnalysisResult {
  success: boolean;
  fields?: PDFField[];
  error?: string;
}

/**
 * Centralized PDF analysis function
 * Handles both initial upload and AI engine switching scenarios
 */
export async function analyzePDF({
  file,
  processingMode,
  showToasts = false,
  onProgress,
  onSuccess,
  onError
}: AnalysisOptions): Promise<AnalysisResult> {
  try {
    // Clear any cached validation schemas from previous PDF
    clearFieldSchemaCache();
    
    // Progress: Starting analysis
    onProgress?.(10);

    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('processingMode', processingMode);

    onProgress?.(30);

    // Send to analysis API
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    onProgress?.(60);

    // Handle API response
    if (!response.ok) {
      let errorMessage: string;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `Analysis failed: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    onProgress?.(80);

    // Validate response format
    if (!result || !Array.isArray(result.fields)) {
      const error = 'Invalid response format from analysis service';
      onError?.(error);
      if (showToasts) {
        toast.error('Analysis failed', { description: error });
      }
      return { success: false, error };
    }

    const fields = result.fields;
    onProgress?.(100);

    // Success callback
    onSuccess?.(fields);

    // Show success toast if enabled
    if (showToasts && fields.length > 0) {
      const avgConfidence = Math.round(
        fields.reduce((sum: number, field: PDFField) => sum + field.confidence, 0) / fields.length * 100
      );
      
      toast.success(`Analysis complete! Found ${fields.length} form fields`, {
        description: `Confidence: ${avgConfidence}%`
      });
    }

    return { success: true, fields };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Something Went Wrong!';
    
    onError?.(errorMessage);
    
    if (showToasts) {
      toast.error('Analysis failed', {
        description: errorMessage
      });
    }

    return { success: false, error: errorMessage };
  }
}