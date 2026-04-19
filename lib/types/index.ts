export interface NormalizedRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface PDFField {
  id: string;
  label: string;
  value: string | number | boolean;
  type: "text" | "number" | "checkbox";
  page: number;
  confidence: number;
  normalizedRect: NormalizedRect;
}

export interface AnalysisResult {
  fields: PDFField[];
  pageCount: number;
  pageWidth: number;
  pageHeight: number;
}

export interface AnalysisError {
  message: string;
  code: string;
}

// Utility types for form handling
export type FieldType = PDFField["type"];
export type FieldValue = PDFField["value"];

// Pixel coordinates type for UI positioning
export interface PixelRect {
  top: number;
  left: number;
  width: number;
  height: number;
}