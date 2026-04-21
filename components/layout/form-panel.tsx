'use client'

import { motion, AnimatePresence } from "framer-motion";
import { useFormStore } from "@/lib/store";
import { DynamicForm } from "@/components/dynamic-form";
import { pageTransitions } from "@/lib/animations";
import { LoadingState } from "@/components/ui/loading-state";

export function FormPanel() {
  const pdfUrl = useFormStore(state => state.pdfUrl);
  const isAnalyzing = useFormStore(state => state.isAnalyzing);
  const analysisError = useFormStore(state => state.analysisError);
  const fields = useFormStore(state => state.fields);

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


  const renderAnalysisSpinner = () => (
    <LoadingState
      message="Analyzing document..."
      description="Extracting form fields"
    />
  );

  /**
   * Render placeholder for empty/error states
   */
  const renderPlaceholderState = () => (
    <div className="h-full border rounded-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm shadow-sm flex items-center justify-center p-4">
      <motion.div 
        className="text-center text-muted-foreground"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Form fields will appear here after successful PDF analysis
        </motion.p>
      </motion.div>
    </div>
  );

  const appState = getAppState();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`form-panel-${appState}`}
        variants={pageTransitions}
        initial="initial"
        animate="enter"
        exit="exit"
        className="h-full"
      >
        {(() => {
          switch (appState) {
            case 'analyzing':
              return renderAnalysisSpinner();
            
            case 'error':
            case 'no-fields':
              return renderPlaceholderState();
            
            case 'dashboard':
              return (
                <motion.div 
                  className="h-full border rounded-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm shadow-sm overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <DynamicForm />
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