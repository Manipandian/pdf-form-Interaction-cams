'use client'

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormStore } from "@/lib/store";
import { PDFDocument } from "@/components/pdf-viewer";
import { DynamicForm } from "@/components/dynamic-form";
import { FileUpload } from "./file-upload";
import { Header } from "./header";
import { LoadingSkeleton } from "./loading-skeleton";
import { 
  pageTransitions, 
  staggerContainer, 
  staggerItem, 
  sectionReveal,
  layoutTransition
} from "@/lib/animations";

export function DashboardLayout() {
  const [isMobile, setIsMobile] = useState(false);
  
  // Selective subscriptions from Zustand store for performance
  const pdfUrl = useFormStore(state => state.pdfUrl);
  const isAnalyzing = useFormStore(state => state.isAnalyzing);
  const fields = useFormStore(state => state.fields);
  const analysisError = useFormStore(state => state.analysisError);

  /**
   * Enhanced responsive breakpoint detection with performance optimization
   * Mobile breakpoint is set at 1024px (lg) to ensure adequate space for both panels
   */
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkScreenSize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newIsMobile = window.innerWidth < 1024;
        if (newIsMobile !== isMobile) {
          setIsMobile(newIsMobile);
        }
      }, 100); // Debounce resize events for better performance
    };

    // Set initial value
    checkScreenSize();

    // Listen for window resize
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      clearTimeout(timeoutId);
    };
  }, [isMobile]);

  /**
   * Determine current application state for conditional rendering
   */
  const getAppState = () => {
    if (!pdfUrl) return 'upload';
    if (isAnalyzing) return 'analyzing';
    if (analysisError) return 'error';
    if (fields.length === 0) return 'no-fields';
    return 'dashboard';
  };

  const appState = getAppState();

  /**
   * Render enhanced mobile layout with smooth transitions
   */
  const renderMobileLayout = () => {
    if (appState === 'upload') {
      return (
        <motion.div 
          className="h-full flex flex-col"
          variants={pageTransitions}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <Header />
          <div className="flex-1 flex items-center justify-center p-4">
            <FileUpload />
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        className="h-full flex flex-col"
        variants={pageTransitions}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <Header />
        <motion.div
          variants={sectionReveal}
          initial="initial"
          animate="animate"
          className="flex-1"
        >
          <Tabs defaultValue="pdf" className="flex-1 flex flex-col h-full">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
                <TabsTrigger value="pdf">PDF View</TabsTrigger>
                <TabsTrigger value="form">Form Fields</TabsTrigger>
              </TabsList>
            </motion.div>
            
            <AnimatePresence mode="wait">
              <TabsContent value="pdf" className="flex-1 mt-2">
                <motion.div
                  key="pdf-mobile"
                  variants={pageTransitions}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                >
                  {renderPdfPanel()}
                </motion.div>
              </TabsContent>
              
              <TabsContent value="form" className="flex-1 mt-2">
                <motion.div
                  key="form-mobile"
                  variants={pageTransitions}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                >
                  {renderFormPanel()}
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </motion.div>
    );
  };

  /**
   * Render enhanced desktop layout with smooth transitions and stagger animations
   */
  const renderDesktopLayout = () => {
    if (appState === 'upload') {
      return (
        <motion.div 
          className="h-screen flex flex-col"
          variants={pageTransitions}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <Header />
          <div className="flex-1 flex items-center justify-center p-8">
            <FileUpload />
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        className="h-screen flex flex-col"
        variants={pageTransitions}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <Header />
        <motion.div 
          className="flex-1 flex gap-4 p-4 min-h-0"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Left Panel - PDF Viewer */}
          <motion.div 
            className="flex-1 min-w-0"
            variants={staggerItem}
            layout
            layoutId="pdf-panel"
            transition={layoutTransition}
          >
            {renderPdfPanel()}
          </motion.div>
          
          {/* Right Panel - Dynamic Form */}
          <motion.div 
            className="flex-1 min-w-0"
            variants={staggerItem}
            layout
            layoutId="form-panel"
            transition={layoutTransition}
          >
            {renderFormPanel()}
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };

  /**
   * Render PDF panel content with enhanced animations based on current state
   */
  const renderPdfPanel = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={appState}
          variants={pageTransitions}
          initial="initial"
          animate="enter"
          exit="exit"
          className="h-full"
        >
          {(() => {
            switch (appState) {
              case 'analyzing':
                return (
                  <div className="h-full border rounded-lg">
                    <LoadingSkeleton type="pdf" />
                  </div>
                );
              
              case 'error':
                return (
                  <div className="h-full border rounded-lg flex items-center justify-center p-4">
                    <motion.div 
                      className="text-center space-y-4"
                      variants={sectionReveal}
                      initial="initial"
                      animate="animate"
                    >
                      <motion.div 
                        className="text-red-500 text-lg font-semibold"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        Analysis Failed
                      </motion.div>
                      <motion.p 
                        className="text-muted-foreground max-w-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {analysisError || 'Unable to analyze the PDF. Please try uploading a different file.'}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <FileUpload variant="retry" />
                      </motion.div>
                    </motion.div>
                  </div>
                );
              
              case 'no-fields':
                return (
                  <div className="h-full border rounded-lg flex items-center justify-center p-4">
                    <motion.div 
                      className="text-center space-y-4"
                      variants={sectionReveal}
                      initial="initial"
                      animate="animate"
                    >
                      <motion.div 
                        className="text-yellow-600 text-lg font-semibold"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        No Form Fields Found
                      </motion.div>
                      <motion.p 
                        className="text-muted-foreground max-w-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        The AI analysis completed but did not detect any form fields in this PDF. 
                        Try uploading a form document with fillable fields.
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <FileUpload variant="retry" />
                      </motion.div>
                    </motion.div>
                  </div>
                );
              
              case 'dashboard':
                return (
                  <motion.div 
                    className="h-full border rounded-lg overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    {pdfUrl && <PDFDocument fileUrl={pdfUrl} />}
                  </motion.div>
                );
              
              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  /**
   * Render form panel content with enhanced animations based on current state
   */
  const renderFormPanel = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={appState}
          variants={pageTransitions}
          initial="initial"
          animate="enter"
          exit="exit"
          className="h-full"
        >
          {(() => {
            switch (appState) {
              case 'analyzing':
                return (
                  <div className="h-full border rounded-lg">
                    <LoadingSkeleton type="form" />
                  </div>
                );
              
              case 'error':
              case 'no-fields':
                return (
                  <div className="h-full border rounded-lg flex items-center justify-center p-4">
                    <motion.div 
                      className="text-center text-muted-foreground"
                      variants={sectionReveal}
                      initial="initial"
                      animate="animate"
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
              
              case 'dashboard':
                return (
                  <motion.div 
                    className="h-full border rounded-lg overflow-hidden"
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
  };

  // Render appropriate layout based on screen size
  return isMobile ? renderMobileLayout() : renderDesktopLayout();
}