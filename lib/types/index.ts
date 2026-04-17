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