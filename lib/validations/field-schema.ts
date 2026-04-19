import { z } from "zod";

export const normalizedRectSchema = z.object({
  top: z.number().min(0).max(1),
  left: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
});

export const pdfFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  type: z.enum(["text", "number", "checkbox"]),
  page: z.number().int().positive(),
  confidence: z.number().min(0).max(1),
  normalizedRect: normalizedRectSchema,
});

export const analysisResultSchema = z.object({
  fields: z.array(pdfFieldSchema),
  pageCount: z.number().int().positive(),
  pageWidth: z.number().positive(),
  pageHeight: z.number().positive(),
});