'use client'

import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "./spinner";

interface LoadingStateProps {
  /**
   * Primary loading message
   */
  message: string;
  /**
   * Secondary descriptive text (optional)
   */
  description?: string;
  /**
   * Whether to render as an overlay (absolute positioning)
   */
  isOverlay?: boolean;
  /**
   * Whether the loading state is visible (for overlay mode)
   */
  isVisible?: boolean;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

export function LoadingState({
  message,
  description,
  isOverlay = false,
  isVisible = true,
  className = ""
}: LoadingStateProps) {
  const content = (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Spinner className="w-8 h-8 mx-auto mb-3" />
      <motion.p 
        className="text-sm font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
      {description && (
        <motion.p 
          className="text-xs text-muted-foreground mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );

  if (isOverlay) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className={`h-full border rounded-lg flex items-center justify-center p-8 ${className}`}>
      {content}
    </div>
  );
}