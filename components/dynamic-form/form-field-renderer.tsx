'use client'

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormStore } from "@/lib/store";
import { fieldFocus, layoutTransition, errorShake } from "@/lib/animations";
import type { PDFField } from "@/lib/types";

interface FormFieldRendererProps {
  field: PDFField;
  isActive: boolean;
}

/**
 * Reusable field wrapper component with enhanced animations
 */
interface FieldWrapperProps {
  children: React.ReactNode;
  field: PDFField;
  isActive: boolean;
  fieldError?: string;
}

function FieldWrapper({ children, field, isActive, fieldError }: FieldWrapperProps) {
  return (
    <motion.div
      id={`form-field-${field.id}`}
      className="space-y-2 p-3 rounded-lg border bg-gradient-to-br from-card to-card/80 hover:from-accent/20 hover:to-accent/10 shadow-sm hover:shadow-md transition-all"
      variants={fieldFocus}
      initial="initial"
      animate={
        fieldError 
          ? errorShake 
          : isActive 
            ? "active" 
            : "initial"
      }
      whileHover={!isActive && !fieldError ? "focused" : undefined}
      layout
      layoutId={`form-field-${field.id}`}
      transition={layoutTransition}
    >
      {/* Field label with confidence badge */}
      <div className="flex items-center gap-2">
        <Label 
          htmlFor={field.id}
          className="text-sm font-medium text-gray-900"
        >
          {field.label}
        </Label>
      </div>
      
      {children}
      
      {/* Error message display */}
      {fieldError && (
        <p className="text-sm text-red-600" role="alert">
          {fieldError}
        </p>
      )}
    </motion.div>
  );
}

export function FormFieldRenderer({ field, isActive }: FormFieldRendererProps) {
  const { register, formState: { errors }, watch, setValue } = useFormContext();
  const setActiveField = useFormStore(state => state.setActiveField);
  
  // Watch the current field value for changes
  const currentValue = watch(field.id);

  /**
   * Handle focus events to sync with PDF viewer
   * This enables Form -> PDF direction of synchronization
   */
  const handleFocus = () => {
    setActiveField(field.id);
  };

  /**
   * Handle blur events to clear active field
   */
  const handleBlur = () => {
    setActiveField(null);
  };


  /**
   * Get field error message from react-hook-form
   */
  const fieldError = errors[field.id]?.message as string | undefined;

  // Render different field types
  switch (field.type) {
    case "text": {
      return (
        <FieldWrapper field={field} isActive={isActive} fieldError={fieldError}>
          <Input
            id={field.id}
            type="text"
            {...register(field.id)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`
              transition-all duration-200
              ${isActive ? 'ring-2 ring-blue-500 border-blue-500' : ''}
              ${fieldError ? 'border-red-500 focus:ring-red-500' : ''}
            `}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            aria-describedby={fieldError ? `${field.id}-error` : undefined}
          />
        </FieldWrapper>
      );
    }

    case "number": {
      return (
        <FieldWrapper field={field} isActive={isActive} fieldError={fieldError}>
          <Input
            id={field.id}
            type="number"
            step="0.01"
            {...register(field.id)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`
              transition-all duration-200
              ${isActive ? 'ring-2 ring-blue-500 border-blue-500' : ''}
              ${fieldError ? 'border-red-500 focus:ring-red-500' : ''}
            `}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            aria-describedby={fieldError ? `${field.id}-error` : undefined}
          />
        </FieldWrapper>
      );
    }

    case "checkbox": {
      return (
        <FieldWrapper field={field} isActive={isActive} fieldError={fieldError}>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={currentValue}
              onCheckedChange={(checked) => {
                setValue(field.id, checked);
                setActiveField(field.id);
                
                // Clear active field after a brief delay for checkbox interactions
                setTimeout(() => setActiveField(null), 1000);
              }}
              className={`
                transition-all duration-200
                ${isActive ? 'ring-2 ring-blue-500' : ''}
                ${fieldError ? 'border-red-500' : ''}
              `}
              aria-describedby={fieldError ? `${field.id}-error` : undefined}
            />
            <Label 
              htmlFor={field.id}
              className="text-sm text-gray-700 cursor-pointer"
            >
              {currentValue ? 'Checked' : 'Unchecked'}
            </Label>
          </div>
        </FieldWrapper>
      );
    }

    default: {
      // Fallback for unknown field types
      return (
        <FieldWrapper field={field} isActive={isActive} fieldError={fieldError}>
          <div className="text-sm text-gray-500">
            Unknown field type: {field.type}
          </div>
        </FieldWrapper>
      );
    }
  }
}