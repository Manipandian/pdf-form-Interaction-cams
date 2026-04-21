'use client'

import { motion } from "framer-motion";
import { useFormStore } from "@/lib/store";
import { FileUpload } from "./file-upload";
import { Header } from "./header";
import { PDFPanel } from "./pdf-panel";
import { FormPanel } from "./form-panel";
import { 
  pageTransitions, 
  layoutTransition,
  staggerContainer,
  staggerItem
} from "@/lib/animations";

export function DashboardLayout() {
  const pdfUrl = useFormStore(state => state.pdfUrl);

  if (!pdfUrl) {
    return (
      <motion.div 
        className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30"
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
      className="h-screen flex flex-col bg-gradient-to-br from-background via-muted/10 to-secondary/20"
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
          <PDFPanel />
        </motion.div>
        
        {/* Right Panel - Dynamic Form */}
        <motion.div 
          className="flex-1 min-w-0"
          variants={staggerItem}
          layout
          layoutId="form-panel"
          transition={layoutTransition}
        >
          <FormPanel />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}