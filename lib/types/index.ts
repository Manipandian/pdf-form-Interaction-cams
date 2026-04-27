import z from "zod";
import { analysisResultSchema, normalizedRectSchema, pdfFieldSchema } from "../validations/field-schema";

export type NormalizedRect = z.infer<typeof normalizedRectSchema>;

export type PDFField = z.infer<typeof pdfFieldSchema>;

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

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