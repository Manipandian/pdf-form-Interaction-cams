'use client'

import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFormStore } from "@/lib/store";
import { HighlightOverlay } from "./highlight-overlay";
import { usePdfScrollSync } from "./pdf-scroll-sync";

// Configure PDF.js worker for react-pdf v10+
// Using CDN for production compatibility (no need for local pdfjs-dist dependency)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Import required CSS for react-pdf
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

interface PDFDocumentProps {
  fileUrl: string;
}

export function PDFDocument({ fileUrl }: PDFDocumentProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Selective subscriptions from Zustand store for performance
  const fields = useFormStore(state => state.fields);
  const activeFieldId = useFormStore(state => state.activeFieldId);
  const currentPage = useFormStore(state => state.currentPage);
  const setTotalPages = useFormStore(state => state.setTotalPages);
  const setCurrentPage = useFormStore(state => state.setCurrentPage);
  const setPageDimensions = useFormStore(state => state.setPageDimensions);

  // Initialize scroll sync hook for auto-scrolling to active fields
  usePdfScrollSync();

  /**
   * Handle successful PDF document loading
   * Extracts total pages and page dimensions for coordinate calculations
   */
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setTotalPages(numPages);
  }, [setTotalPages]);

  /**
   * Handle individual page load success to extract dimensions
   * This is called for each page and helps with coordinate calculations
   */
  const onPageLoadSuccess = useCallback((page: any) => {
    if (page.pageNumber === 1) {
      // Use first page dimensions for coordinate calculations
      // PDF dimensions are typically in points (72 points = 1 inch)
      const width = page.width / 72; // Convert to inches
      const height = page.height / 72; // Convert to inches
      setPageDimensions(width, height);
    }
  }, [setPageDimensions]);

  /**
   * Handle container resize to maintain responsive PDF rendering
   */
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 32; // Account for padding
        setContainerWidth(Math.max(width, 300)); // Minimum width of 300px
      }
    };

    // Set initial width
    updateContainerWidth();

    // Create ResizeObserver for responsive updates
    const resizeObserver = new ResizeObserver(updateContainerWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  /**
   * Filter fields by page number for rendering overlays
   */
  const getFieldsForPage = useCallback((pageNumber: number) => {
    return fields.filter(field => field.page === pageNumber);
  }, [fields]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <ScrollArea className="h-full">
        <div className="p-4">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => {
              console.error("PDF loading error:", error);
            }}
            className="flex flex-col items-center"
          >
            {/* Render all pages for multi-page support */}
            {Array.from({ length: numPages }, (_, index) => {
              const pageNumber = index + 1;
              const pageFields = getFieldsForPage(pageNumber);

              return (
                <div
                  key={`page_${pageNumber}`}
                  className="relative mb-4 border border-gray-200 shadow-sm"
                  id={`pdf-page-${pageNumber}`}
                >
                  <Page
                    pageNumber={pageNumber}
                    width={containerWidth}
                    onLoadSuccess={onPageLoadSuccess}
                    className="relative"
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                  
                  {/* Render highlight overlays for fields on this page */}
                  <div className="absolute inset-0 pointer-events-none">
                    {pageFields.map((field) => (
                      <HighlightOverlay
                        key={field.id}
                        field={field}
                        isActive={activeFieldId === field.id}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </Document>
          
          {/* Show message if no pages loaded */}
          {numPages === 0 && (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading PDF...</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}