'use client'

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useFormStore } from "@/lib/store";
import type { PDFField } from "@/lib/types";
import { 
  cardHover, 
  buttonTap, 
  sectionReveal
} from "@/lib/animations";
import { toast } from "sonner";


// File size and type constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_TYPES = ['application/pdf'];

export function FileUpload() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selective subscriptions from Zustand store
  const isAnalyzing = useFormStore(state => state.isAnalyzing);
  const setPdfFile = useFormStore(state => state.setPdfFile);
  const setPdfUrl = useFormStore(state => state.setPdfUrl);
  const setIsAnalyzing = useFormStore(state => state.setIsAnalyzing);
  const setAnalysisError = useFormStore(state => state.setAnalysisError);
  const setFields = useFormStore(state => state.setFields);
  const processingMode = useFormStore(state => state.processingMode);

  

  /**
   * Validate uploaded file meets requirements
   */
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Only PDF files are supported. Selected: ${file.type}`
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = Math.round(file.size / (1024 * 1024) * 100) / 100;
      return {
        isValid: false,
        error: `File size (${sizeMB}MB) exceeds the 10MB limit`
      };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        error: 'Empty file. Please select a valid PDF file'
      };
    }

    return { isValid: true };
  }, []);

  /**
   * Upload file to analysis API
   */
  const uploadFile = useCallback(async (file: File): Promise<void> => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      setUploadProgress(10);

      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('processingMode', processingMode);

      setUploadProgress(30);

      // Send to analysis API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(60);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setUploadProgress(80);

      // Store results in Zustand
      setFields(result.fields);
      
      setUploadProgress(100);

      // Show success toast
      toast.success(`Analysis complete! Found ${result.fields.length} form fields`, {
        description: `Confidence: ${Math.round(
          result.fields.reduce((sum: number, field: PDFField) => sum + field.confidence, 0) / 
          result.fields.length * 100
        )}%`
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAnalysisError(errorMessage);
      
      // Show error toast
      toast.error('Analysis failed', {
        description: errorMessage
      });
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  }, [setIsAnalyzing, setAnalysisError, setFields, setUploadProgress, processingMode]);

  /**
   * Handle file processing (validation + upload)
   */
  const processFile = useCallback(async (file: File) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      toast.error('Invalid file', {
        description: validation.error
      });
      return;
    }

    // Create object URL for PDF display
    const fileUrl = URL.createObjectURL(file);
    
    // Store file and URL in state
    setPdfFile(file);
    setPdfUrl(fileUrl);

    // Upload for analysis
    await uploadFile(file);
  }, [setPdfFile, setPdfUrl, validateFile, uploadFile]);

  /**
   * Handle drag and drop events
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  /**
   * Trigger file input dialog
   */
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);


  return (
    <motion.div 
      variants={sectionReveal}
      initial="initial"
      animate="animate"
    >
      <motion.div
        variants={cardHover}
        initial="initial"
        whileHover="hover"
        whileTap={buttonTap}
      >
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <motion.div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              animate={{
                scale: isDragOver ? 1.05 : 1,
                borderColor: isDragOver ? '#3b82f6' : '#e5e7eb',
                backgroundColor: isDragOver ? '#eff6ff' : '#ffffff',
              }}
              transition={{ 
                duration: 0.2,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="border-2 border-dashed rounded-lg p-8 text-center space-y-4 cursor-pointer"
              onClick={handleUploadClick}
            >
          {/* Upload icon with enhanced animation */}
          <motion.div
            animate={{ 
              y: isDragOver ? -15 : 0,
              scale: isDragOver ? 1.1 : 1,
              rotate: isDragOver ? [0, -5, 5, 0] : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              rotate: isDragOver ? { repeat: Infinity, duration: 0.5 } : {}
            }}
            className="flex justify-center text-gray-500"
          >
            <Upload className={`h-16 w-16 transition-colors ${isDragOver ? 'text-blue-500' : ''}`} />
          </motion.div>

          {/* Main heading */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              {isDragOver ? 'Drop your PDF here' : 'Upload PDF Form'}
            </h3>
            <p className="text-muted-foreground">
              Drag and drop your PDF file here, or click to browse
            </p>
          </div>

          {/* File requirements */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDF only
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Max 10MB
            </div>
          </div>

          {/* Upload button with enhanced animations */}
          <motion.div
            whileTap={buttonTap}
            whileHover={{ scale: 1.02 }}
          >
            <Button 
              size="lg" 
              disabled={isAnalyzing}
              className="gap-2 min-w-[160px]"
              onClick={(e) => {
                e.stopPropagation();
                handleUploadClick();
              }}
            >
              <motion.div
                animate={isAnalyzing ? { rotate: 360 } : {}}
                transition={isAnalyzing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <Upload className="h-4 w-4" />
              </motion.div>
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {isAnalyzing ? 'Analyzing Document...' : 'Select File'}
              </motion.span>
            </Button>
          </motion.div>

          {/* Enhanced progress bar */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-3"
              >
                <div className="relative">
                  <Progress value={uploadProgress} className="w-full h-3" />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-80"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <motion.p 
                  className="text-sm text-muted-foreground text-center"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  AI is analyzing your document for form fields...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Select PDF file for analysis"
          />
        </motion.div>

        {/* Instructions with stagger animation */}
        <motion.div 
          className="mt-6 space-y-3 text-sm text-muted-foreground"
          variants={{
            initial: {},
            animate: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
              },
            },
          }}
          initial="initial"
          animate="animate"
        >
          {[
            "Upload a PDF form (bank forms, applications, surveys, etc.)",
            "AI will automatically detect and extract form fields", 
            "Edit field values and see them highlighted in the PDF"
          ].map((instruction, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-2"
              variants={{
                initial: { opacity: 0, x: -20 },
                animate: { 
                  opacity: 1, 
                  x: 0,
                  transition: { duration: 0.3, ease: "easeOut" }
                },
              }}
            >
              <span className="font-medium text-foreground">{index + 1}.</span>
              <span>{instruction}</span>
            </motion.div>
          ))}
        </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}