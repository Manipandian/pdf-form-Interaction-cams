'use client'

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, FileText, Target } from "lucide-react";
import { useFormStore } from "@/lib/store";
import { extractDefaultValues } from "@/lib/validations/form-validation";
import { useFormContext } from "react-hook-form";

export function FormHeader() {
  const fields = useFormStore(state => state.fields);
  const { reset } = useFormContext();

  /**
   * Calculate average confidence score across all fields
   * This gives users an indication of AI extraction quality
   */
  const averageConfidence = useMemo(() => {
    if (fields.length === 0) return 0;
    
    const totalConfidence = fields.reduce((sum, field) => sum + field.confidence, 0);
    return Math.round((totalConfidence / fields.length) * 100);
  }, [fields]);

  /**
   * Get confidence badge variant based on score
   */
  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 90) return "default"; // Green
    if (confidence >= 75) return "secondary"; // Yellow
    return "destructive"; // Red
  };

  /**
   * Get field type distribution for summary
   */
  const fieldTypeStats = useMemo(() => {
    const stats = fields.reduce((acc, field) => {
      acc[field.type] = (acc[field.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  }, [fields]);

  /**
   * Reset form to AI-extracted default values
   */
  const handleResetForm = () => {
    const defaultValues = extractDefaultValues(fields);
    reset(defaultValues);
  };

  return (
    <div className="border-b bg-background/50 backdrop-blur-sm">
      <div className="p-4 space-y-4">
        {/* Header title and stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Form Fields</h2>
            <Badge variant="outline" className="ml-2">
              {fields.length} field{fields.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Reset button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetForm}
            className="gap-2"
            title="Reset all fields to AI-extracted values"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Summary information */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {/* Average confidence */}
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>AI Confidence:</span>
            <Badge 
              variant={getConfidenceBadgeVariant(averageConfidence)}
              className="text-xs"
            >
              {averageConfidence}%
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-4" />

          {/* Field type breakdown */}
          <div className="flex items-center gap-2">
            <span>Types:</span>
            {Object.entries(fieldTypeStats).map(([type, count]) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {count} {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Confidence warning for low scores */}
        {averageConfidence < 75 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Low AI confidence detected.</strong> Please review the extracted values carefully 
              and make corrections as needed. Consider using a higher quality PDF scan for better results.
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>How to use:</strong> Click on form fields to highlight the corresponding area in the PDF, 
            or click on highlighted areas in the PDF to focus the corresponding form field.
          </p>
        </div>
      </div>
    </div>
  );
}