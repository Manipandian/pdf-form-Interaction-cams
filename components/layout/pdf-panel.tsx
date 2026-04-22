'use client'

import { motion, AnimatePresence } from "framer-motion";
import { useFormStore } from "@/lib/store";
import { PDFDocument } from "@/components/pdf-viewer";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { pageTransitions } from "@/lib/animations";

export function PDFPanel() {
  const pdfUrl = useFormStore(state => state.pdfUrl);
  const isAnalyzing = useFormStore(state => state.isAnalyzing);
  const analysisError = useFormStore(state => state.analysisError);
  const fields = useFormStore(state => state.fields);
  const reset = useFormStore(state => state.reset);

  /**
   * Get current application state
   */
  const getAppState = () => {
    if (!pdfUrl) return 'upload';
    if (isAnalyzing) return 'analyzing';
    if (analysisError) return 'error';
    if (fields.length === 0) return 'no-fields';
    return 'dashboard';
  };

  /**
   * Render loading overlay for PDF analysis
   */
  const renderLoadingOverlay = () => (
    <LoadingState
      message="Analyzing PDF..."
      description="Field highlights will appear soon"
      isOverlay
      isVisible={isAnalyzing}
    />
  );

  /**
   * Render PDF container with loading overlay
   */
  const renderPDFContainer = () => {
    return (
      <div className="h-full border rounded-lg relative overflow-hidden">
        {pdfUrl && <PDFDocument fileUrl={pdfUrl} />}
        {renderLoadingOverlay()}
      </div>
    );
  };

  const renderPlaceholderState = (title: string, message: string, titleColor: string) => {
    return (
      <div className="h-full border rounded-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm shadow-sm flex items-center justify-center p-4">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className={`${titleColor} text-lg font-semibold`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.div>
          <motion.p 
            className="text-muted-foreground max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Button 
              type="button"
              onClick={reset}
              variant="outline" 
              className="gap-2"
              aria-label="Reset application and try another PDF"
            >
              <RefreshCw className="h-4 w-4" />
              Try Another PDF
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  };

  const appState = getAppState();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`pdf-panel-${appState}`}
        variants={pageTransitions}
        initial="initial"
        animate="enter"
        exit="exit"
        className="h-full"
      >
        {(() => {
          switch (appState) {
            case 'analyzing':
              return renderPDFContainer();
            case 'error':
              return renderPlaceholderState('Analysis Failed', analysisError || 'Unable to analyze the PDF. Please try uploading a different file.', 'text-red-500');
            
            case 'no-fields':
              return renderPlaceholderState('No Form Fields Found', 'The AI analysis completed but did not detect any form fields in this PDF. Try uploading a form document with fillable fields.', 'text-yellow-600');
            
            case 'dashboard':
              return (
                  <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="h-full"
                >
                  {renderPDFContainer()}
                </motion.div>
              );
            
            default:
              return null;
          }
        })()}
      </motion.div>
    </AnimatePresence>
  );
}