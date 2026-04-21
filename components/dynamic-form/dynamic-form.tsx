'use client'

import { useEffect, useMemo, useState, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useFormStore } from "@/lib/store";
import { buildFormSchema, extractDefaultValues } from "@/lib/validations/form-validation";
import { FormFieldRenderer } from "./form-field-renderer";
import { FormHeader } from "./form-header";

export function DynamicForm() {
  // Selective subscriptions from Zustand store for performance
  const fields = useFormStore(state => state.fields);
  const activeFieldId = useFormStore(state => state.activeFieldId);
  const updateFieldValue = useFormStore(state => state.updateFieldValue);

  /**
   * Build dynamic Zod schema based on current fields
   * Memoized to prevent unnecessary schema rebuilds
   */
  const formSchema = useMemo(() => {
    return (fields && Array.isArray(fields) && fields.length > 0) ? buildFormSchema(fields) : null;
  }, [fields]);

  /**
   * Extract default values from PDF fields
   * Preserves AI-extracted values as form defaults
   */
  const defaultValues = useMemo(() => {
    return extractDefaultValues(fields);
  }, [fields]);

  /**
   * Initialize react-hook-form with dynamic schema and defaults
   */
  const form = useForm({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    defaultValues,
    mode: 'onChange', // Validate on every change for real-time feedback
  });

  const { watch, reset } = form;

  /**
   * Track if we're currently resetting to prevent circular updates
   */
  const [isResetting, setIsResetting] = useState(false);

  /**
   * Watch all form values and sync changes back to Zustand store
   * Only sync when not in reset state to prevent infinite loops
   */
  useEffect(() => {
    const subscription = watch((values) => {
      // Skip updates during reset to prevent infinite loop
      if (isResetting) return;
      
      // Update Zustand store with form changes
      Object.entries(values).forEach(([fieldId, value]) => {
        if (value !== undefined) {
          const currentField = fields?.find(f => f.id === fieldId);
          // Only update if value actually changed and is a valid type
          if (currentField && currentField.value !== value) {
            updateFieldValue(fieldId, value as string | number | boolean);
          }
        }
      });
    });

    return () => subscription.unsubscribe();
  }, [watch, updateFieldValue, fields, isResetting]);

  /**
   * Reset form when new fields are loaded (new PDF analyzed)
   * Use a ref to track the last fields to prevent unnecessary resets
   */
  const lastFieldsLength = useRef(0);
  useEffect(() => {
    const fieldsLength = fields && Array.isArray(fields) ? fields.length : 0;
    if (fieldsLength > 0 && fieldsLength !== lastFieldsLength.current) {
      setIsResetting(true);
      reset(defaultValues);
      lastFieldsLength.current = fieldsLength;
      
      // Clear reset flag after a brief delay
      setTimeout(() => {
        setIsResetting(false);
      }, 100);
    }
  }, [fields, defaultValues, reset]);

  /**
   * Group fields by page number for organized display
   * This makes it easier to navigate large multi-page forms
   */
  const fieldsByPage = useMemo(() => {
    const grouped = fields.reduce((acc, field) => {
      const page = field.page;
      if (!acc[page]) {
        acc[page] = [];
      }
      acc[page].push(field);
      return acc;
    }, {} as Record<number, typeof fields>);

    // Sort fields within each page by their vertical position (top coordinate)
    Object.keys(grouped).forEach(page => {
      grouped[parseInt(page)].sort((a, b) => a.normalizedRect.top - b.normalizedRect.top);
    });

    return grouped;
  }, [fields]);

  /**
   * Get sorted page numbers for consistent rendering order
   */
  const pageNumbers = useMemo(() => {
    return Object.keys(fieldsByPage)
      .map(Number)
      .sort((a, b) => a - b);
  }, [fieldsByPage]);

  // Don't render if no fields available
  if (!fields || !Array.isArray(fields) || fields.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No form fields detected</p>
          <p className="text-sm text-muted-foreground">
            Upload and analyze a PDF to see form fields here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Main form content with FormProvider wrapping everything */}
      <FormProvider {...form}>
        {/* Form header with summary information */}
        <FormHeader />

        {/* Main form content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <form className="space-y-6">
              {pageNumbers.map((pageNumber, pageIndex) => {
                const pageFields = fieldsByPage[pageNumber];
                
                return (
                  <div key={`page-${pageNumber}`} className="space-y-4">
                    {/* Page header (only show if multiple pages) */}
                    {pageNumbers.length > 1 && (
                      <>
                        {pageIndex > 0 && <Separator className="my-6" />}
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Page {pageNumber}
                          </h3>
                          <span className="text-sm text-muted-foreground">
                            ({pageFields.length} field{pageFields.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                      </>
                    )}

                    {/* Render fields for this page */}
                    <div className="space-y-4">
                      {pageFields.map((field) => (
                        <FormFieldRenderer
                          key={field.id}
                          field={field}
                          isActive={activeFieldId === field.id}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </form>
          </div>
        </ScrollArea>
      </FormProvider>
    </div>
  );
}