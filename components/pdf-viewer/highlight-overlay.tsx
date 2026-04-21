'use client'

import { motion } from "framer-motion";
import { fieldFocus, layoutTransition } from "@/lib/animations";
import type { PDFField } from "@/lib/types";

interface HighlightOverlayProps {
  field: PDFField;
  isActive: boolean;
}

export function HighlightOverlay({ field, isActive }: HighlightOverlayProps) {

  /**
   * Convert normalized coordinates (0-1) to CSS percentage values
   * This ensures overlays align perfectly with PDF content regardless of zoom level
   */
  const overlayStyle = {
    position: 'absolute' as const,
    top: `${field.normalizedRect.top * 100}%`,
    left: `${field.normalizedRect.left * 100}%`,
    width: `${field.normalizedRect.width * 100}%`,
    height: `${field.normalizedRect.height * 100}%`,
  };

  return (
    <motion.div
      data-field-id={field.id}
      style={overlayStyle}
      className={`
        rounded-sm transition-all duration-200
        ${isActive 
          ? 'border-2 border-blue-500' 
          : 'border border-transparent'
        }
      `}
      // Enhanced animations using centralized animation system
      variants={fieldFocus}
      initial="initial"
      animate={isActive ? "active" : "initial"}
      
      // Layout animation for smooth position changes during PDF zoom/resize
      layout
      layoutId={`highlight-${field.id}`}
      transition={layoutTransition}
    >
    </motion.div>
  );
}