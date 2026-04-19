'use client'

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Zap } from "lucide-react";
import { useFormStore } from "@/lib/store";
import { FileUpload } from "./file-upload";
import { buttonTap, layoutTransition, sectionReveal, successPulse } from "@/lib/animations";

export function Header() {
  // Selective subscriptions from Zustand store
  const pdfFile = useFormStore(state => state.pdfFile);
  const fields = useFormStore(state => state.fields);
  const isAnalyzing = useFormStore(state => state.isAnalyzing);
  const totalPages = useFormStore(state => state.totalPages);

  /**
   * Calculate average confidence score for display
   */
  const averageConfidence = fields.length > 0 
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
      className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
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
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={buttonTap}
          >
            <motion.div 
              className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-md"
              whileHover={{ 
                rotate: 360,
                backgroundColor: "#2563eb"
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
            {fields.length > 0 && (
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
          {/* Analysis status */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground"
              >
                <motion.div 
                  className="w-2 h-2 bg-blue-600 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.span
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Analyzing...
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload new file button - only show if already have a file */}
          <AnimatePresence>
            {pdfFile && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                whileTap={buttonTap}
              >
                <FileUpload variant="retry" />
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
        {fields.length > 0 && (
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