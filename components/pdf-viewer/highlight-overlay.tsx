'use client'

import { motion } from "framer-motion";
import { useFormStore } from "@/lib/store";
import { fieldFocus, layoutTransition, buttonTap } from "@/lib/animations";
import type { PDFField } from "@/lib/types";

interface HighlightOverlayProps {
  field: PDFField;
  isActive: boolean;
}

export function HighlightOverlay({ field, isActive }: HighlightOverlayProps) {
  const setActiveField = useFormStore(state => state.setActiveField);

  /**
   * Handle click on overlay to sync with form panel
   * This enables PDF -> Form direction of synchronization
   */
  const handleClick = () => {
    setActiveField(field.id);
  };

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
    cursor: 'pointer',
    pointerEvents: 'auto' as const,
  };

  return (
    <motion.div
      id={`highlight-${field.id}`}
      style={overlayStyle}
      onClick={handleClick}
      className={`
        rounded-sm cursor-pointer transition-all duration-200
        ${isActive 
          ? 'border-2 border-blue-500' 
          : 'border border-transparent hover:border-blue-400/60'
        }
      `}
      // Enhanced animations using centralized animation system
      variants={fieldFocus}
      initial="initial"
      animate={isActive ? "active" : "initial"}
      whileHover={!isActive ? "focused" : undefined}
      whileTap={buttonTap}
      
      // Layout animation for smooth position changes during PDF zoom/resize
      layout
      layoutId={`highlight-${field.id}`}
      transition={layoutTransition}
      
      // Accessibility attributes
      role="button"
      tabIndex={0}
      aria-label={`Form field: ${field.label}. Confidence: ${Math.round(field.confidence * 100)}%`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Optional: Show field label on hover for debugging/development */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="absolute -top-6 left-0 bg-black text-white text-xs px-1 py-0.5 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
          style={{ fontSize: '10px' }}
        >
          {field.label} ({Math.round(field.confidence * 100)}%)
        </div>
      )}
    </motion.div>
  );
}