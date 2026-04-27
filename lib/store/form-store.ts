import { create } from "zustand";
import type { PDFField } from "@/lib/types";
import { clearFieldSchemaCache } from "@/lib/validations/form-validation";

export type ProcessingMode = "azure" | "llm";

interface FormState {
  fields: PDFField[];
  activeFieldId: string | null;
  pdfFile: File | null;
  pdfUrl: string | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  currentPage: number;
  totalPages: number;
  processingMode: ProcessingMode;
}

interface FormActions {
  setFields: (fields: PDFField[]) => void;
  setActiveField: (id: string | null) => void;
  updateFieldValue: (id: string, value: string | number | boolean) => void;
  setPdfFile: (file: File | null) => void;
  setPdfUrl: (url: string | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setProcessingMode: (mode: ProcessingMode) => void;
  reset: () => void;
}

type FormStore = FormState & FormActions;

const initialState: FormState = {
  fields: [],
  activeFieldId: null,
  pdfFile: null,
  pdfUrl: null,
  isAnalyzing: false,
  analysisError: null,
  currentPage: 1,
  totalPages: 0,
  processingMode: "azure", // Default to Azure Document Intelligence
};

export const useFormStore = create<FormStore>((set) => ({
  ...initialState,

  setFields: (fields: PDFField[]) => set({ 
    fields: Array.isArray(fields) ? fields : [] 
  }),

  setActiveField: (id: string | null) => set({ activeFieldId: id }),

  updateFieldValue: (id: string, value: string | number | boolean) =>
    set((state) => ({
      fields: state.fields.map((field) =>
        field.id === id ? { ...field, value } : field
      ),
    })),

  setPdfFile: (file: File | null) => set({ pdfFile: file }),

  setPdfUrl: (url: string | null) => set({ pdfUrl: url }),

  setIsAnalyzing: (isAnalyzing: boolean) => set({ isAnalyzing }),

  setAnalysisError: (error: string | null) => set({ analysisError: error }),

  setCurrentPage: (page: number) => set({ currentPage: page }),

  setTotalPages: (total: number) => set({ totalPages: total }),

  setProcessingMode: (mode: ProcessingMode) => set({ processingMode: mode }),

  reset: () => {
    clearFieldSchemaCache(); // Clear validation cache when resetting
    set(initialState);
  },
}));

/*
 * PERFORMANCE NOTE: Always use selective subscriptions to prevent unnecessary re-renders
 * 
 * ✅ Good - selective subscription:
 * const activeFieldId = useFormStore(state => state.activeFieldId);
 * 
 * ❌ Bad - subscribes to entire store:
 * const store = useFormStore();
 * const activeFieldId = store.activeFieldId;
 * 
 * This is especially important for components that render frequently like PDF viewers
 * and form fields to prevent performance issues.
 */