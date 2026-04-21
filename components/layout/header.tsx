'use client'

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Zap, Brain, Bot, RefreshCw } from "lucide-react";
import { useFormStore, ProcessingMode } from "@/lib/store";
import { buttonTap, layoutTransition, sectionReveal, successPulse } from "@/lib/animations";
import { analyzePDF } from "@/lib/services/pdf-analysis";

// Processing mode options data
const PROCESSING_MODES = [
  {
    value: "azure" as ProcessingMode,
    label: "Azure Document AI",
    icon: Brain,
    iconColor: "text-blue-600",
    description: "Microsoft Azure AI Document Intelligence"
  },
  {
    value: "llm" as ProcessingMode, 
    label: "With LLM (Gemini)",
    icon: Bot,
    iconColor: "text-purple-600",
    description: "Google Gemini 2.5 Flash with enhanced intelligence"
  }
] as const;

export function Header() {
  // Selective subscriptions from Zustand store
  const pdfFile = useFormStore(state => state.pdfFile);
  const fields = useFormStore(state => state.fields);
  const isAnalyzing = useFormStore(state => state.isAnalyzing);
  const totalPages = useFormStore(state => state.totalPages);
  const processingMode = useFormStore(state => state.processingMode);
  const setProcessingMode = useFormStore(state => state.setProcessingMode);
  const setAnalyzing = useFormStore(state => state.setIsAnalyzing);
  const setFields = useFormStore(state => state.setFields);
  const setError = useFormStore(state => state.setAnalysisError);
  const reset = useFormStore(state => state.reset);

  /**
   * Handle processing mode change and trigger re-analysis if file exists
   */
  const handleProcessingModeChange = async (value: ProcessingMode) => {
    setProcessingMode(value);
    
    // If we already have a file and fields, trigger re-analysis with new mode
    if (pdfFile) {
      setAnalyzing(true);
      setFields([]); // Clear existing fields
      setError(null); // Clear any existing errors
      
      await analyzePDF({
        file: pdfFile,
        processingMode: value,
        showToasts: false, // Header doesn't show toasts
        onSuccess: (newFields) => {
          setFields(newFields);
        },
        onError: (error) => {
          setFields([]); // Ensure fields remains an array even on error
          setError(error);
        }
      });

      setAnalyzing(false);
    }
  };

  /**
   * Calculate average confidence score for display
   * Defensive check: ensure fields is always an array
   */
  const averageConfidence = (fields && Array.isArray(fields) && fields.length > 0)
    ? Math.round(fields.reduce((sum, field) => sum + field.confidence, 0) / fields.length * 100)
    : 0;

  /**
   * Get confidence badge variant based on score
   */
  const getConfidenceBadgeVariant = (confidence: number): "default" | "secondary" | "destructive" => {
    if (confidence >= 90) return "default";
    if (confidence >= 75) return "secondary";
    return "destructive";
  };

  return (
    <motion.header 
      className="border-b bg-gradient-to-r from-card via-card/95 to-card/90 backdrop-blur-md shadow-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Logo and title */}
        <motion.div 
          className="flex items-center gap-3"
          variants={sectionReveal}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            className="flex items-center gap-2 hover-bounce"
            whileHover={{ scale: 1.05 }}
            whileTap={buttonTap}
          >
            <motion.div 
              className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-md shadow-lg"
              whileHover={{ 
                rotate: 360,
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                scale: 1.1
              }}
              transition={{ duration: 0.3 }}
            >
              <Zap className="h-4 w-4 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold">AI PDF Forms</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Intelligent form field extraction
              </p>
            </div>
          </motion.div>

          {/* Document info - show if PDF is loaded */}
          <AnimatePresence>
            {pdfFile && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2"
              >
                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                <motion.div 
                  className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground"
                  layout
                  layoutId="document-info"
                  transition={layoutTransition}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <FileText className="h-4 w-4" />
                  </motion.div>
                  <motion.span 
                    className="max-w-[200px] truncate" 
                    title={pdfFile.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {pdfFile.name}
                  </motion.span>
                  {totalPages > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                    >
                      <Badge variant="outline" className="text-xs">
                        {totalPages} page{totalPages !== 1 ? 's' : ''}
                      </Badge>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analysis results - show if fields are detected */}
          <AnimatePresence>
            {fields && Array.isArray(fields) && fields.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2"
              >
                <Separator orientation="vertical" className="h-6 hidden md:block" />
                <motion.div 
                  className="hidden md:flex items-center gap-2 text-sm"
                  layout
                  layoutId="analysis-results"
                  transition={layoutTransition}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge variant="outline">
                      {fields.length} field{fields.length !== 1 ? 's' : ''}
                    </Badge>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={successPulse}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge variant={getConfidenceBadgeVariant(averageConfidence)} className="text-xs">
                      {averageConfidence}% confidence
                    </Badge>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right side - Actions */}
        <motion.div 
          className="flex items-center gap-2"
          variants={sectionReveal}
          initial="initial"
          animate="animate"
        >
          {/* Processing Mode Selector */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden sm:block"
          >
            <Select 
                value={processingMode} 
                onValueChange={handleProcessingModeChange}
                disabled={isAnalyzing}
              >
              <SelectTrigger className="w-44 h-8 text-xs bg-gradient-to-r from-card to-card/90 border-border hover:border-primary/50 shadow-sm">
                <SelectValue placeholder="Choose AI Engine" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-to-br from-card to-card/95 border shadow-lg backdrop-blur-sm">
                {PROCESSING_MODES.map((mode) => {
                  const IconComponent = mode.icon;
                  return (
                    <SelectItem 
                      key={mode.value} 
                      value={mode.value}
                      className="focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className={`h-3 w-3 ${mode.iconColor}`} />
                        <span>{mode.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Upload new file button - only show if already have a file */}
          <AnimatePresence>
            {pdfFile && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                whileTap={buttonTap}
                whileHover={{ scale: 1.02 }}
              >
                <Button 
                  onClick={reset}
                  disabled={isAnalyzing}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-secondary to-secondary/80 hover:from-accent hover:to-accent/80 border-border hover:border-primary/50 shadow-sm hover:shadow-md transition-all"
                  aria-label="Reset application and try another PDF"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Another PDF
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile document info */}
          <AnimatePresence>
            {pdfFile && (
              <motion.div 
                className="sm:hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileTap={buttonTap}
              >
                <Button variant="ghost" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">
                    {pdfFile.name}
                  </span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Mobile analysis results - show below header on small screens */}
      <AnimatePresence>
        {fields && Array.isArray(fields) && fields.length > 0 && (
          <motion.div 
            className="sm:hidden border-t px-4 py-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="flex items-center justify-between text-sm"
              variants={sectionReveal}
              initial="initial"
              animate="animate"
            >
              <motion.div 
                className="flex items-center gap-2"
                variants={sectionReveal}
                initial="initial"
                animate="animate"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                >
                  <Badge variant="outline" className="text-xs">
                    {fields.length} field{fields.length !== 1 ? 's' : ''}
                  </Badge>
                </motion.div>
                {totalPages > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  >
                    <Badge variant="outline" className="text-xs">
                      {totalPages} page{totalPages !== 1 ? 's' : ''}
                    </Badge>
                  </motion.div>
                )}
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={successPulse}
                transition={{ delay: 0.3 }}
              >
                <Badge variant={getConfidenceBadgeVariant(averageConfidence)} className="text-xs">
                  {averageConfidence}% confidence
                </Badge>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}